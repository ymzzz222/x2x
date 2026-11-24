import type { SupabaseClient } from "@supabase/supabase-js";
import * as Y from "yjs";
import type { DocumentSession } from "../../model/document-session";
import type { DocumentPosition } from "../../model/document-model";
import { documentRequest, readDocument, SharedDocumentError } from "./client";
import { DocumentOutbox } from "./outbox";
import { DocumentChannel } from "./document-channel";
import { DocumentPresence } from "./document-presence";
import { canEditDocument, decodeUpdate, encodeUpdate, maximumUpdateBytes, sharedSchemaVersion, type DocumentRead, type OfflineBatch, type OnlineCollaborator } from "../model/protocol";

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
  private syncTimer?: number;
  private pulseTimer?: number;
  private retryTimer?: number;
  private retryDelay = 1_000;
  private unsubscribe?: () => void;
  private running = false;
  private queued = false;
  private presence: DocumentPresence;
  private compactedAt = 0;

  constructor(private options: Options) {
    const { client, actor, meta, session, cursorSession } = options;
    this.current = { meta, status: "saving", peers: [], accessLost: false, previousEdits: false };
    this.presence = new DocumentPresence({ client, actor, documentId: meta.id, generation: meta.generation, session, cursorSession,
      report: (peers) => this.publish({ peers }), revalidate: () => this.schedule(0) });
    this.channel = new DocumentChannel({ client, refresh: () => this.schedule(0), presence: {
      sync: this.presence.sync, cursor: this.presence.receiveCursor,
      connected: this.presence.connected, disconnected: this.presence.disconnected,
    } });
  }

  start() {
    this.presence.start();
    this.unsubscribe = this.options.session.onLocalUpdate(this.record);
    this.channel.start(this.current.meta);
    window.addEventListener("offline", this.offline);
    this.schedule(0);
  }

  stop() {
    this.abort.abort();
    this.channel.stop();
    this.presence.stop();
    this.unsubscribe?.();
    window.clearTimeout(this.syncTimer);
    window.clearTimeout(this.pulseTimer);
    window.clearTimeout(this.retryTimer);
    window.removeEventListener("offline", this.offline);
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
    this.schedule(0);
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

  private schedule(delay: number) {
    if (this.abort.signal.aborted || this.current.accessLost) return;
    window.clearTimeout(this.syncTimer);
    this.syncTimer = window.setTimeout(() => { void this.run(); }, delay);
  }

  private retry() {
    this.publish({ status: navigator.onLine ? "retry" : "offline" });
    if (this.abort.signal.aborted || !navigator.onLine || this.retryTimer !== undefined) return;
    this.retryTimer = window.setTimeout(() => {
      this.retryTimer = undefined;
      this.schedule(0);
    }, this.retryDelay);
    this.retryDelay = Math.min(this.retryDelay * 2, 8_000);
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
    this.schedule(320);
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

  private async pull() {
    const { client, actor, cursorSession, session, isComposing } = this.options;
    const previous = this.current.meta;
    const incoming = await readDocument(client, previous.id, previous.generation, previous.cursor, this.abort.signal, actor, cursorSession);
    if (this.abort.signal.aborted) return false;
    if (incoming.generation !== previous.generation || incoming.schema !== sharedSchemaVersion) {
      this.stop();
      this.options.reload();
      return false;
    }
    if (!canEditDocument(incoming.role)) this.presence.setCursor(null);
    this.channel.update(incoming);
    // A pull already in flight can return the title from before a local rename.
    if (this.current.meta !== previous) incoming.title = this.current.meta.title;
    if (isComposing() && (incoming.snapshot || incoming.updates.length)) {
      this.publish({ meta: { ...incoming, cursor: previous.cursor } });
      window.clearTimeout(this.pulseTimer);
      this.pulseTimer = window.setTimeout(() => this.schedule(0), 250);
      return false;
    }
    const updates = incoming.updates.map((update) => decodeUpdate(update.data));
    if (incoming.snapshot) updates.unshift(decodeUpdate(incoming.snapshot));
    if (updates.length) session.applySharedUpdates(updates);
    const cursor = incoming.updates.at(-1)?.seq ?? incoming.cursor;
    this.publish({ meta: { ...incoming, snapshot: null, updates: [], cursor } });
    if (cursor < incoming.head) this.queued = true;
    return true;
  }

  private async run() {
    if (this.running) { this.queued = true; return; }
    if (this.abort.signal.aborted || this.current.accessLost) return;
    if (!navigator.onLine) { this.offline(); return; }
    this.running = true;
    try {
      if (!await this.pull()) return;
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
          await documentRequest(client, "/" + meta.id, {
            action: "save", batch: batch.id, data: encodeUpdate(batch.data), generation: batch.generation, schema: batch.schema,
          }, this.abort.signal, { actor });
          await outbox.confirm(batch.id);
        }
        this.publish({ status: this.pendingDraft() ? "saving" : "saved", previousEdits });
      }
      if (canEditDocument(meta.role) && meta.head >= this.compactedAt + 64) {
        this.compactedAt = meta.head;
        void documentRequest(client, "/" + meta.id, { action: "compact" }, this.abort.signal, { actor }).catch(() => {});
      }
      window.clearTimeout(this.retryTimer);
      this.retryTimer = undefined;
      this.retryDelay = 1_000;
    } catch (error) {
      if (error instanceof SharedDocumentError && [401, 403, 404].includes(error.status)) {
        try {
          await this.pull();
          this.publish({ status: "blocked" });
        } catch (check) {
          if (check instanceof SharedDocumentError && [401, 403, 404].includes(check.status)) {
            this.publish({ status: "blocked", accessLost: true, peers: [] });
            this.stop();
          } else this.retry();
        }
      } else if (error instanceof SharedDocumentError && error.code === "DOCUMENT_VERSION_CHANGED") {
        this.stop();
        this.options.reload();
      } else {
        this.retry();
      }
    } finally {
      this.running = false;
      if (this.queued) {
        this.queued = false;
        this.schedule(0);
      }
    }
  }
}
