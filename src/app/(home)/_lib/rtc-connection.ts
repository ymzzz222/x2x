import type {
  ControlMessage,
  PollEventsResponse,
  SignalingEnvelope,
} from "@/lib/transfer-types";
import {
  BUFFER_LOW_WATERMARK_BYTES,
  MAX_SEND_BUFFER_BYTES,
  POLL_TIMEOUT_MS,
  SIGNALING_ENDPOINT,
  decodeControlMessage,
  encodeControlMessage,
  logClientDebug,
  logClientError,
  logClientWarn,
  normalizeArrayBuffer,
  sleep,
} from "./transfer-utils";
import type { TransferActions, TransferRefs } from "./types";

export function cleanupRtc(refs: TransferRefs, actions: TransferActions) {
  return async () => {
    refs.eventLoopAbort.current?.abort();
    refs.eventLoopAbort.current = null;
    refs.controlChannel.current?.close();
    refs.dataChannel.current?.close();
    refs.connection.current?.close();
    refs.controlChannel.current = null;
    refs.dataChannel.current = null;
    refs.connection.current = null;
    refs.pendingIceCandidates.current = [];
    refs.manifestSent.current = false;
    refs.sending.current = false;
    refs.peerConnected.current = false;
    actions.setPeerConnected(false);

    const sink = refs.currentSink.current;
    refs.currentSink.current = null;
    if (sink?.writable) await sink.writable.abort();
  };
}

export function createSignaling(refs: TransferRefs) {
  async function post<T>(payload: Record<string, unknown>) {
    logClientDebug("signaling POST:start", {
      action: payload.action,
      roomCode: payload.roomCode,
      participantId: payload.participantId,
    });
    const response = await fetch(SIGNALING_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const raw = await response.text();
    let data: (T & { message?: string }) | null = null;
    try {
      data = JSON.parse(raw) as T & { message?: string };
    } catch {
      logClientError("signaling POST:invalid-json", {
        action: payload.action,
        status: response.status,
        body: raw,
      });
      throw new Error("信令服务返回了无效响应。");
    }

    if (!response.ok) {
      logClientError("signaling POST:error", {
        action: payload.action,
        status: response.status,
        data,
      });
      throw new Error(data.message || "请求失败。");
    }

    logClientDebug("signaling POST:ok", {
      action: payload.action,
      status: response.status,
      data,
    });
    return data;
  }

  async function sendEnvelope(envelope: SignalingEnvelope) {
    if (!refs.roomCode.current || !refs.participantId.current) return;
    await post<{ ok: true }>({
      action: "send",
      roomCode: refs.roomCode.current,
      participantId: refs.participantId.current,
      envelope,
    });
  }

  function sendControlMessage(message: ControlMessage) {
    const channel = refs.controlChannel.current;
    if (!channel || channel.readyState !== "open") throw new Error("控制通道尚未打开。");
    channel.send(encodeControlMessage(message));
  }

  async function waitForBufferedAmount() {
    const channel = refs.dataChannel.current;
    if (!channel) throw new Error("数据通道不存在。");
    if (channel.bufferedAmount <= MAX_SEND_BUFFER_BYTES) return;

    await new Promise<void>((resolve, reject) => {
      const onClose = () => { cleanup(); reject(new Error("数据通道已关闭。")); };
      const onLow = () => { cleanup(); resolve(); };
      const cleanup = () => {
        channel.removeEventListener("close", onClose);
        channel.removeEventListener("bufferedamountlow", onLow);
      };
      channel.addEventListener("close", onClose, { once: true });
      channel.addEventListener("bufferedamountlow", onLow, { once: true });
    });
  }

  return { post, sendEnvelope, sendControlMessage, waitForBufferedAmount };
}

export function attachChannels(
  refs: TransferRefs,
  actions: TransferActions,
  signaling: ReturnType<typeof createSignaling>,
  startTransfer: () => Promise<void>,
  handleIncomingFrame: (buffer: ArrayBuffer) => Promise<void>,
) {
  function attachControlChannel(channel: RTCDataChannel) {
    refs.controlChannel.current = channel;

    channel.onopen = () => {
      refs.peerConnected.current = true;
      actions.setPeerConnected(true);
      sendManifestIfNeeded();
    };

    channel.onmessage = (event) => {
      const message = decodeControlMessage(String(event.data));

      if (message.type === "manifest") {
        actions.setManifest(message.manifest);
        actions.setDownloadArtifacts([]);
        actions.resetProgress(message.manifest);
        actions.setPhase("ready");
        actions.setStatusMessage("已收到文件清单，选择保存方式后开始接收。");
        return;
      }

      if (message.type === "receiver-ready") {
        actions.setReceiverConfirmed(true);
        actions.setStatusMessage("对端已确认，正在启动发送。");
        void startTransfer();
        return;
      }

      if (message.type === "transfer-complete") {
        actions.setPhase("completed");
        const isText = refs.manifest.current?.mode === "text";
        actions.setStatusMessage(
          isText
            ? "文本接收完成。"
            : refs.saveMode.current === "directory"
              ? "文件接收完成，已写入你选择的目录。"
              : "文件接收完成，可从下方链接保存到本机。",
        );
        void signaling.post<{ ok: true }>({
          action: "complete",
          roomCode: refs.roomCode.current,
          participantId: refs.participantId.current,
        });
        return;
      }

      if (message.type === "transfer-cancelled") {
        void actions.failSession(message.reason || "对端取消了本次传输。", "cancelled");
        return;
      }

      if (message.type === "transfer-error") void actions.failSession(message.message, "failed");
    };

    channel.onclose = () => {
      if (refs.phase.current === "completed" || refs.phase.current === "cancelled") return;
      if (refs.peerConnected.current) void actions.failSession("控制通道已断开，请重新生成分享码再试。", "failed");
    };
  }

  function attachDataChannel(channel: RTCDataChannel) {
    refs.dataChannel.current = channel;
    channel.binaryType = "arraybuffer";
    channel.bufferedAmountLowThreshold = BUFFER_LOW_WATERMARK_BYTES;

    channel.onmessage = (event) => {
      refs.receivingChain.current = refs.receivingChain.current
        .then(async () => {
          const buffer = await normalizeArrayBuffer(event.data as Blob | ArrayBuffer | string);
          await handleIncomingFrame(buffer);
        })
        .catch(async (error) => {
          const msg = error instanceof Error ? error.message : "接收数据时出错。";
          await actions.failSession(msg, "failed");
        });
    };

    channel.onclose = () => {
      if (refs.phase.current === "completed" || refs.phase.current === "cancelled") return;
      if (refs.peerConnected.current) void actions.failSession("数据通道已断开，请重新建立连接。", "failed");
    };
  }

  function sendManifestIfNeeded() {
    if (refs.role.current !== "sender" || refs.manifestSent.current) return;
    const nextManifest = refs.manifest.current;
    const channel = refs.controlChannel.current;
    if (!nextManifest || !channel || channel.readyState !== "open") return;
    signaling.sendControlMessage({ type: "manifest", manifest: nextManifest });
    refs.manifestSent.current = true;
    actions.setPhase("ready");
    actions.setStatusMessage("对端已接入，等待对方确认保存位置。");
  }

  return { attachControlChannel, attachDataChannel, sendManifestIfNeeded };
}

export function createRtcConnection(
  refs: TransferRefs,
  actions: TransferActions,
  cleanupFn: () => Promise<void>,
  signaling: ReturnType<typeof createSignaling>,
  channels: ReturnType<typeof attachChannels>,
) {
  function summarizeEnvelope(envelope: SignalingEnvelope) {
    if (envelope.type !== "signal") {
      return { type: envelope.type };
    }

    const payload = envelope.payload as RTCSessionDescriptionInit | RTCIceCandidateInit;
    if (envelope.kind === "ice") {
      return {
        type: envelope.type,
        kind: envelope.kind,
        candidate: "candidate" in payload ? payload.candidate : undefined,
        sdpMid: "sdpMid" in payload ? payload.sdpMid : undefined,
        sdpMLineIndex: "sdpMLineIndex" in payload ? payload.sdpMLineIndex : undefined,
      };
    }

    return {
      type: envelope.type,
      kind: envelope.kind,
      sdpType: "type" in payload ? payload.type : undefined,
      sdpLength: "sdp" in payload && typeof payload.sdp === "string" ? payload.sdp.length : undefined,
    };
  }

  async function flushPendingIceCandidates() {
    const conn = refs.connection.current;
    if (!conn?.remoteDescription) return;

    while (refs.pendingIceCandidates.current.length > 0) {
      const candidate = refs.pendingIceCandidates.current.shift();
      if (!candidate) continue;
      logClientDebug("rtc flush pending ICE", {
        roomCode: refs.roomCode.current,
        participantId: refs.participantId.current,
        remaining: refs.pendingIceCandidates.current.length,
      });
      await conn.addIceCandidate(candidate);
    }
  }

  async function initPeerConnection() {
    await cleanupFn();
    const connection = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });
    refs.connection.current = connection;
    refs.pendingIceCandidates.current = [];
    logClientDebug("rtc initPeerConnection", {
      roomCode: refs.roomCode.current,
      participantId: refs.participantId.current,
      role: refs.role.current,
    });

    connection.onconnectionstatechange = () => {
      logClientDebug("rtc connectionState", {
        state: connection.connectionState,
        roomCode: refs.roomCode.current,
        participantId: refs.participantId.current,
      });
      if (connection.connectionState === "connected") {
        refs.peerConnected.current = true;
        actions.setPeerConnected(true);
        if (refs.phase.current === "connecting") actions.setPhase("ready");
        return;
      }
      if (connection.connectionState === "failed" || connection.connectionState === "disconnected") {
        void actions.failSession("点对点连接已断开，请重新建立房间。", "failed");
      }
    };

    connection.oniceconnectionstatechange = () => {
      logClientDebug("rtc iceConnectionState", {
        state: connection.iceConnectionState,
        roomCode: refs.roomCode.current,
        participantId: refs.participantId.current,
      });
    };

    connection.onicegatheringstatechange = () => {
      logClientDebug("rtc iceGatheringState", {
        state: connection.iceGatheringState,
        roomCode: refs.roomCode.current,
        participantId: refs.participantId.current,
      });
    };

    connection.onicecandidate = (event) => {
      if (!event.candidate) return;
      logClientDebug("rtc local ICE candidate", {
        roomCode: refs.roomCode.current,
        participantId: refs.participantId.current,
        candidate: event.candidate.candidate,
        sdpMid: event.candidate.sdpMid,
        sdpMLineIndex: event.candidate.sdpMLineIndex,
      });
      void signaling.sendEnvelope({ type: "signal", kind: "ice", payload: event.candidate.toJSON() });
    };

    if (refs.role.current === "sender") {
      channels.attachControlChannel(connection.createDataChannel("control", { ordered: true }));
      channels.attachDataChannel(connection.createDataChannel("data", { ordered: true }));
    } else {
      connection.ondatachannel = (event) => {
        if (event.channel.label === "control") { channels.attachControlChannel(event.channel); return; }
        channels.attachDataChannel(event.channel);
      };
    }
  }

  async function handleOffer(payload: RTCSessionDescriptionInit) {
    const conn = refs.connection.current;
    if (!conn) throw new Error("接收方连接尚未初始化。");
    logClientDebug("rtc handle offer", {
      roomCode: refs.roomCode.current,
      participantId: refs.participantId.current,
      sdpLength: payload.sdp?.length,
      type: payload.type,
    });
    await conn.setRemoteDescription(payload);
    await flushPendingIceCandidates();
    const answer = await conn.createAnswer();
    await conn.setLocalDescription(answer);
    await signaling.sendEnvelope({ type: "signal", kind: "answer", payload: answer });
    actions.setPhase("connecting");
    actions.setStatusMessage("正在建立点对点连接。");
  }

  async function handleAnswer(payload: RTCSessionDescriptionInit) {
    const conn = refs.connection.current;
    if (!conn) throw new Error("发送方连接尚未初始化。");
    logClientDebug("rtc handle answer", {
      roomCode: refs.roomCode.current,
      participantId: refs.participantId.current,
      sdpLength: payload.sdp?.length,
      type: payload.type,
    });
    await conn.setRemoteDescription(payload);
    await flushPendingIceCandidates();
    actions.setPhase("connecting");
    actions.setStatusMessage("对端已回应，正在建立连接。");
  }

  async function handleCandidate(payload: RTCIceCandidateInit) {
    const conn = refs.connection.current;
    if (!conn) return;
    if (!conn.remoteDescription) {
      refs.pendingIceCandidates.current.push(payload);
      logClientWarn("rtc queue ICE before remoteDescription", {
        roomCode: refs.roomCode.current,
        participantId: refs.participantId.current,
        pendingCount: refs.pendingIceCandidates.current.length,
      });
      return;
    }
    logClientDebug("rtc handle ICE", {
      roomCode: refs.roomCode.current,
      participantId: refs.participantId.current,
      candidate: payload.candidate,
      sdpMid: payload.sdpMid,
      sdpMLineIndex: payload.sdpMLineIndex,
    });
    await conn.addIceCandidate(payload);
  }

  async function startOffer() {
    const conn = refs.connection.current;
    if (!conn) throw new Error("发送方连接尚未初始化。");
    const offer = await conn.createOffer();
    await conn.setLocalDescription(offer);
    logClientDebug("rtc start offer", {
      roomCode: refs.roomCode.current,
      participantId: refs.participantId.current,
      sdpLength: offer.sdp?.length,
      type: offer.type,
    });
    await signaling.sendEnvelope({ type: "signal", kind: "offer", payload: offer });
    actions.setPhase("connecting");
    actions.setStatusMessage("接收设备已加入房间，正在建立连接。");
  }

  async function handleSignalingEnvelope(envelope: SignalingEnvelope) {
    logClientDebug("signaling event", {
      roomCode: refs.roomCode.current,
      participantId: refs.participantId.current,
      envelope: summarizeEnvelope(envelope),
    });
    if (envelope.type === "peer-joined") { await startOffer(); return; }
    if (envelope.type === "room-expired") { await actions.failSession("分享码已过期，请重新生成后再试。", "expired"); return; }
    if (envelope.type === "room-cancelled") { await actions.failSession(envelope.reason || "对端取消了本次传输。", "cancelled"); return; }
    if (envelope.kind === "offer") { await handleOffer(envelope.payload as RTCSessionDescriptionInit); return; }
    if (envelope.kind === "answer") { await handleAnswer(envelope.payload as RTCSessionDescriptionInit); return; }
    await handleCandidate(envelope.payload as RTCIceCandidateInit);
  }

  function startEventLoop(roomCode: string, nextParticipantId: string) {
    refs.eventLoopAbort.current?.abort();
    const abortController = new AbortController();
    refs.eventLoopAbort.current = abortController;
    let cursor = 0;

    const run = async () => {
      while (!abortController.signal.aborted) {
        try {
          const params = new URLSearchParams({
            roomCode,
            participantId: nextParticipantId,
            cursor: String(cursor),
            timeoutMs: String(POLL_TIMEOUT_MS),
          });
          const response = await fetch(`${SIGNALING_ENDPOINT}?${params.toString()}`, {
            method: "GET",
            signal: abortController.signal,
            cache: "no-store",
          });
          const raw = await response.text();
          let payload: PollEventsResponse & { message?: string };
          try {
            payload = JSON.parse(raw) as PollEventsResponse & { message?: string };
          } catch {
            logClientError("signaling poll:invalid-json", {
              roomCode,
              participantId: nextParticipantId,
              cursor,
              status: response.status,
              body: raw,
            });
            throw new Error("信令服务返回了无效响应。");
          }

          if (!response.ok) {
            logClientError("signaling poll:error", {
              roomCode,
              participantId: nextParticipantId,
              cursor,
              status: response.status,
              data: payload,
            });
            throw new Error(payload.message || "请求失败。");
          }

          if (payload.events.length > 0) {
            logClientDebug("signaling poll:events", {
              roomCode,
              participantId: nextParticipantId,
              cursor,
              nextCursor: payload.nextCursor,
              eventCount: payload.events.length,
              eventIds: payload.events.map((event) => event.id),
            });
          }
          actions.setExpiresAt(payload.expiresAt);
          if (payload.events.length === 0) {
            cursor = payload.nextCursor;
            continue;
          }
          for (const event of payload.events) {
            await handleSignalingEnvelope(event.envelope);
            cursor = event.id;
          }
        } catch (error) {
          if (abortController.signal.aborted) return;
          const msg = error instanceof Error ? error.message : "信令轮询失败。";
          logClientWarn("signaling poll:retry", {
            roomCode,
            participantId: nextParticipantId,
            cursor,
            message: msg,
          });
          if (msg.includes("过期")) { await actions.failSession(msg, "expired"); return; }
          if (msg.includes("不存在") || msg.includes("结束")) { await actions.failSession(msg, "failed"); return; }
          await sleep(750);
        }
      }
    };

    void run();
  }

  return { initPeerConnection, startEventLoop, handleSignalingEnvelope };
}
