import type { PollEventsResponse, RoomRole, SignalingEnvelope, SignalingEvent } from "@/lib/transfer-types";

const ROOM_TTL_MS = 10 * 60 * 1000;
const ROOM_RETENTION_MS = 5 * 60 * 1000;
const MAX_CODE_ATTEMPTS = 20;
const REDIS_POLL_INTERVAL_MS = 400;
const REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL?.trim() ?? "";
const REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN?.trim() ?? "";

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

interface RedisRoomRecord {
  code: string;
  createdAt: number;
  expiresAt: number;
  closedAt: number | null;
  status: RoomStatus;
  sender: ParticipantRecord;
  receiver: ParticipantRecord | null;
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

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
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
    nextEventId: 1,
    sender: {
      id: crypto.randomUUID(),
      role: "sender",
    },
    receiver: null,
    events: [],
    waiters: new Set(),
  };
}

function persistableRedisRoom(room: RoomRecord): RedisRoomRecord {
  return {
    code: room.code,
    createdAt: room.createdAt,
    expiresAt: room.expiresAt,
    closedAt: room.closedAt,
    status: room.status,
    sender: room.sender,
    receiver: room.receiver,
  };
}

function hydrateRedisRoom(room: RedisRoomRecord): RoomRecord {
  return {
    ...room,
    nextEventId: 1,
    events: [],
    waiters: new Set(),
  };
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

function findParticipant(room: RoomRecord, participantId: string): ParticipantRecord | null {
  if (room.sender.id === participantId) {
    return room.sender;
  }

  if (room.receiver?.id === participantId) {
    return room.receiver;
  }

  return null;
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

function isRedisConfigured() {
  return Boolean(REDIS_REST_URL && REDIS_REST_TOKEN);
}

function roomKey(code: string) {
  return `x2x:room:${code}`;
}

function roomEventsKey(code: string) {
  return `x2x:room:${code}:events`;
}

function roomSeqKey(code: string) {
  return `x2x:room:${code}:seq`;
}

function ttlSecondsForRoom(room: RoomRecord, currentTime = now()) {
  const keepUntil = (room.closedAt ?? room.expiresAt) + ROOM_RETENTION_MS;
  return Math.max(1, Math.ceil((keepUntil - currentTime) / 1000));
}

async function redisCommand<T>(args: Array<string | number>) {
  const response = await fetch(REDIS_REST_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REDIS_REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`REDIS_HTTP_${response.status}`);
  }

  const payload = (await response.json()) as { result?: T; error?: string };
  if (payload.error) {
    throw new Error(payload.error);
  }

  return payload.result as T;
}

async function redisPipeline(commands: Array<Array<string | number>>) {
  const response = await fetch(`${REDIS_REST_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REDIS_REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`REDIS_HTTP_${response.status}`);
  }

  const payload = (await response.json()) as Array<{ result?: unknown; error?: string }>;
  const firstError = payload.find((item) => item.error)?.error;
  if (firstError) {
    throw new Error(firstError);
  }

  return payload;
}

async function saveRedisRoomMeta(room: RoomRecord, currentTime = now()) {
  const ttlSeconds = ttlSecondsForRoom(room, currentTime);
  await redisPipeline([
    ["SET", roomKey(room.code), JSON.stringify(persistableRedisRoom(room)), "EX", ttlSeconds],
    ["EXPIRE", roomEventsKey(room.code), ttlSeconds],
    ["EXPIRE", roomSeqKey(room.code), ttlSeconds],
  ]);
}

async function deleteRedisRoom(code: string) {
  await redisPipeline([
    ["DEL", roomKey(code)],
    ["DEL", roomEventsKey(code)],
    ["DEL", roomSeqKey(code)],
  ]);
}

async function loadRedisEvents(code: string) {
  const payload = await redisCommand<string[]>(["LRANGE", roomEventsKey(code), 0, -1]);
  return payload
    .map((item) => JSON.parse(item) as RoomEvent)
    .sort((left, right) => left.id - right.id);
}

async function appendRedisEvent(
  room: RoomRecord,
  target: EventTarget,
  envelope: SignalingEnvelope,
) {
  const ttlSeconds = ttlSecondsForRoom(room);
  const id = await redisCommand<number>(["INCR", roomSeqKey(room.code)]);
  const event = JSON.stringify({ id, target, envelope } satisfies RoomEvent);
  await redisPipeline([
    ["RPUSH", roomEventsKey(room.code), event],
    ["EXPIRE", roomEventsKey(room.code), ttlSeconds],
    ["EXPIRE", roomSeqKey(room.code), ttlSeconds],
  ]);
}

async function loadRedisRoom(code: string, currentTime = now()) {
  const payload = await redisCommand<string | null>(["GET", roomKey(code)]);
  if (!payload) {
    return null;
  }

  const room = hydrateRedisRoom(JSON.parse(payload) as RedisRoomRecord);

  if (room.status === "active" && currentTime >= room.expiresAt) {
    room.status = "expired";
    room.closedAt = currentTime;
    await saveRedisRoomMeta(room, currentTime);
    await appendRedisEvent(room, "both", { type: "room-expired" });
    return room;
  }

  const closedAt = room.closedAt ?? room.expiresAt;
  if (currentTime - closedAt > ROOM_RETENTION_MS) {
    await deleteRedisRoom(code);
    return null;
  }

  return room;
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

function getMemoryRoomRecord(code: string) {
  pruneRooms();
  return getStore().rooms.get(code);
}

function ensureMemoryParticipant(code: string, participantId: string) {
  const room = getMemoryRoomRecord(code);
  if (!room) {
    throw new Error("ROOM_NOT_FOUND");
  }

  const participant = findParticipant(room, participantId);
  if (!participant) {
    throw new Error("PARTICIPANT_NOT_FOUND");
  }

  return { room, participant };
}

function createMemoryRoom() {
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
      expiresAt: room.expiresAt,
    };
  }

  throw new Error("ROOM_CODE_GENERATION_FAILED");
}

function joinMemoryRoom(code: string) {
  const room = getMemoryRoomRecord(code);
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

function sendMemoryEnvelope(code: string, participantId: string, envelope: SignalingEnvelope) {
  const { room, participant } = ensureMemoryParticipant(code, participantId);

  if (room.status !== "active") {
    throw new Error(room.status === "expired" ? "ROOM_EXPIRED" : "ROOM_CLOSED");
  }

  const target: EventTarget = participant.role === "sender" ? "receiver" : "sender";
  enqueueEvent(room, target, envelope);
}

function cancelMemoryRoom(code: string, participantId: string, reason?: string) {
  const { room, participant } = ensureMemoryParticipant(code, participantId);

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

function completeMemoryRoom(code: string, participantId: string) {
  const { room } = ensureMemoryParticipant(code, participantId);

  if (room.status !== "active") {
    return;
  }

  room.status = "completed";
  room.closedAt = now();
  wakeWaiters(room);
}

async function pollMemoryEvents(
  code: string,
  participantId: string,
  cursor: number,
  timeoutMs: number,
): Promise<PollEventsResponse> {
  const { room, participant } = ensureMemoryParticipant(code, participantId);

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

  const latestRoom = getMemoryRoomRecord(code);
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

async function createRedisRoom() {
  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
    const code = randomCode();
    const room = createRoomRecord(code);
    const result = await redisCommand<string | null>([
      "SET",
      roomKey(code),
      JSON.stringify(persistableRedisRoom(room)),
      "NX",
      "EX",
      ttlSecondsForRoom(room, room.createdAt),
    ]);

    if (result === "OK") {
      return {
        roomCode: code,
        participantId: room.sender.id,
        expiresAt: room.expiresAt,
      };
    }
  }

  throw new Error("ROOM_CODE_GENERATION_FAILED");
}

async function ensureRedisParticipant(code: string, participantId: string) {
  const room = await loadRedisRoom(code);
  if (!room) {
    throw new Error("ROOM_NOT_FOUND");
  }

  const participant = findParticipant(room, participantId);
  if (!participant) {
    throw new Error("PARTICIPANT_NOT_FOUND");
  }

  return { room, participant };
}

async function joinRedisRoom(code: string) {
  const room = await loadRedisRoom(code);
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

  await saveRedisRoomMeta(room);
  await appendRedisEvent(room, "sender", { type: "peer-joined" });

  return {
    roomCode: code,
    participantId: room.receiver.id,
    expiresAt: room.expiresAt,
  };
}

async function sendRedisEnvelope(code: string, participantId: string, envelope: SignalingEnvelope) {
  const { room, participant } = await ensureRedisParticipant(code, participantId);

  if (room.status !== "active") {
    throw new Error(room.status === "expired" ? "ROOM_EXPIRED" : "ROOM_CLOSED");
  }

  const target: EventTarget = participant.role === "sender" ? "receiver" : "sender";
  await appendRedisEvent(room, target, envelope);
}

async function cancelRedisRoom(code: string, participantId: string, reason?: string) {
  const { room, participant } = await ensureRedisParticipant(code, participantId);

  if (room.status !== "active") {
    return;
  }

  room.status = "cancelled";
  room.closedAt = now();
  await saveRedisRoomMeta(room);
  await appendRedisEvent(room, participant.role === "sender" ? "receiver" : "sender", {
    type: "room-cancelled",
    reason,
  });
}

async function completeRedisRoom(code: string, participantId: string) {
  const { room } = await ensureRedisParticipant(code, participantId);

  if (room.status !== "active") {
    return;
  }

  room.status = "completed";
  room.closedAt = now();
  await saveRedisRoomMeta(room);
}

async function pollRedisEvents(
  code: string,
  participantId: string,
  cursor: number,
  timeoutMs: number,
): Promise<PollEventsResponse> {
  const deadline = now() + timeoutMs;

  while (true) {
    const { room, participant } = await ensureRedisParticipant(code, participantId);
    room.events = await loadRedisEvents(code);
    const visible = getVisibleEvents(room, participant.role, cursor);

    if (visible.events.length > 0 || room.status !== "active") {
      return {
        ...visible,
        expiresAt: room.expiresAt,
      };
    }

    const remainingMs = deadline - now();
    if (remainingMs <= 0) {
      return {
        ...visible,
        expiresAt: room.expiresAt,
      };
    }

    await sleep(Math.min(REDIS_POLL_INTERVAL_MS, remainingMs));
  }
}

export async function createRoom() {
  if (isRedisConfigured()) {
    return createRedisRoom();
  }

  return createMemoryRoom();
}

export async function joinRoom(code: string) {
  if (isRedisConfigured()) {
    return joinRedisRoom(code);
  }

  return joinMemoryRoom(code);
}

export async function sendEnvelope(code: string, participantId: string, envelope: SignalingEnvelope) {
  if (isRedisConfigured()) {
    await sendRedisEnvelope(code, participantId, envelope);
    return;
  }

  sendMemoryEnvelope(code, participantId, envelope);
}

export async function cancelRoom(code: string, participantId: string, reason?: string) {
  if (isRedisConfigured()) {
    await cancelRedisRoom(code, participantId, reason);
    return;
  }

  cancelMemoryRoom(code, participantId, reason);
}

export async function completeRoom(code: string, participantId: string) {
  if (isRedisConfigured()) {
    await completeRedisRoom(code, participantId);
    return;
  }

  completeMemoryRoom(code, participantId);
}

export async function pollEvents(
  code: string,
  participantId: string,
  cursor: number,
  timeoutMs: number,
): Promise<PollEventsResponse> {
  if (isRedisConfigured()) {
    return pollRedisEvents(code, participantId, cursor, timeoutMs);
  }

  return pollMemoryEvents(code, participantId, cursor, timeoutMs);
}
