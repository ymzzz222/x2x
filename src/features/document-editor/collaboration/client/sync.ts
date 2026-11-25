import type { SupabaseClient } from "@supabase/supabase-js";
import * as Y from "yjs";
import type { DocumentSession } from "../../model/document-session";
import type { DocumentPosition } from "../../model/document-model";
import { documentRequest, readDocument, SharedDocumentError } from "./client";
import { DocumentOutbox } from "./outbox";
import { DocumentChannel } from "./document-channel";
import { DocumentPresence } from "./document-presence";
import { canEditDocument, decodeUpdate, encodeUpdate, maximumRealtimeUpdateChars, maximumUpdateBytes, sharedSchemaVersion,
  type DocumentRead, type DocumentUpdateNotice, type OfflineBatch, type OnlineCollaborator, type SavedUpdate } from "../model/protocol";

export type DocumentSyncStatus = "saving" | "saved" | "offline" | "retry" | "blocked" | "local-error";
export type DocumentConnection = {
  meta: DocumentRead;
  status: DocumentSyncStatus;
  peers: OnlineCollaborator[];
  accessLost: boolean;
  previousEdits: boolean;
};

type Options = {
  client: SupabaseClient;
  actor: string;
  session: DocumentSession;
  meta: DocumentRead;
  outbox: DocumentOutbox;
  cursorSession: string;
  isComposing: () => boolean;
  report: (connection: DocumentConnection) => void;
  reload: () => void;
};

export const outboxScope = (actor: string, id: string) => actor + ":" + id;

export class SharedDocumentSync {
  private abort = new AbortController();
  private current: DocumentConnection;
  private channel: DocumentChannel;
  private draft?: OfflineBatch;
  private durable = Promise.resolve();
  private unpersisted = new Map<string, OfflineBatch>();
  private localError = false;
  private saveTimer?: number;
  private pullTimer?: number;
  private pulseTimer?: number;
  private pullDelay = 1_000;
  private saveDelay = 1_000;
  private unsubscribe?: () => void;
  private pulling = false;
  private pullQueued = false;
  private saving = false;
  private saveQueued = false;
  private presence: DocumentPresence;
  private compactedAt = 0;

  constructor(private options: Options) {
    const { client, actor, meta, session, cursorSession } = options;
    this.current = { meta, status: "saving", peers: [], accessLost: false, previousEdits: false };
    this.presence = new DocumentPresence({ client, actor, documentId: meta.id, generation: meta.generation, session, cursorSession,
      report: (peers) => this.publish({ peers }), revalidate: () => this.schedulePull() });
    this.channel = new DocumentChannel({ client, refresh: () => this.schedulePull(), receiveUpdate: this.receiveUpdate, presence: {
      sync: this.presence.sync, cursor: this.presence.receiveCursor,
      connected: this.presence.connected, disconnected: this.presence.disconnected,
    } });
  }

  start() {
    this.presence.start();
    this.unsubscribe = this.options.session.onLocalUpdate(this.record);
    this.channel.start(this.current.meta);
    window.addEventListener("offline", this.offline);
    window.addEventListener("online", this.resumeSaving);
    this.scheduleSave(0);
  }

  stop() {
    this.abort.abort();
    this.channel.stop();
    this.presence.stop();
    this.unsubscribe?.();
    window.clearTimeout(this.saveTimer);
    window.clearTimeout(this.pullTimer);
    window.clearTimeout(this.pulseTimer);
    window.removeEventListener("offline", this.offline);
    window.removeEventListener("online", this.resumeSaving);
  }

  setCursor(position: DocumentPosition | null) {
    this.presence.setCursor(canEditDocument(this.current.meta.role) && !this.current.accessLost ? position : null);
  }

  async rename(title: string) {
    const { client, actor } = this.options;
    // Leaving the editor can trigger a title save just before the session stops.
    const saved = await documentRequest<{ title: string }>(client, "/" + this.current.meta.id,
      { action: "rename", title }, undefined, { actor });
    this.publish({ meta: { ...this.current.meta, title: saved.title } });
    this.schedulePull();
  }

  closeOutbox() {
    void this.durable.finally(() => this.options.outbox.close());
  }

  private publish(changes: Partial<DocumentConnection>) {
    if (!this.abort.signal.aborted) {
      this.current = { ...this.current, ...changes };
      this.options.report(this.current);
    }
  }

  private readonly pendingDraft = () => this.draft;

  private readonly offline = () => this.publish({ status: this.localError ? "local-error" : "offline" });

  private readonly resumeSaving = () => this.scheduleSave(0);

  private scheduleSave(delay: number) {
    if (this.abort.signal.aborted || this.current.accessLost) return;
    window.clearTimeout(this.saveTimer);
    this.saveTimer = window.setTimeout(() => {
      this.saveTimer = undefined;
      void this.flush();
    }, delay);
  }

  private schedulePull(delay = 0) {
    if (this.abort.signal.aborted || !navigator.onLine) return;
    if (this.pulling) { this.pullQueued = true; return; }
    window.clearTimeout(this.pullTimer);
    this.pullTimer = window.setTimeout(() => { void this.pull(); }, delay);
  }

  private readonly record = (update: Uint8Array) => {
    const { actor } = this.options;
    const { meta } = this.current;
    if (!canEditDocument(meta.role) || this.current.accessLost) return;
    const draft = this.draft;
    const merged = draft && Y.mergeUpdates([draft.data, update]);
    const batch: OfflineBatch = merged && merged.byteLength <= maximumUpdateBytes
      ? { ...draft!, data: merged }
      : { id: crypto.randomUUID(), scope: outboxScope(actor, meta.id), createdAt: Date.now(),
        data: update, generation: meta.generation, schema: meta.schema };
    this.draft = batch;
    this.unpersisted.set(batch.id, batch);
    this.publish({ status: "saving" });
    this.durable = this.durable.then(() => this.persist(batch));
    const collaborating = this.current.peers.length > 1;
    const wait = collaborating ? 50 : 320;
    const maxWait = collaborating ? 100 : 1_000;
    const deadline = draft && draft.id !== batch.id ? 0 : maxWait - (Date.now() - batch.createdAt);
    this.scheduleSave(Math.max(0, Math.min(wait, deadline)));
  };

  private async persist(batch: OfflineBatch) {
    try {
      await this.options.outbox.persist(batch);
      if (this.unpersisted.get(batch.id) === batch) this.unpersisted.delete(batch.id);
      if (!this.unpersisted.size) this.localError = false;
      if (!navigator.onLine) this.offline();
    } catch {
      this.localError = true;
      this.publish({ status: "local-error" });
    }
  }

  private deferPullUntilComposed() {
    if (this.pulseTimer !== undefined) return;
    this.pulseTimer = window.setTimeout(() => {
      this.pulseTimer = undefined;
      if (this.abort.signal.aborted) return;
      if (this.options.isComposing()) this.deferPullUntilComposed();
      else this.schedulePull();
    }, 100);
  }

  private readonly receiveUpdate = (payload: unknown) => {
    if (!payload || typeof payload !== "object") return false;
    const notice = payload as Partial<DocumentUpdateNotice>;
    const { meta } = this.current;
    if (notice.generation !== meta.generation || notice.schema !== meta.schema ||
        typeof notice.cursor !== "number" || !Number.isSafeInteger(notice.cursor) || notice.cursor < 1 ||
        typeof notice.data !== "string" || !notice.data.length || notice.data.length > maximumRealtimeUpdateChars) return false;
    if (notice.cursor <= meta.cursor) return true;
    try {
      return this.applyCommit(notice.cursor, decodeUpdate(notice.data));
    } catch {
      return false;
    }
  };

  private applyCommit(cursor: number, update: Uint8Array) {
    const { meta } = this.current;
    if (cursor <= meta.cursor) return true;
    if (cursor !== meta.cursor + 1) return false;
    if (this.options.isComposing()) {
      this.deferPullUntilComposed();
      return true;
    }
    this.options.session.applySharedUpdates([update]);
    this.publish({ meta: { ...meta, cursor, head: Math.max(cursor, meta.head) } });
    return true;
  }

  private compact() {
    const { client, actor } = this.options;
    const { meta } = this.current;
    if (!canEditDocument(meta.role) || meta.cursor !== meta.head || meta.head < this.compactedAt + 64) return;
    this.compactedAt = meta.head;
    void documentRequest(client, "/" + meta.id, { action: "compact" }, this.abort.signal, { actor }).catch(() => {});
  }

  private async pull() {
    if (this.abort.signal.aborted || !navigator.onLine) return;
    const { client, actor, cursorSession, session, isComposing } = this.options;
    const previous = this.current.meta;
    this.pulling = true;
    let delay = 0;
    try {
      const incoming = await readDocument(client, previous.id, previous.generation, previous.cursor, this.abort.signal, actor, cursorSession);
      if (this.abort.signal.aborted) return;
      if (incoming.generation !== previous.generation || incoming.schema !== sharedSchemaVersion) {
        this.stop();
        this.options.reload();
        return;
      }
      const { meta } = this.current;
      if (!canEditDocument(incoming.role)) this.presence.setCursor(null);
      // A pull already in flight can return the title from before a local rename.
      if (meta.title !== previous.title) incoming.title = meta.title;
      const nextCursor = incoming.updates.at(-1)?.seq ?? incoming.cursor;
      const head = Math.max(meta.head, incoming.head);
      const deferUpdates = nextCursor > meta.cursor && isComposing();
      const cursor = deferUpdates ? meta.cursor : Math.max(nextCursor, meta.cursor);
      if (deferUpdates) this.deferPullUntilComposed();
      else if (nextCursor > meta.cursor) {
        const updates = incoming.updates.filter(({ seq }) => seq > meta.cursor).map(({ data }) => decodeUpdate(data));
        if (incoming.snapshot && incoming.cursor > meta.cursor) updates.unshift(decodeUpdate(incoming.snapshot));
        if (updates.length) session.applySharedUpdates(updates);
      }
      this.publish({ meta: { ...incoming, snapshot: null, updates: [], cursor, head } });
      this.channel.update(incoming);
      if (incoming.role !== meta.role) this.scheduleSave(0);
      this.pullQueued ||= !deferUpdates && cursor < head;
      this.pullDelay = 1_000;
      this.compact();
    } catch (error) {
      if (this.abort.signal.aborted) return;
      if (error instanceof SharedDocumentError && [401, 403, 404].includes(error.status)) {
        this.publish({ status: "blocked", accessLost: true, peers: [] });
        this.stop();
      } else {
        this.pullQueued = true;
        delay = this.pullDelay;
        this.pullDelay = Math.min(this.pullDelay * 2, 8_000);
      }
    } finally {
      this.pulling = false;
      if (this.pullQueued) {
        this.pullQueued = false;
        this.schedulePull(delay);
      }
    }
  }

  private async flush() {
    if (this.saving) { this.saveQueued = true; return; }
    if (this.abort.signal.aborted || this.current.accessLost) return;
    if (!navigator.onLine) { this.offline(); return; }
    this.saving = true;
    let retry: number | undefined;
    try {
      const writes = this.durable;
      this.draft = undefined;
      await writes;
      if (this.localError) {
        for (const batch of this.unpersisted.values()) {
          if (this.pendingDraft()?.id !== batch.id) await this.persist(batch);
        }
      }
      const { client, outbox, actor } = this.options;
      const { meta } = this.current;
      const queued = await outbox.read(outboxScope(actor, meta.id));
      const previousEdits = queued.some((batch) => batch.generation !== meta.generation || batch.schema !== meta.schema);
      const pending = queued.filter((batch) => batch.generation === meta.generation && batch.schema === meta.schema);
      if (this.localError) { this.publish({ status: "local-error", previousEdits }); return; }
      if (pending.length && !canEditDocument(meta.role)) {
        this.publish({ status: "blocked", previousEdits });
      } else {
        for (const batch of pending) {
          if (this.pendingDraft()?.id === batch.id) continue;
          this.publish({ status: "saving", previousEdits });
          const saved = await documentRequest<SavedUpdate>(client, "/" + meta.id, {
            action: "save", batch: batch.id, data: encodeUpdate(batch.data), generation: batch.generation, schema: batch.schema,
          }, this.abort.signal, { actor });
          if (!Number.isSafeInteger(saved?.seq) || saved.seq < 1) throw new SharedDocumentError(502, "INVALID_SAVE_RECEIPT");
          await outbox.confirm(batch.id);
          if (!this.abort.signal.aborted && !this.applyCommit(saved.seq, batch.data)) this.schedulePull();
        }
        this.publish({ status: this.pendingDraft() ? "saving" : "saved", previousEdits });
      }
      this.compact();
      this.saveDelay = 1_000;
    } catch (error) {
      if (this.abort.signal.aborted) return;
      if (error instanceof SharedDocumentError && [401, 403, 404].includes(error.status)) {
        this.publish({ status: "blocked" });
        this.schedulePull();
      } else if (error instanceof SharedDocumentError && error.code === "DOCUMENT_VERSION_CHANGED") {
        this.stop();
        this.options.reload();
      } else {
        if (navigator.onLine) {
          this.publish({ status: "retry" });
          retry = this.saveDelay;
          this.saveDelay = Math.min(this.saveDelay * 2, 8_000);
        } else this.offline();
      }
    } finally {
      this.saving = false;
      if (retry !== undefined && this.saveTimer === undefined) this.scheduleSave(retry);
      else if (this.saveQueued && this.current.status !== "blocked") this.scheduleSave(0);
      this.saveQueued = false;
    }
  }
}
