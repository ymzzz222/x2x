/* eslint-disable react-hooks/refs, react-hooks/immutability, react-hooks/exhaustive-deps, react-hooks/set-state-in-effect, react-hooks/preserve-manual-memoization */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  RoomPhase,
  RoomRole,
  RoomSessionPayload,
  TransferManifest,
  TransferProgress,
} from "@/lib/transfer-types";
import {
  EMPTY_PROGRESS,
  buildManifest,
  detectCapabilities,
  mergeFiles,
  type CapabilityState,
  type DownloadArtifact,
  type SaveMode,
} from "../_lib/transfer-utils";
import type { TransferRefs, TransferActions, HomeTransferState } from "../_lib/types";
import {
  cleanupRtc,
  createSignaling,
  attachChannels,
  createRtcConnection,
} from "../_lib/rtc-connection";
import { createProgressManager, createFileTransfer, createTextTransfer } from "../_lib/file-transfer";

const SSR_CAPABILITY: CapabilityState = { supported: false, canPickDirectory: false, warning: null };

function buildTextManifest(text: string): TransferManifest {
  const encoded = new TextEncoder().encode(text);
  return {
    createdAt: Date.now(),
    totalBytes: encoded.byteLength,
    files: [{ id: crypto.randomUUID(), name: "text.txt", size: encoded.byteLength, type: "text/plain" }],
    mode: "text",
  };
}

export function useHomeTransfer(mode: "file" | "text" = "file"): HomeTransferState {
  const [capability, setCapability] = useState(SSR_CAPABILITY);
  const [role, setRole] = useState<RoomRole | null>(null);
  const [phase, setPhase] = useState<RoomPhase>("idle");

  useEffect(() => {
    const cap = detectCapabilities();
    setCapability(cap);
    if (!cap.supported) {
      setPhase("failed");
      setErrorMessage(cap.warning);
      setStatusMessage(cap.warning || "浏览器能力不足。");
    }
  }, []);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [manifest, setManifest] = useState<TransferManifest | null>(null);
  const [shareCode, setShareCode] = useState("");
  const [shareCodeInput, setShareCodeInput] = useState("");
  const [participantId, setParticipantId] = useState("");
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState(
    capability.supported ? "选择一个角色，开始建立局域网直传。" : capability.warning || "浏览器能力不足。",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(
    capability.supported ? null : capability.warning,
  );
  const [copied, setCopied] = useState(false);
  const [peerConnected, setPeerConnected] = useState(false);
  const [progress, setProgress] = useState<TransferProgress>(EMPTY_PROGRESS);
  const [downloadArtifacts, setDownloadArtifacts] = useState<DownloadArtifact[]>([]);
  const [saveMode, setSaveMode] = useState<SaveMode>(null);
  const [receiverConfirmed, setReceiverConfirmed] = useState(false);
  const [senderText, setSenderText] = useState("");
  const [receivedText, setReceivedText] = useState<string | null>(null);

  const modeRef = useRef(mode);
  modeRef.current = mode;

  const senderTextRef = useRef(senderText);
  senderTextRef.current = senderText;

  const refs: TransferRefs = {
    roomCode: useRef(shareCode),
    participantId: useRef(participantId),
    role: useRef<RoomRole | null>(role),
    phase: useRef<RoomPhase>(phase),
    manifest: useRef<TransferManifest | null>(manifest),
    selectedFiles: useRef<File[]>(selectedFiles),
    saveMode: useRef<SaveMode>(saveMode),
    peerConnected: useRef(false),
    progress: useRef<TransferProgress>(EMPTY_PROGRESS),
    progressSamples: useRef([]),
    directoryHandle: useRef(null),
    currentSink: useRef(null),
    objectUrls: useRef(new Set()),
    sending: useRef(false),
    manifestSent: useRef(false),
    receivingChain: useRef(Promise.resolve()),
    eventLoopAbort: useRef(null),
    connection: useRef(null),
    pendingIceCandidates: useRef<RTCIceCandidateInit[]>([]),
    controlChannel: useRef(null),
    dataChannel: useRef(null),
  };

  useEffect(() => { refs.roomCode.current = shareCode; }, [shareCode]);
  useEffect(() => { refs.participantId.current = participantId; }, [participantId]);
  useEffect(() => { refs.role.current = role; }, [role]);
  useEffect(() => { refs.phase.current = phase; }, [phase]);
  useEffect(() => { refs.manifest.current = manifest; }, [manifest]);
  useEffect(() => { refs.selectedFiles.current = selectedFiles; }, [selectedFiles]);
  useEffect(() => { refs.saveMode.current = saveMode; }, [saveMode]);

  const failSession = useCallback(async (message: string, nextPhase: RoomPhase) => {
    setErrorMessage(message);
    setStatusMessage(message);
    setPhase(nextPhase);
    await cleanupRtc(refs, actions)();
  }, []);

  const actions: TransferActions = {
    setPhase,
    setPeerConnected,
    setManifest,
    setReceiverConfirmed,
    setDownloadArtifacts,
    setExpiresAt,
    setStatusMessage,
    setErrorMessage,
    resetProgress: () => {},
    updateProgress: () => {},
    failSession,
  };

  const progressMgr = useMemo(() => createProgressManager(refs, setProgress), []);
  actions.resetProgress = progressMgr.resetProgress;
  actions.updateProgress = progressMgr.updateProgress;

  const signaling = useMemo(() => createSignaling(refs), []);
  const fileTransfer = useMemo(() => createFileTransfer(refs, actions, signaling), []);
  const textTransfer = useMemo(
    () => createTextTransfer(refs, actions, signaling, (text) => setReceivedText(text)),
    [signaling],
  );

  const channels = useMemo(
    () => attachChannels(
      refs,
      actions,
      signaling,
      () => modeRef.current === "text" ? textTransfer.startTransfer(senderTextRef.current) : fileTransfer.startTransfer(),
      (buffer) => modeRef.current === "text" ? textTransfer.handleIncomingTextFrame(buffer) : fileTransfer.handleIncomingFrame(buffer),
    ),
    [signaling, textTransfer, fileTransfer],
  );
  const rtc = useMemo(
    () => createRtcConnection(refs, actions, cleanupRtc(refs, actions), signaling, channels),
    [signaling, channels],
  );

  const cleanupFn = useCallback(async () => {
    refs.eventLoopAbort.current?.abort();
    refs.eventLoopAbort.current = null;
    refs.controlChannel.current?.close();
    refs.dataChannel.current?.close();
    refs.connection.current?.close();
    refs.controlChannel.current = null;
    refs.dataChannel.current = null;
    refs.connection.current = null;
    refs.manifestSent.current = false;
    refs.sending.current = false;
    refs.peerConnected.current = false;
    setPeerConnected(false);
    const sink = refs.currentSink.current;
    refs.currentSink.current = null;
    if (sink?.writable) await sink.writable.abort();
  }, []);

  const resetLocalState = useCallback(async () => {
    await cleanupFn();
    fileTransfer.revokeObjectUrls();
    refs.directoryHandle.current = null;
    refs.roomCode.current = "";
    refs.participantId.current = "";
    refs.manifest.current = null;
    refs.role.current = null;
    refs.phase.current = capability.supported ? "idle" : "failed";
    setRole(null);
    setPhase(capability.supported ? "idle" : "failed");
    setSelectedFiles([]);
    setManifest(null);
    setShareCode("");
    setShareCodeInput("");
    setParticipantId("");
    setExpiresAt(null);
    setStatusMessage(
      capability.supported ? "选择一个角色，开始建立局域网直传。" : capability.warning || "浏览器能力不足。",
    );
    setErrorMessage(capability.supported ? null : capability.warning);
    setCopied(false);
    setDownloadArtifacts([]);
    setSaveMode(null);
    setReceiverConfirmed(false);
    setSenderText("");
    setReceivedText(null);
    progressMgr.resetProgress();
  }, [capability.supported, capability.warning, cleanupFn, fileTransfer, progressMgr]);

  const selectRole = useCallback(
    (nextRole: RoomRole) => {
      if (!capability.supported) return;
      void resetLocalState().then(() => {
        setRole(nextRole);
        setPhase("role-selected");
        setStatusMessage(
          nextRole === "sender"
            ? mode === "text" ? "输入要发送的文本，然后生成一次性分享码。" : "选择要发送的文件，然后生成一次性分享码。"
            : "输入发送方的 6 位分享码，加入同一个房间。",
        );
      });
    },
    [capability.supported, resetLocalState, mode],
  );

  const addFiles = useCallback(
    (incoming: File[]) => {
      if (!incoming.length) return;
      setSelectedFiles((prev) => {
        const merged = mergeFiles(prev, incoming);
        const m = buildManifest(merged);
        setManifest(m);
        progressMgr.resetProgress(m);
        setErrorMessage(null);
        const added = merged.length - prev.length;
        setStatusMessage(
          added === incoming.length
            ? `已选择 ${merged.length} 个文件，接下来可以生成分享码。`
            : `已添加 ${added} 个新文件，共 ${merged.length} 个待发送。`,
        );
        return merged;
      });
    },
    [progressMgr],
  );

  const createRoomSession = useCallback(async () => {
    if (refs.role.current !== "sender") return;

    if (modeRef.current === "text") {
      const text = senderTextRef.current;
      if (!text.trim()) { setErrorMessage("请先输入要发送的文本。"); return; }
      const m = buildTextManifest(text);
      refs.manifest.current = m;
      setManifest(m);
      progressMgr.resetProgress(m);
    } else {
      if (!refs.selectedFiles.current.length) { setErrorMessage("请先选择至少一个文件。"); return; }
      const m = buildManifest(refs.selectedFiles.current);
      refs.manifest.current = m;
      setManifest(m);
      progressMgr.resetProgress(m);
    }

    setErrorMessage(null);
    setPhase("room-creating");
    setStatusMessage("正在申请一次性分享码。");

    try {
      await rtc.initPeerConnection();
      const session = await signaling.post<RoomSessionPayload>({ action: "create" });
      refs.roomCode.current = session.roomCode;
      refs.participantId.current = session.participantId;
      setShareCode(session.roomCode);
      setParticipantId(session.participantId);
      setExpiresAt(session.expiresAt);
      setPhase("waiting-peer");
      setStatusMessage("分享码已生成，等待接收设备输入并加入。");
      rtc.startEventLoop(session.roomCode, session.participantId);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "创建房间失败。";
      await failSession(msg, "failed");
    }
  }, [failSession, progressMgr, rtc, signaling]);

  const joinRoomSession = useCallback(async () => {
    if (refs.role.current !== "receiver") return;
    if (!/^\d{6}$/.test(shareCodeInput)) { setErrorMessage("请输入发送方提供的 6 位分享码。"); return; }

    setErrorMessage(null);
    setPhase("joining-room");
    setStatusMessage("正在加入房间并等待发送方响应。");

    try {
      await rtc.initPeerConnection();
      const session = await signaling.post<RoomSessionPayload>({ action: "join", roomCode: shareCodeInput });
      refs.roomCode.current = session.roomCode;
      refs.participantId.current = session.participantId;
      setShareCode(session.roomCode);
      setParticipantId(session.participantId);
      setExpiresAt(session.expiresAt);
      setPhase("connecting");
      setStatusMessage("已加入房间，正在等待发送方发起连接。");
      rtc.startEventLoop(session.roomCode, session.participantId);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "加入房间失败。";
      await failSession(msg, msg.includes("过期") ? "expired" : "failed");
    }
  }, [failSession, rtc, shareCodeInput, signaling]);

  const confirmReceiverReady = useCallback(async () => {
    if (!refs.manifest.current) { setErrorMessage("还没有收到发送方的文件清单。"); return; }

    try {
      if (modeRef.current === "file") {
        if (capability.canPickDirectory) {
          const handle = await window.showDirectoryPicker?.({ mode: "readwrite", id: "x2x-transfer" });
          if (!handle) return;
          refs.directoryHandle.current = handle;
          setSaveMode("directory");
        } else {
          refs.directoryHandle.current = null;
          setSaveMode("browser-download");
        }
      }

      setReceiverConfirmed(true);
      signaling.sendControlMessage({ type: "receiver-ready" });
      setPhase("transferring");
      setStatusMessage(
        modeRef.current === "text"
          ? "已确认接收，等待发送方推送文本。"
          : capability.canPickDirectory
            ? "已确认保存目录，等待发送方推送数据。"
            : "已确认接收，将在完成后提供浏览器下载链接。",
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : "无法准备接收目录。";
      setErrorMessage(msg);
    }
  }, [capability.canPickDirectory, signaling]);

  const copyShareCode = useCallback(async () => {
    if (!shareCode) return;
    try {
      await navigator.clipboard.writeText(shareCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { setCopied(false); }
  }, [shareCode]);

  const cancelCurrentSession = useCallback(async () => {
    const rc = refs.roomCode.current;
    const pi = refs.participantId.current;
    try {
      if (rc && pi) {
        try { signaling.sendControlMessage({ type: "transfer-cancelled", reason: "对端取消了本次传输。" }); } catch { /* ignore */ }
        await signaling.post<{ ok: true }>({ action: "cancel", roomCode: rc, participantId: pi, reason: "对端取消了本次传输。" });
      }
    } finally {
      await resetLocalState();
    }
  }, [resetLocalState, signaling]);

  useEffect(() => {
    return () => { void cleanupFn(); fileTransfer.revokeObjectUrls(); };
  }, [cleanupFn, fileTransfer]);

  return {
    mode,
    capability,
    role,
    phase,
    selectedFiles,
    manifest,
    shareCode,
    shareCodeInput,
    expiresAt,
    statusMessage,
    errorMessage,
    copied,
    peerConnected,
    progress,
    downloadArtifacts,
    saveMode,
    receiverConfirmed,
    senderText,
    receivedText,
    setShareCodeInput,
    setSenderText,
    selectRole,
    addFiles,
    createRoomSession,
    joinRoomSession,
    confirmReceiverReady,
    copyShareCode,
    cancelCurrentSession,
    resetLocalState,
  };
}
