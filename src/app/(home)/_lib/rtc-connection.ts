import type { ControlMessage, SignalingEnvelope } from "@/lib/transfer-types";
import {
  BUFFER_LOW_WATERMARK_BYTES,
  ICE_DISCONNECT_GRACE_MS,
  MAX_SEND_BUFFER_BYTES,
  NEGOTIATION_TIMEOUT_MS,
  SIGNALING_ENDPOINT,
  decodeControlMessage,
  encodeControlMessage,
  getRtcConfiguration,
  logClientDebug,
  logClientError,
  normalizeArrayBuffer,
  summarizeRtcConfiguration,
} from "./transfer-utils";
import type { TransferActions, TransferRefs } from "./types";

async function waitForIceGatheringComplete(connection: RTCPeerConnection) {
  if (connection.iceGatheringState === "complete") {
    return;
  }

  await new Promise<void>((resolve) => {
    const onStateChange = () => {
      if (connection.iceGatheringState !== "complete") {
        return;
      }

      connection.removeEventListener("icegatheringstatechange", onStateChange);
      resolve();
    };

    connection.addEventListener("icegatheringstatechange", onStateChange);
  });
}

export function cleanupRtc(refs: TransferRefs, actions: TransferActions) {
  return async () => {
    if (refs.negotiationTimer.current) {
      clearTimeout(refs.negotiationTimer.current);
      refs.negotiationTimer.current = null;
    }
    refs.eventSource.current?.close();
    refs.eventSource.current = null;
    refs.controlChannel.current?.close();
    refs.dataChannel.current?.close();
    refs.connection.current?.close();
    refs.controlChannel.current = null;
    refs.dataChannel.current = null;
    refs.connection.current = null;
    refs.manifestSent.current = false;
    refs.sending.current = false;
    refs.peerConnected.current = false;
    refs.negotiationAttempts.current = 0;
    actions.setPeerConnected(false);

    const sink = refs.currentSink.current;
    refs.currentSink.current = null;
    if (sink?.writable) await sink.writable.abort();
  };
}

export function createSignaling(refs: TransferRefs) {
  async function post<T>(payload: Record<string, unknown>) {
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
      throw new Error(data.message || "请求失败。");
    }

    return data;
  }

  async function sendEnvelope(envelope: SignalingEnvelope) {
    if (!refs.roomCode.current || !refs.participantId.current) {
      return;
    }

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
      actions.setPhase("ready");
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
      if (refs.peerConnected.current) void actions.failSession("控制通道已断开，请重新建立房间。", "failed");
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
  async function initPeerConnection() {
    const currentEventSource = refs.eventSource.current;
    await cleanupFn();
    refs.eventSource.current = currentEventSource;

    const rtcConfiguration = getRtcConfiguration();
    const connection = new RTCPeerConnection(rtcConfiguration);
    let disconnectTimer: ReturnType<typeof setTimeout> | null = null;
    refs.connection.current = connection;

    logClientDebug("rtc initPeerConnection", {
      roomCode: refs.roomCode.current,
      participantId: refs.participantId.current,
      role: refs.role.current,
      rtcConfiguration: summarizeRtcConfiguration(rtcConfiguration),
    });

    connection.onconnectionstatechange = () => {
      if (connection.connectionState === "connected") {
        if (disconnectTimer) {
          clearTimeout(disconnectTimer);
          disconnectTimer = null;
        }
        if (refs.negotiationTimer.current) {
          clearTimeout(refs.negotiationTimer.current);
          refs.negotiationTimer.current = null;
        }
        refs.peerConnected.current = true;
        actions.setPeerConnected(true);
        actions.setPhase("ready");
        return;
      }

      if (connection.connectionState === "disconnected") {
        if (disconnectTimer) return;
        disconnectTimer = setTimeout(() => {
          disconnectTimer = null;
          if (refs.connection.current !== connection) return;
          if (connection.connectionState === "disconnected") {
            void actions.failSession("点对点连接已断开，请重新建立房间。", "failed");
          }
        }, ICE_DISCONNECT_GRACE_MS);
        return;
      }

      if (disconnectTimer) {
        clearTimeout(disconnectTimer);
        disconnectTimer = null;
      }

      if (connection.connectionState === "failed") {
        void actions.failSession("点对点连接失败，请重新生成分享码再试。", "failed");
      }
    };

    connection.onicecandidateerror = (event) => {
      logClientError("rtc iceCandidateError", {
        address: event.address,
        port: event.port,
        url: event.url,
        errorCode: event.errorCode,
        errorText: event.errorText,
      });
    };

    if (refs.role.current === "sender") {
      channels.attachControlChannel(connection.createDataChannel("control", { ordered: true }));
      channels.attachDataChannel(connection.createDataChannel("data", { ordered: true }));
    } else {
      connection.ondatachannel = (event) => {
        if (event.channel.label === "control") {
          channels.attachControlChannel(event.channel);
          return;
        }
        channels.attachDataChannel(event.channel);
      };
    }
  }

  function startNegotiationTimeout() {
    if (refs.negotiationTimer.current) {
      clearTimeout(refs.negotiationTimer.current);
    }

    refs.negotiationTimer.current = setTimeout(() => {
      refs.negotiationTimer.current = null;
      if (refs.peerConnected.current || refs.phase.current === "transferring") {
        return;
      }

      if (refs.role.current === "sender" && refs.negotiationAttempts.current < 1) {
        refs.negotiationAttempts.current += 1;
        void restartOffer();
        return;
      }

      void actions.failSession("局域网配对超时，请重新生成分享码再试。", "failed");
    }, NEGOTIATION_TIMEOUT_MS);
  }

  async function startOffer() {
    const conn = refs.connection.current;
    if (!conn) throw new Error("发送方连接尚未初始化。");

    const offer = await conn.createOffer();
    await conn.setLocalDescription(offer);
    await waitForIceGatheringComplete(conn);

    if (!conn.localDescription) {
      throw new Error("无法生成完整的连接信息。");
    }

    await signaling.sendEnvelope({
      type: "signal",
      kind: "offer",
      payload: conn.localDescription.toJSON(),
    });

    actions.setPhase("negotiating");
    actions.setStatusMessage("接收设备已加入房间，正在建立局域网连接。");
    startNegotiationTimeout();
  }

  async function restartOffer() {
    await initPeerConnection();
    await startOffer();
  }

  async function handleOffer(payload: RTCSessionDescriptionInit) {
    await initPeerConnection();
    const conn = refs.connection.current;
    if (!conn) throw new Error("接收方连接尚未初始化。");

    await conn.setRemoteDescription(payload);
    const answer = await conn.createAnswer();
    await conn.setLocalDescription(answer);
    await waitForIceGatheringComplete(conn);

    if (!conn.localDescription) {
      throw new Error("无法生成完整的应答信息。");
    }

    await signaling.sendEnvelope({
      type: "signal",
      kind: "answer",
      payload: conn.localDescription.toJSON(),
    });

    actions.setPhase("negotiating");
    actions.setStatusMessage("已回应发送方，正在建立局域网连接。");
    startNegotiationTimeout();
  }

  async function handleAnswer(payload: RTCSessionDescriptionInit) {
    const conn = refs.connection.current;
    if (!conn) throw new Error("发送方连接尚未初始化。");

    await conn.setRemoteDescription(payload);
    actions.setPhase("negotiating");
    actions.setStatusMessage("对端已回应，正在建立局域网连接。");
    startNegotiationTimeout();
  }

  async function handleSignalingEnvelope(envelope: SignalingEnvelope) {
    if (envelope.type === "peer-joined") {
      refs.negotiationAttempts.current = 0;
      await startOffer();
      return;
    }

    if (envelope.type === "room-expired") {
      await actions.failSession("分享码已过期，请重新生成后再试。", "failed");
      return;
    }

    if (envelope.type === "room-cancelled") {
      await actions.failSession(envelope.reason || "对端取消了本次传输。", "cancelled");
      return;
    }

    if (envelope.kind === "offer") {
      await handleOffer(envelope.payload);
      return;
    }

    await handleAnswer(envelope.payload);
  }

  function startEventStream(roomCode: string, participantId: string) {
    refs.eventSource.current?.close();

    const params = new URLSearchParams({ roomCode, participantId });
    const source = new EventSource(`${SIGNALING_ENDPOINT}?${params.toString()}`);
    refs.eventSource.current = source;

    source.onmessage = (event) => {
      try {
        const envelope = JSON.parse(event.data) as SignalingEnvelope;
        void handleSignalingEnvelope(envelope);
      } catch (error) {
        logClientError("signaling stream:invalid-json", {
          message: error instanceof Error ? error.message : "UNKNOWN_ERROR",
          data: event.data,
        });
      }
    };

    source.onerror = () => {
      if (refs.phase.current === "completed" || refs.phase.current === "cancelled") {
        return;
      }

      if (refs.peerConnected.current || refs.phase.current === "transferring") {
        return;
      }

      void actions.failSession("配对通道已断开，请重新生成分享码再试。", "failed");
    };
  }

  return { initPeerConnection, startEventStream, handleSignalingEnvelope };
}
