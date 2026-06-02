import type { PollEventsResponse, RoomRole, SignalingEnvelope, SignalingEvent } from "@/lib/transfer-types";

const ROOM_TTL_MS = 10 * 60 * 1000;
const ROOM_RETENTION_MS = 5 * 60 * 1000;
const MAX_CODE_ATTEMPTS = 20;

type RoomStatus = "active" | "expired" | "cancelled" | "completed";
type EventTarget = RoomRole | "both";

interface ParticipantRecord {
  id: string;
  role: RoomRole;
}

interface RoomEvent extends SignalingEvent {
  target: EventTarget;
}

interface RoomRecord {
  code: string;
  createdAt: number;
  expiresAt: number;
  closedAt: number | null;
  status: RoomStatus;
  nextEventId: number;
  sender: ParticipantRecord;
  receiver: ParticipantRecord | null;
  events: RoomEvent[];
  waiters: Set<() => void>;
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

function wakeWaiters(room: RoomRecord) {
  const waiters = Array.from(room.waiters);
  room.waiters.clear();
  for (const wake of waiters) {
    wake();
  }
}

function enqueueEvent(room: RoomRecord, target: EventTarget, envelope: SignalingEnvelope) {
  room.events.push({
    id: room.nextEventId,
    target,
    envelope,
  });
  room.nextEventId += 1;
  wakeWaiters(room);
}

function pruneRooms(currentTime = now()) {
  const store = getStore();

  for (const [code, room] of store.rooms.entries()) {
    if (room.status === "active" && currentTime >= room.expiresAt) {
      room.status = "expired";
      room.closedAt = currentTime;
      enqueueEvent(room, "both", { type: "room-expired" });
    }

    const closedAt = room.closedAt ?? room.expiresAt;
    if (currentTime - closedAt > ROOM_RETENTION_MS) {
      wakeWaiters(room);
      store.rooms.delete(code);
    }
  }
}

function getRoomRecord(code: string) {
  pruneRooms();
  return getStore().rooms.get(code);
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

function ensureParticipant(code: string, participantId: string) {
  const room = getRoomRecord(code);
  if (!room) {
    throw new Error("ROOM_NOT_FOUND");
  }

  const participant = findParticipant(room, participantId);
  if (!participant) {
    throw new Error("PARTICIPANT_NOT_FOUND");
  }

  return { room, participant };
}

function randomCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function createRoom() {
  pruneRooms();
  const store = getStore();

  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
    const code = randomCode();
    if (store.rooms.has(code)) {
      continue;
    }

    const currentTime = now();
    const room: RoomRecord = {
      code,
      createdAt: currentTime,
      expiresAt: currentTime + ROOM_TTL_MS,
      closedAt: null,
      status: "active",
      nextEventId: 1,
      sender: {
        id: crypto.randomUUID(),
        role: "sender",
      },
      receiver: null,
      events: [],
      waiters: new Set(),
    };

    store.rooms.set(code, room);

    return {
      roomCode: code,
      participantId: room.sender.id,
      expiresAt: room.expiresAt,
    };
  }

  throw new Error("ROOM_CODE_GENERATION_FAILED");
}

export function joinRoom(code: string) {
  const room = getRoomRecord(code);
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

  enqueueEvent(room, "sender", { type: "peer-joined" });

  return {
    roomCode: code,
    participantId: room.receiver.id,
    expiresAt: room.expiresAt,
  };
}

export function sendEnvelope(code: string, participantId: string, envelope: SignalingEnvelope) {
  const { room, participant } = ensureParticipant(code, participantId);

  if (room.status !== "active") {
    throw new Error(room.status === "expired" ? "ROOM_EXPIRED" : "ROOM_CLOSED");
  }

  const target: EventTarget = participant.role === "sender" ? "receiver" : "sender";
  enqueueEvent(room, target, envelope);
}

export function cancelRoom(code: string, participantId: string, reason?: string) {
  const { room, participant } = ensureParticipant(code, participantId);

  if (room.status !== "active") {
    return;
  }

  room.status = "cancelled";
  room.closedAt = now();
  enqueueEvent(room, participant.role === "sender" ? "receiver" : "sender", {
    type: "room-cancelled",
    reason,
  });
}

export function completeRoom(code: string, participantId: string) {
  const { room } = ensureParticipant(code, participantId);

  if (room.status !== "active") {
    return;
  }

  room.status = "completed";
  room.closedAt = now();
  wakeWaiters(room);
}

function getVisibleEvents(room: RoomRecord, role: RoomRole, cursor: number) {
  const visible = room.events.filter(
    (event) => event.id > cursor && (event.target === role || event.target === "both"),
  );
  const nextCursor = room.events.at(-1)?.id ?? cursor;

  return {
    events: visible.map((event) => ({ id: event.id, envelope: event.envelope })),
    nextCursor,
  };
}

export async function pollEvents(
  code: string,
  participantId: string,
  cursor: number,
  timeoutMs: number,
): Promise<PollEventsResponse> {
  const { room, participant } = ensureParticipant(code, participantId);

  const immediate = getVisibleEvents(room, participant.role, cursor);
  if (immediate.events.length > 0 || room.status !== "active") {
    return {
      ...immediate,
      expiresAt: room.expiresAt,
    };
  }

  await new Promise<void>((resolve) => {
    const timer = setTimeout(() => {
      room.waiters.delete(wake);
      resolve();
    }, timeoutMs);

    const wake = () => {
      clearTimeout(timer);
      room.waiters.delete(wake);
      resolve();
    };

    room.waiters.add(wake);
  });

  const latestRoom = getRoomRecord(code);
  if (!latestRoom) {
    throw new Error("ROOM_NOT_FOUND");
  }

  const latestParticipant = findParticipant(latestRoom, participantId);
  if (!latestParticipant) {
    throw new Error("PARTICIPANT_NOT_FOUND");
  }

  const next = getVisibleEvents(latestRoom, latestParticipant.role, cursor);
  return {
    ...next,
    expiresAt: latestRoom.expiresAt,
  };
}
