import type { SupabaseClient } from "@supabase/supabase-js";
import type { DocumentPosition } from "../../model/document-model";
import type { DocumentSession } from "../../model/document-session";
import { encodeDocumentPosition } from "../model/comment-anchor";
import type { DocumentCursor, OnlineCollaborator } from "../model/protocol";
import { documentRequest, SharedDocumentError } from "./client";

type PresenceOptions = {
  client: SupabaseClient;
  actor: string;
  documentId: string;
  generation: number;
  session: DocumentSession;
  report: (peers: OnlineCollaborator[]) => void;
};

export class DocumentPresence {
  private readonly abort = new AbortController();
  private readonly cursorSession = crypto.randomUUID();
  private cursor: DocumentCursor | null = null;
  private lastSent: DocumentCursor | null = null;
  private peers: OnlineCollaborator[] = [];
  private sending = false;
  private timer?: number;
  private scheduledAt = 0;

  constructor(private options: PresenceOptions) {}

  start() {
    window.addEventListener("online", this.wake);
    window.addEventListener("offline", this.offline);
    document.addEventListener("visibilitychange", this.wake);
    this.schedule(0);
  }

  stop() {
    this.abort.abort();
    window.clearTimeout(this.timer);
    window.removeEventListener("online", this.wake);
    window.removeEventListener("offline", this.offline);
    document.removeEventListener("visibilitychange", this.wake);
  }

  setCursor(position: DocumentPosition | null) {
    const anchor = position && encodeDocumentPosition(this.options.session, position);
    if (this.cursor?.encoded === anchor?.encoded && this.cursor?.blockId === anchor?.blockId) return;
    this.cursor = anchor ? { ...anchor, generation: this.options.generation } : null;
    this.schedule(180);
  }

  private readonly wake = () => this.schedule(0);

  private readonly offline = () => {
    window.clearTimeout(this.timer);
    this.timer = undefined;
    this.updatePeers([]);
  };

  private schedule(delay: number) {
    const time = Date.now() + delay;
    if (this.abort.signal.aborted || this.sending ||
        (this.timer !== undefined && time >= this.scheduledAt)) return;
    window.clearTimeout(this.timer);
    this.scheduledAt = time;
    this.timer = window.setTimeout(() => { void this.send(); }, delay);
  }

  private updatePeers(peers: OnlineCollaborator[]) {
    if (JSON.stringify(peers) === JSON.stringify(this.peers)) return;
    this.peers = peers;
    this.options.report(peers);
  }

  private async send() {
    this.timer = undefined;
    if (this.abort.signal.aborted || !navigator.onLine ||
        (document.visibilityState !== "visible" && !this.lastSent)) return;
    const { client, documentId, actor } = this.options;
    const cursor = document.visibilityState === "visible" ? this.cursor : null;
    this.sending = true;
    try {
      const peers = await documentRequest<OnlineCollaborator[]>(client, "/" + documentId, {
        action: "presence", cursorSession: this.cursorSession, cursor,
      }, this.abort.signal, { actor });
      this.lastSent = cursor;
      if (!this.abort.signal.aborted) this.updatePeers(navigator.onLine ? peers : []);
    } catch (error) {
      if (error instanceof SharedDocumentError && (error.status === 401 || error.status === 403)) this.updatePeers([]);
    } finally {
      this.sending = false;
      const latest = document.visibilityState === "visible" ? this.cursor : null;
      const delay = latest !== cursor ? 180 : this.peers.length > 1 ? 900 : 4000;
      this.schedule(delay);
    }
  }
}
