import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import type { DocumentPosition } from "../../model/document-model";
import type { DocumentSession } from "../../model/document-session";
import { encodeDocumentPosition } from "../model/comment-anchor";
import type { DocumentCursor, DocumentCursorUpdate, DocumentPresenceEntry, DocumentRead, OnlineCollaborator } from "../model/protocol";
import { documentRequest, SharedDocumentError } from "./client";

type PresenceOptions = {
  client: SupabaseClient;
  actor: string;
  documentId: string;
  generation: number;
  cursorSession: string;
  session: DocumentSession;
  report: (peers: OnlineCollaborator[]) => void;
  revalidate: () => void;
};

type ActivePresence = {
  channel: RealtimeChannel;
  proof: string;
  accessVersion: number;
  abort: AbortController;
  proofs: string[];
  actorSessions: Set<string>;
  entries: DocumentPresenceEntry[];
  cursors: Map<string, DocumentCursorUpdate>;
  rosterTimer?: number;
  trackTimer?: number;
};

const proofPattern = /^[0-9a-f-]{36}\.[0-9a-f-]{36}\.[A-Za-z0-9_-]{43}$/;
const cursorKey = (id: string, session: string) => id + "." + session;

export class DocumentPresence {
  private active?: ActivePresence;
  private cursor: DocumentCursor | null = null;
  private lastSent: DocumentCursor | null | undefined = null;
  private hasRemoteCursor = false;
  private cursorTimer?: number;
  private sending = false;

  constructor(private options: PresenceOptions) {}

  start() {
    window.addEventListener("online", this.wake);
    window.addEventListener("offline", this.offline);
    document.addEventListener("visibilitychange", this.wake);
  }

  stop() {
    this.disconnected();
    window.removeEventListener("online", this.wake);
    window.removeEventListener("offline", this.offline);
    document.removeEventListener("visibilitychange", this.wake);
  }

  setCursor(position: DocumentPosition | null) {
    const anchor = position && encodeDocumentPosition(this.options.session, position);
    if (this.cursor?.encoded === anchor?.encoded && this.cursor?.blockId === anchor?.blockId) return;
    this.cursor = anchor ? { ...anchor, generation: this.options.generation } : null;
    this.scheduleCursor(180);
  }

  readonly connected = (channel: RealtimeChannel, meta: DocumentRead) => {
    this.disconnected();
    if (!meta.presenceProof) return;
    // A cursor previously sent to the old connection may need republishing or clearing.
    if (this.hasRemoteCursor) this.lastSent = undefined;
    const active: ActivePresence = {
      channel, proof: meta.presenceProof, accessVersion: meta.accessVersion, abort: new AbortController(),
      proofs: [], actorSessions: new Set(), entries: [], cursors: new Map(),
    };
    this.active = active;
    void this.track(active);
    this.scheduleCursor(0);
  };

  readonly disconnected = () => {
    const active = this.active;
    this.active = undefined;
    if (active) {
      active.abort.abort();
      window.clearTimeout(active.rosterTimer);
      window.clearTimeout(active.trackTimer);
      this.options.report([]);
    }
    window.clearTimeout(this.cursorTimer);
    this.cursorTimer = undefined;
  };

  readonly sync = (channel: RealtimeChannel) => {
    const active = this.active;
    if (!active || active.channel !== channel) return;
    const proofs = [...new Set(Object.values(channel.presenceState<{ proof?: unknown }>()).flatMap((entries) =>
      entries.flatMap(({ proof }) => typeof proof === "string" && proofPattern.test(proof) ? [proof] : [])))].sort();
    if (proofs.length === active.proofs.length && proofs.every((proof, index) => proof === active.proofs[index])) return;
    active.proofs = proofs;
    active.actorSessions = new Set(proofs.map((proof) => proof.slice(0, 73)));
    active.entries = active.entries.filter(({ id, session }) => active.actorSessions.has(cursorKey(id, session)));
    for (const key of active.cursors.keys()) {
      if (!active.actorSessions.has(key)) active.cursors.delete(key);
    }
    this.report(active);
    window.clearTimeout(active.rosterTimer);
    if (proofs.length) void this.readRoster(active, proofs);
  };

  readonly receiveCursor = (payload: unknown) => {
    const active = this.active;
    if (!active || !payload || typeof payload !== "object") return;
    const update = payload as DocumentCursorUpdate;
    if (typeof update.id !== "string" || typeof update.session !== "string" ||
        typeof update.revision !== "number" || (update.cursor !== null &&
          (update.cursor?.generation !== this.options.generation || typeof update.cursor.encoded !== "string" ||
            typeof update.cursor.blockId !== "string"))) return;
    const key = cursorKey(update.id, update.session);
    if (!active.actorSessions.has(key)) return;
    const current = active.cursors.get(key);
    if (current?.revision != null && current.revision >= update.revision) return;
    active.cursors.set(key, update);
    this.report(active);
  };

  private readonly wake = () => this.scheduleCursor(0);

  private readonly offline = () => {
    window.clearTimeout(this.cursorTimer);
    this.cursorTimer = undefined;
    if (this.active) this.options.report([]);
  };

  private async track(active: ActivePresence) {
    const status = await active.channel.track({ proof: active.proof }).catch(() => "error");
    if (this.active !== active) return;
    if (status === "ok") this.sync(active.channel);
    else active.trackTimer = window.setTimeout(() => { if (this.active === active) void this.track(active); }, 2_000);
  }

  private async readRoster(active: ActivePresence, proofs: string[]) {
    const { client, documentId, actor } = this.options;
    try {
      const entries: DocumentPresenceEntry[] = [];
      for (let start = 0; start < proofs.length; start += 256) {
        entries.push(...await documentRequest<DocumentPresenceEntry[]>(client, "/" + documentId, {
          action: "presence-roster", accessVersion: active.accessVersion, proofs: proofs.slice(start, start + 256),
        }, active.abort.signal, { actor }));
        if (this.active !== active || active.proofs !== proofs) return;
      }
      active.entries = entries;
      this.report(active);
    } catch (error) {
      if (this.active !== active || active.proofs !== proofs) return;
      if (this.revalidateOnAccessError(error)) return;
      active.rosterTimer = window.setTimeout(() => { void this.readRoster(active, proofs); }, 2_000);
    }
  }

  private report(active: ActivePresence) {
    const peers = new Map<string, DocumentPresenceEntry>();
    for (const entry of active.entries) {
      const update = active.cursors.get(cursorKey(entry.id, entry.session));
      const current = update?.revision != null && update.revision > (entry.revision ?? -1) ? { ...entry, ...update } : entry;
      const previous = peers.get(entry.id);
      if (!previous || (current.revision ?? -1) > (previous.revision ?? -1)) peers.set(entry.id, current);
    }
    this.options.report([...peers.values()].map(({ id, name, cursor }) => ({ id, name, cursor })));
  }

  private visibleCursor() {
    return document.visibilityState === "visible" ? this.cursor : null;
  }

  private scheduleCursor(delay: number) {
    if (!this.active || this.sending || this.cursorTimer !== undefined || !navigator.onLine ||
        this.visibleCursor() === this.lastSent) return;
    this.cursorTimer = window.setTimeout(() => { void this.sendCursor(); }, delay);
  }

  private async sendCursor() {
    this.cursorTimer = undefined;
    const active = this.active;
    const cursor = this.visibleCursor();
    if (!active || !navigator.onLine || cursor === this.lastSent) return;
    const { client, documentId, actor, cursorSession } = this.options;
    if (cursor) this.hasRemoteCursor = true;
    this.sending = true;
    let delay = 180;
    try {
      await documentRequest(client, "/" + documentId, {
        action: "cursor", accessVersion: active.accessVersion, session: cursorSession, cursor,
      }, active.abort.signal, { actor });
      if (this.active === active) {
        this.lastSent = cursor;
        this.hasRemoteCursor = cursor !== null;
      }
    } catch (error) {
      if (this.active === active && this.revalidateOnAccessError(error)) {
        this.lastSent = cursor;
      }
      delay = 2_000;
    } finally {
      this.sending = false;
      this.scheduleCursor(delay);
    }
  }

  private revalidateOnAccessError(error: unknown) {
    if (!(error instanceof SharedDocumentError) || ![401, 403, 404, 409].includes(error.status)) return false;
    this.options.revalidate();
    return true;
  }
}
