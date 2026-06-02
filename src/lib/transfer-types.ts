export type RoomRole = "sender" | "receiver";

export type RoomPhase =
  | "idle"
  | "role-selected"
  | "room-creating"
  | "waiting-peer"
  | "joining-room"
  | "connecting"
  | "ready"
  | "transferring"
  | "completed"
  | "expired"
  | "cancelled"
  | "failed";

export type SignalingSignalKind = "offer" | "answer" | "ice";

export type SignalingEnvelope =
  | { type: "peer-joined" }
  | { type: "room-expired" }
  | { type: "room-cancelled"; reason?: string }
  | {
      type: "signal";
      kind: SignalingSignalKind;
      payload: RTCSessionDescriptionInit | RTCIceCandidateInit;
    };

export interface ManifestFileItem {
  id: string;
  name: string;
  size: number;
  type: string;
}

export interface TransferManifest {
  createdAt: number;
  totalBytes: number;
  files: ManifestFileItem[];
  mode?: "file" | "text";
}

export type ControlMessage =
  | { type: "manifest"; manifest: TransferManifest }
  | { type: "receiver-ready" }
  | { type: "file-start"; fileId: string }
  | { type: "file-complete"; fileId: string }
  | { type: "transfer-complete" }
  | { type: "transfer-cancelled"; reason?: string }
  | { type: "transfer-error"; message: string };

export interface TransferProgress {
  totalBytes: number;
  transferredBytes: number;
  currentFileId: string | null;
  currentFileName: string | null;
  currentFileBytes: number;
  currentFileTransferredBytes: number;
  totalFiles: number;
  completedFiles: number;
  speedBytesPerSecond: number;
  etaSeconds: number | null;
}

export interface RoomSessionPayload {
  roomCode: string;
  participantId: string;
  expiresAt: number;
}

export interface SignalingEvent {
  id: number;
  envelope: SignalingEnvelope;
}

export interface PollEventsResponse {
  events: SignalingEvent[];
  nextCursor: number;
  expiresAt: number;
}
