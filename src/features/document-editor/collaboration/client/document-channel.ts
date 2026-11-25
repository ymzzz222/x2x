import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import type { DocumentRead } from "../model/protocol";

type Options = {
  client: SupabaseClient;
  refresh: () => void;
  receiveUpdate?: (payload: unknown) => boolean;
  presence?: {
    sync: (channel: RealtimeChannel) => void;
    cursor: (payload: unknown) => void;
    connected: (channel: RealtimeChannel, meta: DocumentRead) => void;
    disconnected: () => void;
  };
};

export class DocumentChannel {
  private channel?: RealtimeChannel;
  private meta?: DocumentRead;
  private subscribed = false;
  private fallback?: number;
  private delay = 2_000;

  constructor(private options: Options) {}

  start(meta: DocumentRead) {
    window.addEventListener("online", this.wake);
    window.addEventListener("offline", this.offline);
    document.addEventListener("visibilitychange", this.wake);
    this.update(meta);
  }

  stop() {
    this.meta = undefined;
    this.closeChannel();
    window.removeEventListener("online", this.wake);
    window.removeEventListener("offline", this.offline);
    document.removeEventListener("visibilitychange", this.wake);
  }

  update(meta: DocumentRead) {
    const previous = this.meta;
    this.meta = meta;
    if (this.channel && previous?.accessVersion === meta.accessVersion &&
        previous.realtimeReady === meta.realtimeReady && previous.presenceProof === meta.presenceProof) return;
    this.closeChannel();
    this.join();
  }

  private closeChannel() {
    const channel = this.channel;
    this.channel = undefined;
    this.subscribed = false;
    this.options.presence?.disconnected();
    this.cancelFallback();
    if (channel) void this.options.client.removeChannel(channel);
  }

  private join() {
    const meta = this.meta;
    if (!meta || this.channel || !navigator.onLine) return;
    const { client, presence, refresh, receiveUpdate } = this.options;
    const topic = "x2x-doc:" + meta.id + ":" + meta.accessVersion;
    if (client.getChannels().some((channel) => channel.topic === "realtime:" + topic)) {
      this.scheduleFallback();
      return;
    }
    const channel = client.channel(topic, { config: { private: true } });
    this.channel = channel;
    channel.on("broadcast", { event: "saved" }, ({ payload }) => {
      if (this.channel === channel && !receiveUpdate?.(payload)) refresh();
    })
      .on("broadcast", { event: "access" }, () => {
        if (this.channel !== channel) return;
        this.closeChannel();
        this.scheduleFallback();
        refresh();
      });
    if (presence && meta.presenceProof) {
      channel.on("presence", { event: "sync" }, () => { if (this.channel === channel) presence.sync(channel); })
        .on("broadcast", { event: "cursor" }, ({ payload }) => { if (this.channel === channel) presence.cursor(payload); });
    }
    channel.subscribe((state) => {
      if (this.channel !== channel) return;
      this.subscribed = state === "SUBSCRIBED";
      if (this.subscribed) {
        if (meta.realtimeReady) this.cancelFallback();
        if (meta.presenceProof) presence?.connected(channel, meta);
        refresh();
      } else {
        if (state === "CLOSED") this.channel = undefined;
        presence?.disconnected();
        this.scheduleFallback();
      }
    });
    this.scheduleFallback();
  }

  private readonly wake = () => {
    if (document.visibilityState !== "visible" || !navigator.onLine) return;
    this.options.refresh();
    this.scheduleFallback();
  };

  private readonly offline = () => this.cancelFallback();

  private cancelFallback() {
    window.clearTimeout(this.fallback);
    this.fallback = undefined;
    this.delay = 2_000;
  }

  private scheduleFallback() {
    if (!this.meta || this.fallback !== undefined || (this.subscribed && this.meta.realtimeReady) ||
        !navigator.onLine || document.visibilityState !== "visible") return;
    this.fallback = window.setTimeout(() => {
      this.fallback = undefined;
      if (!navigator.onLine || document.visibilityState !== "visible") return;
      this.delay = Math.min(this.delay * 2, 8_000);
      this.options.refresh();
      this.scheduleFallback();
    }, this.delay);
  }
}
