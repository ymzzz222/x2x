import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import * as Y from "yjs";
import type { DocumentSession } from "../../model/document-session";
import type { DocumentPosition } from "../../model/document-model";
import { documentRequest, readDocument, SharedDocumentError } from "./client";
import { DocumentOutbox } from "./outbox";
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
  isComposing: () => boolean;
  report: (connection: DocumentConnection) => void;
  reload: () => void;
};

export const outboxScope = (actor: string, id: string) => actor + ":" + id;

export class SharedDocumentSync {
  private abort = new AbortController();
  private current: DocumentConnection;
  private channel?: RealtimeChannel;
  private channelAccess?: number;
  private draft?: OfflineBatch;
  private durable = Promise.resolve();
  private unpersisted = new Map<string, OfflineBatch>();
  private localError = false;
  private syncTimer?: number;
  private pulseTimer?: number;
  private interval?: number;
  private unsubscribe?: () => void;
  private running = false;
  private queued = false;
  private presence: DocumentPresence;
  private compactedAt = 0;

  constructor(private options: Options) {
    const { client, actor, meta, session } = options;
    this.current = { meta, status: "saving", peers: [], accessLost: false, previousEdits: false };
    this.presence = new DocumentPresence({ client, actor, documentId: meta.id, generation: meta.generation, session,
      report: (peers) => this.publish({ peers }) });
  }

  start() {
    this.presence.start();
    this.unsubscribe = this.options.session.onLocalUpdate(this.record);
    this.interval = window.setInterval(() => { if (document.visibilityState === "visible") this.schedule(0); }, 5000);
    window.addEventListener("online", this.wake);
    window.addEventListener("offline", this.offline);
    document.addEventListener("visibilitychange", this.wake);
    this.schedule(0);
  }

  stop() {
    this.abort.abort();
    this.presence.stop();
    this.unsubscribe?.();
    window.clearTimeout(this.syncTimer);
    window.clearTimeout(this.pulseTimer);
    window.clearInterval(this.interval);
    window.removeEventListener("online", this.wake);
    window.removeEventListener("offline", this.offline);
    document.removeEventListener("visibilitychange", this.wake);
    if (this.channel) void this.options.client.removeChannel(this.channel);
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

  private readonly wake = () => {
    if (document.visibilityState === "visible") this.schedule(0);
  };

  private readonly offline = () => this.publish({ status: this.localError ? "local-error" : "offline" });

  private schedule(delay: number) {
    if (this.abort.signal.aborted || this.current.accessLost) return;
    window.clearTimeout(this.syncTimer);
    this.syncTimer = window.setTimeout(() => { void this.run(); }, delay);
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

  private subscribe(meta: DocumentRead) {
    if (this.channelAccess === meta.accessVersion) return;
    if (this.channel) void this.options.client.removeChannel(this.channel);
    this.channelAccess = meta.accessVersion;
    this.channel = this.options.client.channel("x2x-doc:" + meta.id + ":" + meta.accessVersion, { config: { private: true } })
      .on("broadcast", { event: "saved" }, () => this.schedule(0))
      .subscribe((state) => { if (state === "SUBSCRIBED") this.schedule(0); });
  }

  private async pull() {
    const { client, session, isComposing } = this.options;
    const previous = this.current.meta;
    const incoming = await readDocument(client, previous.id, previous.generation, previous.cursor, this.abort.signal);
    if (this.abort.signal.aborted) return false;
    if (incoming.generation !== previous.generation || incoming.schema !== sharedSchemaVersion) {
      this.stop();
      this.options.reload();
      return false;
    }
    this.subscribe(incoming);
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
          }, this.abort.signal);
          await outbox.confirm(batch.id);
        }
        this.publish({ status: this.pendingDraft() ? "saving" : "saved", previousEdits });
      }
      if (canEditDocument(meta.role) && meta.head >= this.compactedAt + 64) {
        this.compactedAt = meta.head;
        void documentRequest(client, "/" + meta.id, { action: "compact" }, this.abort.signal).catch(() => {});
      }
    } catch (error) {
      if (error instanceof SharedDocumentError && (error.status === 403 || error.status === 401)) {
        try {
          await this.pull();
          this.publish({ status: "blocked" });
        } catch (check) {
          if (check instanceof SharedDocumentError && (check.status === 403 || check.status === 401)) {
            this.publish({ status: "blocked", accessLost: true, peers: [] });
            this.stop();
          } else this.publish({ status: "retry" });
        }
      } else if (error instanceof SharedDocumentError && error.code === "DOCUMENT_VERSION_CHANGED") {
        this.stop();
        this.options.reload();
      } else {
        this.publish({ status: navigator.onLine ? "retry" : "offline" });
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
