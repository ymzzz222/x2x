import { NextResponse } from "next/server";
import {
  cancelRoom,
  completeRoom,
  createRoom,
  joinRoom,
  pollEvents,
  sendEnvelope,
} from "@/lib/signaling-store";
import type { SignalingEnvelope } from "@/lib/transfer-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const POLL_TIMEOUT_MS = 25_000;
const SHOULD_LOG_SERVER_DEBUG = process.env.NODE_ENV === "production";

function jsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ message }, status);
}

function logServerDebug(message: string, detail?: unknown) {
  if (!SHOULD_LOG_SERVER_DEBUG) return;
  if (typeof detail === "undefined") {
    console.info("[x2x/api]", message);
    return;
  }
  console.info("[x2x/api]", message, detail);
}

function logServerError(message: string, detail?: unknown) {
  if (!SHOULD_LOG_SERVER_DEBUG) return;
  if (typeof detail === "undefined") {
    console.error("[x2x/api]", message);
    return;
  }
  console.error("[x2x/api]", message, detail);
}

function normalizeEnvelope(input: unknown): SignalingEnvelope | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const envelope = input as Record<string, unknown>;
  if (envelope.type === "peer-joined" || envelope.type === "room-expired") {
    return { type: envelope.type } as SignalingEnvelope;
  }

  if (envelope.type === "room-cancelled") {
    return {
      type: "room-cancelled",
      reason: typeof envelope.reason === "string" ? envelope.reason : undefined,
    };
  }

  if (
    envelope.type === "signal" &&
    (envelope.kind === "offer" || envelope.kind === "answer" || envelope.kind === "ice") &&
    envelope.payload &&
    typeof envelope.payload === "object"
  ) {
    return {
      type: "signal",
      kind: envelope.kind,
      payload: envelope.payload,
    };
  }

  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomCode = searchParams.get("roomCode")?.trim();
  const participantId = searchParams.get("participantId")?.trim();
  const cursor = Number(searchParams.get("cursor") ?? "0");
  const timeoutMs = Math.min(
    Number(searchParams.get("timeoutMs") ?? String(POLL_TIMEOUT_MS)) || POLL_TIMEOUT_MS,
    POLL_TIMEOUT_MS,
  );

  if (!roomCode || !participantId) {
    logServerError("GET missing room info", { roomCode, participantId, cursor, timeoutMs });
    return errorResponse("缺少房间信息。", 400);
  }

  try {
    const payload = await pollEvents(roomCode, participantId, cursor, timeoutMs);
    if (payload.events.length > 0) {
      logServerDebug("GET poll events", {
        roomCode,
        participantId,
        cursor,
        nextCursor: payload.nextCursor,
        eventCount: payload.events.length,
        eventIds: payload.events.map((event) => event.id),
      });
    }
    return jsonResponse(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    logServerError("GET poll failed", {
      roomCode,
      participantId,
      cursor,
      timeoutMs,
      message,
    });

    if (message === "ROOM_EXPIRED") {
      return errorResponse("分享码已过期。", 410);
    }

    if (message === "ROOM_NOT_FOUND" || message === "PARTICIPANT_NOT_FOUND") {
      return errorResponse("房间不存在或已结束。", 404);
    }

    return errorResponse("信令轮询失败。", 500);
  }
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    logServerError("POST invalid JSON body");
    return errorResponse("请求体不是有效 JSON。", 400);
  }

  const action = typeof body.action === "string" ? body.action : "";

  try {
    switch (action) {
      case "create":
        {
          const session = await createRoom();
          logServerDebug("POST create ok", session);
          return jsonResponse(session, 201);
        }
      case "join": {
        const roomCode = typeof body.roomCode === "string" ? body.roomCode.trim() : "";
        if (!/^\d{6}$/.test(roomCode)) {
          logServerError("POST join invalid roomCode", { roomCode });
          return errorResponse("请输入 6 位分享码。", 400);
        }

        const session = await joinRoom(roomCode);
        logServerDebug("POST join ok", session);
        return jsonResponse(session);
      }
      case "send": {
        const roomCode = typeof body.roomCode === "string" ? body.roomCode.trim() : "";
        const participantId = typeof body.participantId === "string" ? body.participantId.trim() : "";
        const envelope = normalizeEnvelope(body.envelope);

        if (!roomCode || !participantId || !envelope) {
          logServerError("POST send incomplete payload", { roomCode, participantId, hasEnvelope: Boolean(envelope) });
          return errorResponse("信令消息不完整。", 400);
        }

        await sendEnvelope(roomCode, participantId, envelope);
        logServerDebug("POST send ok", {
          roomCode,
          participantId,
          envelopeType: envelope.type,
          kind: envelope.type === "signal" ? envelope.kind : undefined,
        });
        return jsonResponse({ ok: true });
      }
      case "cancel": {
        const roomCode = typeof body.roomCode === "string" ? body.roomCode.trim() : "";
        const participantId = typeof body.participantId === "string" ? body.participantId.trim() : "";
        const reason = typeof body.reason === "string" ? body.reason.trim() : undefined;

        if (!roomCode || !participantId) {
          logServerError("POST cancel missing identifiers", { roomCode, participantId });
          return errorResponse("取消房间时缺少标识。", 400);
        }

        await cancelRoom(roomCode, participantId, reason);
        logServerDebug("POST cancel ok", { roomCode, participantId, reason });
        return jsonResponse({ ok: true });
      }
      case "complete": {
        const roomCode = typeof body.roomCode === "string" ? body.roomCode.trim() : "";
        const participantId = typeof body.participantId === "string" ? body.participantId.trim() : "";

        if (!roomCode || !participantId) {
          logServerError("POST complete missing identifiers", { roomCode, participantId });
          return errorResponse("完成房间时缺少标识。", 400);
        }

        await completeRoom(roomCode, participantId);
        logServerDebug("POST complete ok", { roomCode, participantId });
        return jsonResponse({ ok: true });
      }
      default:
        logServerError("POST unsupported action", { action });
        return errorResponse("不支持的信令动作。", 400);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    logServerError("POST action failed", { action, message, body });

    if (message === "ROOM_NOT_FOUND") {
      return errorResponse("分享码不存在。", 404);
    }

    if (message === "ROOM_EXPIRED") {
      return errorResponse("分享码已过期。", 410);
    }

    if (message === "ROOM_CANCELLED") {
      return errorResponse("房间已取消。", 409);
    }

    if (message === "ROOM_COMPLETED") {
      return errorResponse("房间已完成。", 409);
    }

    if (message === "ROOM_OCCUPIED") {
      return errorResponse("该分享码已被另一台设备占用。", 409);
    }

    if (message === "ROOM_CLOSED") {
      return errorResponse("房间已关闭。", 409);
    }

    return errorResponse("信令服务暂时不可用。", 500);
  }
}
