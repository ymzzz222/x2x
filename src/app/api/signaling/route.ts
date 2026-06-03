import { NextResponse } from "next/server";
import {
  cancelRoom,
  completeRoom,
  createRoom,
  joinRoom,
  sendEnvelope,
  subscribeToRoom,
} from "@/lib/signaling-store";
import type { SignalingEnvelope } from "@/lib/transfer-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

function normalizeEnvelope(input: unknown): SignalingEnvelope | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const envelope = input as Record<string, unknown>;
  if (
    envelope.type === "signal" &&
    (envelope.kind === "offer" || envelope.kind === "answer") &&
    envelope.payload &&
    typeof envelope.payload === "object"
  ) {
    return {
      type: "signal",
      kind: envelope.kind,
      payload: envelope.payload as RTCSessionDescriptionInit,
    };
  }

  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const roomCode = searchParams.get("roomCode")?.trim();
  const participantId = searchParams.get("participantId")?.trim();
  const lastEventId = Number(request.headers.get("last-event-id") ?? "0") || 0;

  if (!roomCode || !participantId) {
    return errorResponse("缺少房间信息。", 400);
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let closed = false;

      const push = (event: { id: number; envelope: SignalingEnvelope }) => {
        if (closed) {
          return;
        }
        controller.enqueue(
          encoder.encode(`id: ${event.id}\ndata: ${JSON.stringify(event.envelope)}\n\n`),
        );
      };

      controller.enqueue(encoder.encode(": connected\n\n"));

      let unsubscribe: (() => void) | null = null;

      try {
        unsubscribe = await subscribeToRoom(roomCode, participantId, lastEventId, push);
      } catch (error) {
        const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
        const statusMessage =
          message === "ROOM_EXPIRED"
            ? "分享码已过期。"
            : message === "ROOM_NOT_FOUND" || message === "PARTICIPANT_NOT_FOUND"
              ? "房间不存在或已结束。"
              : "无法建立事件流。";
        controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ message: statusMessage })}\n\n`));
        controller.close();
        return;
      }

      const heartbeat = setInterval(() => {
        if (!closed) {
          controller.enqueue(encoder.encode(": keep-alive\n\n"));
        }
      }, 15_000);

      const close = () => {
        if (closed) {
          return;
        }
        closed = true;
        clearInterval(heartbeat);
        unsubscribe?.();
        controller.close();
      };

      request.signal.addEventListener("abort", close, { once: true });
    },
    cancel() {
      return undefined;
    },
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-store",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream",
    },
  });
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return errorResponse("请求体不是有效 JSON。", 400);
  }

  const action = typeof body.action === "string" ? body.action : "";

  try {
    switch (action) {
      case "create":
        return jsonResponse(await createRoom(), 201);
      case "join": {
        const roomCode = typeof body.roomCode === "string" ? body.roomCode.trim() : "";
        if (!/^\d{6}$/.test(roomCode)) {
          return errorResponse("请输入 6 位分享码。", 400);
        }

        return jsonResponse(await joinRoom(roomCode));
      }
      case "send": {
        const roomCode = typeof body.roomCode === "string" ? body.roomCode.trim() : "";
        const participantId = typeof body.participantId === "string" ? body.participantId.trim() : "";
        const envelope = normalizeEnvelope(body.envelope);

        if (!roomCode || !participantId || !envelope) {
          return errorResponse("信令消息不完整。", 400);
        }

        await sendEnvelope(roomCode, participantId, envelope);
        return jsonResponse({ ok: true });
      }
      case "cancel": {
        const roomCode = typeof body.roomCode === "string" ? body.roomCode.trim() : "";
        const participantId = typeof body.participantId === "string" ? body.participantId.trim() : "";
        const reason = typeof body.reason === "string" ? body.reason.trim() : undefined;

        if (!roomCode || !participantId) {
          return errorResponse("取消房间时缺少标识。", 400);
        }

        await cancelRoom(roomCode, participantId, reason);
        return jsonResponse({ ok: true });
      }
      case "complete": {
        const roomCode = typeof body.roomCode === "string" ? body.roomCode.trim() : "";
        const participantId = typeof body.participantId === "string" ? body.participantId.trim() : "";

        if (!roomCode || !participantId) {
          return errorResponse("完成房间时缺少标识。", 400);
        }

        await completeRoom(roomCode, participantId);
        return jsonResponse({ ok: true });
      }
      default:
        return errorResponse("不支持的信令动作。", 400);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";

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
