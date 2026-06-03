import type { ControlMessage, TransferManifest } from "@/lib/transfer-types";

export const SIGNALING_ENDPOINT = "/api/signaling";
export const CHUNK_SIZE = 64 * 1024;
export const MAX_SEND_BUFFER_BYTES = 4 * 1024 * 1024;
export const BUFFER_LOW_WATERMARK_BYTES = 2 * 1024 * 1024;
export const DATA_FRAME_HEADER_BYTES = 3;
export const POLL_TIMEOUT_MS = 25_000;
const SHOULD_LOG_CLIENT_DEBUG = process.env.NODE_ENV === "production";

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
