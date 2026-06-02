import type {
  RoomPhase,
  RoomRole,
  TransferManifest,
  TransferProgress,
} from "@/lib/transfer-types";
import type { CapabilityState, CurrentFileSink, DownloadArtifact, SaveMode } from "./transfer-utils";

export interface TransferRefs {
  roomCode: React.RefObject<string>;
  participantId: React.RefObject<string>;
  role: React.RefObject<RoomRole | null>;
  phase: React.RefObject<RoomPhase>;
  manifest: React.RefObject<TransferManifest | null>;
  selectedFiles: React.RefObject<File[]>;
  saveMode: React.RefObject<SaveMode>;
  peerConnected: React.RefObject<boolean>;
  progress: React.RefObject<TransferProgress>;
  progressSamples: React.RefObject<Array<{ bytes: number; at: number }>>;
  directoryHandle: React.RefObject<FileSystemDirectoryHandle | null>;
  currentSink: React.RefObject<CurrentFileSink | null>;
  objectUrls: React.RefObject<Set<string>>;
  sending: React.RefObject<boolean>;
  manifestSent: React.RefObject<boolean>;
  receivingChain: React.RefObject<Promise<void>>;
  eventLoopAbort: React.RefObject<AbortController | null>;
  connection: React.RefObject<RTCPeerConnection | null>;
  pendingIceCandidates: React.RefObject<RTCIceCandidateInit[]>;
  controlChannel: React.RefObject<RTCDataChannel | null>;
  dataChannel: React.RefObject<RTCDataChannel | null>;
}

export interface TransferActions {
  setPhase: (phase: RoomPhase) => void;
  setPeerConnected: (v: boolean) => void;
  setManifest: (m: TransferManifest | null) => void;
  setReceiverConfirmed: (v: boolean) => void;
  setDownloadArtifacts: React.Dispatch<React.SetStateAction<DownloadArtifact[]>>;
  setExpiresAt: (v: number | null) => void;
  setStatusMessage: (msg: string) => void;
  setErrorMessage: (msg: string | null) => void;
  resetProgress: (manifest?: TransferManifest | null) => void;
  updateProgress: (patch: Partial<TransferProgress>) => void;
  failSession: (message: string, phase: RoomPhase) => Promise<void>;
}

export interface HomeTransferState {
  mode: "file" | "text";
  capability: CapabilityState;
  role: RoomRole | null;
  phase: RoomPhase;
  selectedFiles: File[];
  manifest: TransferManifest | null;
  shareCode: string;
  shareCodeInput: string;
  expiresAt: number | null;
  statusMessage: string;
  errorMessage: string | null;
  copied: boolean;
  peerConnected: boolean;
  progress: TransferProgress;
  downloadArtifacts: DownloadArtifact[];
  saveMode: SaveMode;
  receiverConfirmed: boolean;
  senderText: string;
  receivedText: string | null;
  setShareCodeInput: (v: string) => void;
  setSenderText: (v: string) => void;
  selectRole: (role: RoomRole) => void;
  addFiles: (files: File[]) => void;
  createRoomSession: () => void;
  joinRoomSession: () => void;
  confirmReceiverReady: () => void;
  copyShareCode: () => void;
  cancelCurrentSession: () => void;
  resetLocalState: () => void;
}
