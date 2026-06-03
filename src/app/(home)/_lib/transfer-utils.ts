import type { ControlMessage, TransferManifest } from "@/lib/transfer-types";

export const SIGNALING_ENDPOINT = "/api/signaling";
export const CHUNK_SIZE = 64 * 1024;
export const MAX_SEND_BUFFER_BYTES = 4 * 1024 * 1024;
export const BUFFER_LOW_WATERMARK_BYTES = 2 * 1024 * 1024;
export const DATA_FRAME_HEADER_BYTES = 3;
export const POLL_TIMEOUT_MS = 25_000;
export const ICE_DISCONNECT_GRACE_MS = 8_000;
const SHOULD_LOG_CLIENT_DEBUG = process.env.NODE_ENV === "production";
const DEFAULT_STUN_URLS = [
  "stun:stun.l.google.com:19302",
  "stun:stun1.l.google.com:19302",
] as const;

export type DataFrameType = 1 | 2 | 3;
export type SaveMode = "directory" | "browser-download" | null;

export interface CapabilityState {
  supported: boolean;
  canPickDirectory: boolean;
  warning: string | null;
}

export interface DownloadArtifact {
  fileId: string;
  name: string;
  url: string;
}

export interface CurrentFileSink {
  file: { id: string; name: string; size: number; type: string };
  writable: FileSystemWritableFileStream | null;
  chunks: ArrayBuffer[];
}

export const EMPTY_PROGRESS = {
  totalBytes: 0,
  transferredBytes: 0,
  currentFileId: null,
  currentFileName: null,
  currentFileBytes: 0,
  currentFileTransferredBytes: 0,
  totalFiles: 0,
  completedFiles: 0,
  speedBytesPerSecond: 0,
  etaSeconds: null,
} as const;

export function buildManifest(files: File[]): TransferManifest {
  return {
    createdAt: Date.now(),
    totalBytes: files.reduce((sum, file) => sum + file.size, 0),
    files: files.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
    })),
  };
}

function fileIdentity(file: File) {
  return `${file.name}\0${file.size}\0${file.lastModified}`;
}

export function mergeFiles(existing: File[], incoming: File[]) {
  const seen = new Set(existing.map(fileIdentity));
  const merged = [...existing];
  for (const file of incoming) {
    const key = fileIdentity(file);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(file);
  }
  return merged;
}

export function detectCapabilities(): CapabilityState {
  if (typeof window === "undefined") {
    return { supported: false, canPickDirectory: false, warning: null };
  }

  const supported =
    typeof window.RTCPeerConnection !== "undefined" &&
    typeof window.TextEncoder !== "undefined" &&
    typeof window.TextDecoder !== "undefined";
  const canPickDirectory = typeof window.showDirectoryPicker === "function";

  return {
    supported,
    canPickDirectory,
    warning: supported
      ? canPickDirectory
        ? null
        : "当前浏览器不支持直接写入文件夹，将退回浏览器下载。建议使用桌面 Chrome 或 Edge。"
      : "当前浏览器不支持所需的点对点能力，请使用桌面 Chrome 或 Edge。",
  };
}

export function encodeControlMessage(message: ControlMessage) {
  return JSON.stringify(message);
}

export function decodeControlMessage(raw: string): ControlMessage {
  return JSON.parse(raw) as ControlMessage;
}

export function encodeDataFrame(type: DataFrameType, fileIndex: number, payload?: ArrayBuffer) {
  const body = payload ? new Uint8Array(payload) : new Uint8Array(0);
  const frame = new Uint8Array(DATA_FRAME_HEADER_BYTES + body.byteLength);
  const view = new DataView(frame.buffer);
  view.setUint8(0, type);
  view.setUint16(1, fileIndex);
  frame.set(body, DATA_FRAME_HEADER_BYTES);
  return frame.buffer;
}

export function decodeDataFrame(buffer: ArrayBuffer) {
  const view = new DataView(buffer);
  return {
    type: view.getUint8(0) as DataFrameType,
    fileIndex: view.getUint16(1),
    payload: buffer.slice(DATA_FRAME_HEADER_BYTES),
  };
}

export async function normalizeArrayBuffer(value: Blob | ArrayBuffer | string) {
  if (value instanceof ArrayBuffer) return value;
  if (value instanceof Blob) return value.arrayBuffer();
  return new TextEncoder().encode(value).buffer;
}

export async function parseJsonResponse<T>(response: Response) {
  const data = (await response.json()) as T & { message?: string };
  if (!response.ok) throw new Error(data.message || "请求失败。");
  return data;
}

export function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function splitIceUrls(raw: string | undefined) {
  return (raw ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeIceServer(input: unknown): RTCIceServer | null {
  if (!input || typeof input !== "object") return null;

  const server = input as Record<string, unknown>;
  const urls =
    typeof server.urls === "string"
      ? server.urls.trim()
      : Array.isArray(server.urls)
        ? server.urls.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        : null;

  if (!urls || (Array.isArray(urls) && urls.length === 0)) {
    return null;
  }

  return {
    urls,
    username: typeof server.username === "string" ? server.username : undefined,
    credential: typeof server.credential === "string" ? server.credential : undefined,
  };
}

function parseConfiguredIceServers() {
  const json = process.env.NEXT_PUBLIC_X2X_ICE_SERVERS?.trim();
  if (json) {
    try {
      const parsed = JSON.parse(json) as unknown;
      const list = Array.isArray(parsed)
        ? parsed
        : parsed && typeof parsed === "object" && Array.isArray((parsed as { iceServers?: unknown }).iceServers)
          ? (parsed as { iceServers: unknown[] }).iceServers
          : [];
      const servers = list
        .map(normalizeIceServer)
        .filter((server): server is RTCIceServer => Boolean(server));
      if (servers.length > 0) {
        return servers;
      }
    } catch {
      logClientWarn("rtc invalid NEXT_PUBLIC_X2X_ICE_SERVERS");
    }
  }

  const stunUrls = splitIceUrls(process.env.NEXT_PUBLIC_X2X_STUN_URLS) || [];
  const turnUrls = splitIceUrls(process.env.NEXT_PUBLIC_X2X_TURN_URLS);
  const servers: RTCIceServer[] = [];

  servers.push({
    urls: stunUrls.length > 0 ? stunUrls : [...DEFAULT_STUN_URLS],
  });

  if (turnUrls.length > 0) {
    servers.push({
      urls: turnUrls,
      username: process.env.NEXT_PUBLIC_X2X_TURN_USERNAME?.trim() || undefined,
      credential: process.env.NEXT_PUBLIC_X2X_TURN_CREDENTIAL?.trim() || undefined,
    });
  }

  return servers;
}

function isRelayUrl(url: string) {
  return url.startsWith("turn:") || url.startsWith("turns:");
}

export function getRtcConfiguration(): RTCConfiguration {
  const iceServers = parseConfiguredIceServers();
  const hasRelay = iceServers.some((server) => {
    const urls = Array.isArray(server.urls) ? server.urls : [server.urls];
    return urls.some(isRelayUrl);
  });

  return {
    iceServers,
    iceTransportPolicy: hasRelay && process.env.NEXT_PUBLIC_X2X_FORCE_RELAY === "1" ? "relay" : "all",
  };
}

export function summarizeRtcConfiguration(configuration: RTCConfiguration) {
  const iceServers = configuration.iceServers ?? [];

  return {
    iceTransportPolicy: configuration.iceTransportPolicy ?? "all",
    iceServerCount: iceServers.length,
    iceServers: iceServers.map((server) => {
      const urls = Array.isArray(server.urls) ? server.urls : [server.urls];
      return {
        urls: urls.map((url) => (isRelayUrl(url) ? url.split("?")[0] : url)),
        hasCredential: Boolean(server.credential),
      };
    }),
  };
}

export function logClientDebug(message: string, detail?: unknown) {
  if (typeof window === "undefined" || !SHOULD_LOG_CLIENT_DEBUG) return;
  if (typeof detail === "undefined") {
    console.info("[x2x]", message);
    return;
  }
  console.info("[x2x]", message, detail);
}

export function logClientWarn(message: string, detail?: unknown) {
  if (typeof window === "undefined" || !SHOULD_LOG_CLIENT_DEBUG) return;
  if (typeof detail === "undefined") {
    console.warn("[x2x]", message);
    return;
  }
  console.warn("[x2x]", message, detail);
}

export function logClientError(message: string, detail?: unknown) {
  if (typeof window === "undefined" || !SHOULD_LOG_CLIENT_DEBUG) return;
  if (typeof detail === "undefined") {
    console.error("[x2x]", message);
    return;
  }
  console.error("[x2x]", message, detail);
}
