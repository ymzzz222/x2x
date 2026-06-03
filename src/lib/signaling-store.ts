import type { RoomRole, SignalingEnvelope } from "@/lib/transfer-types";

const ROOM_TTL_MS = 10 * 60 * 1000;
const CLOSED_ROOM_RETENTION_MS = 30 * 1000;
const MAX_CODE_ATTEMPTS = 20;

type RoomStatus = "active" | "expired" | "cancelled" | "completed";
type EventTarget = RoomRole | "both";

interface ParticipantRecord {
  id: string;
  role: RoomRole;
}

interface RoomRecord {
  code: string;
  createdAt: number;
  expiresAt: number;
  closedAt: number | null;
  status: RoomStatus;
  sender: ParticipantRecord;
  receiver: ParticipantRecord | null;
  streams: Map<string, (envelope: SignalingEnvelope) => void>;
}

interface SignalingStore {
  rooms: Map<string, RoomRecord>;
}

const globalStore = globalThis as typeof globalThis & {
  __x2xSignalingStore?: SignalingStore;
};

function getStore(): SignalingStore {
  if (!globalStore.__x2xSignalingStore) {
    globalStore.__x2xSignalingStore = {
      rooms: new Map<string, RoomRecord>(),
    };
  }

  return globalStore.__x2xSignalingStore;
}

function now() {
  return Date.now();
}

function randomCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function createRoomRecord(code: string, currentTime = now()): RoomRecord {
  return {
    code,
    createdAt: currentTime,
    expiresAt: currentTime + ROOM_TTL_MS,
    closedAt: null,
    status: "active",
    sender: {
      id: crypto.randomUUID(),
      role: "sender",
    },
    receiver: null,
    streams: new Map(),
  };
}

function findParticipant(room: RoomRecord, participantId: string): ParticipantRecord | null {
  if (room.sender.id === participantId) {
    return room.sender;
  }

  if (room.receiver?.id === participantId) {
    return room.receiver;
  }

  return null;
}

function publish(room: RoomRecord, target: EventTarget, envelope: SignalingEnvelope) {
  for (const [participantId, stream] of room.streams.entries()) {
    const participant = findParticipant(room, participantId);
    if (!participant) {
      room.streams.delete(participantId);
      continue;
    }

    if (target === "both" || participant.role === target) {
      stream(envelope);
    }
  }
}

function pruneRooms(currentTime = now()) {
  const store = getStore();

  for (const [code, room] of store.rooms.entries()) {
    if (room.status === "active" && currentTime >= room.expiresAt) {
      room.status = "expired";
      room.closedAt = currentTime;
      publish(room, "both", { type: "room-expired" });
    }

    const closedAt = room.closedAt ?? room.expiresAt;
    if (currentTime - closedAt > CLOSED_ROOM_RETENTION_MS) {
      room.streams.clear();
      store.rooms.delete(code);
    }
  }
}

function getRoom(code: string) {
  pruneRooms();
  return getStore().rooms.get(code) ?? null;
}

function ensureParticipant(code: string, participantId: string) {
  const room = getRoom(code);
  if (!room) {
    throw new Error("ROOM_NOT_FOUND");
  }

  const participant = findParticipant(room, participantId);
  if (!participant) {
    throw new Error("PARTICIPANT_NOT_FOUND");
  }

  return { room, participant };
}

function closeRoom(room: RoomRecord, status: Exclude<RoomStatus, "active">, target: EventTarget, envelope?: SignalingEnvelope) {
  if (room.status !== "active") {
    return;
  }

  room.status = status;
  room.closedAt = now();

  if (envelope) {
    publish(room, target, envelope);
  }
}

export async function createRoom() {
  pruneRooms();
  const store = getStore();

  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
    const code = randomCode();
    if (store.rooms.has(code)) {
      continue;
    }

    const room = createRoomRecord(code);
    store.rooms.set(code, room);

    return {
      roomCode: code,
      participantId: room.sender.id,
    };
  }

  throw new Error("ROOM_CODE_GENERATION_FAILED");
}

export async function joinRoom(code: string) {
  const room = getRoom(code);
  if (!room) {
    throw new Error("ROOM_NOT_FOUND");
  }

  if (room.status === "expired") {
    throw new Error("ROOM_EXPIRED");
  }

  if (room.status === "cancelled") {
    throw new Error("ROOM_CANCELLED");
  }

  if (room.status === "completed") {
    throw new Error("ROOM_COMPLETED");
  }

  if (room.receiver) {
    throw new Error("ROOM_OCCUPIED");
  }

  room.receiver = {
    id: crypto.randomUUID(),
    role: "receiver",
  };

  publish(room, "sender", { type: "peer-joined" });

  return {
    roomCode: code,
    participantId: room.receiver.id,
  };
}

export async function sendEnvelope(code: string, participantId: string, envelope: SignalingEnvelope) {
  const { room, participant } = ensureParticipant(code, participantId);

  if (room.status !== "active") {
    throw new Error(room.status === "expired" ? "ROOM_EXPIRED" : "ROOM_CLOSED");
  }

  const target: EventTarget = participant.role === "sender" ? "receiver" : "sender";
  publish(room, target, envelope);
}

export async function cancelRoom(code: string, participantId: string, reason?: string) {
  const { room, participant } = ensureParticipant(code, participantId);

  closeRoom(
    room,
    "cancelled",
    participant.role === "sender" ? "receiver" : "sender",
    {
      type: "room-cancelled",
      reason,
    },
  );
}

export async function completeRoom(code: string, participantId: string) {
  const { room } = ensureParticipant(code, participantId);
  closeRoom(room, "completed", "both");
}

export async function subscribeToRoom(
  code: string,
  participantId: string,
  onEnvelope: (envelope: SignalingEnvelope) => void,
) {
  const { room } = ensureParticipant(code, participantId);

  if (room.status === "expired") {
    onEnvelope({ type: "room-expired" });
  }

  room.streams.set(participantId, onEnvelope);

  return () => {
    const nextRoom = getStore().rooms.get(code);
    nextRoom?.streams.delete(participantId);
  };
}
