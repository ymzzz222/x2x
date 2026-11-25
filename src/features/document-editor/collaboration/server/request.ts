import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export class DocumentRequestError extends Error {
  constructor(readonly status: number, readonly code: string) { super(code); }
}

type ActorContext = { actor: string; visitor: string; database: SupabaseClient; requestId: string };

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function publicDocumentAccessEnabled() {
  return process.env.X2X_PUBLIC_DOCUMENTS === "true";
}

export function documentId(value: unknown) {
  if (typeof value !== "string" || !uuid.test(value)) throw new DocumentRequestError(400, "INVALID_IDENTIFIER");
  return value;
}

export function boundedInteger(value: unknown, minimum: number) {
  if (!Number.isInteger(value) || Number(value) < minimum || Number(value) > 2_147_483_647) {
    throw new DocumentRequestError(400, "INVALID_INTEGER");
  }
  return Number(value);
}

export function checkedEmail(value: unknown) {
  if (typeof value !== "string" || value.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
    throw new DocumentRequestError(400, "INVALID_EMAIL");
  }
  return value.trim().toLowerCase();
}

export async function readDocumentJson(request: Request) {
  const limit = 3_000_000;
  if (!request.body || Number(request.headers.get("content-length")) > limit) {
    throw new DocumentRequestError(413, "REQUEST_TOO_LARGE");
  }
  const reader = request.body.pipeThrough(new TextDecoderStream()).getReader();
  let body = "";
  try {
    for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
      body += chunk.value;
      if (body.length > limit) throw new DocumentRequestError(413, "REQUEST_TOO_LARGE");
    }
  } finally {
    await reader.cancel();
  }
  let value: unknown;
  try { value = JSON.parse(body); }
  catch { throw new DocumentRequestError(400, "INVALID_JSON"); }
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new DocumentRequestError(400, "INVALID_JSON");
  return value as Record<string, unknown>;
}

async function authenticate(request: Request, requestId: string): Promise<ActorContext> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) throw new DocumentRequestError(503, "SUPABASE_NOT_CONFIGURED");
  const token = /^Bearer ([^\s]+)$/.exec(request.headers.get("authorization") ?? "")?.[1];
  if (!token) throw new DocumentRequestError(401, "LOGIN_REQUIRED");
  const database = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await database.auth.getUser(token);
  if (error?.status && error.status >= 500) throw new DocumentRequestError(503, "AUTH_UNAVAILABLE");
  const user = data.user;
  if (!user || (user.is_anonymous ? !publicDocumentAccessEnabled() : !user.email_confirmed_at)) {
    throw new DocumentRequestError(401, "LOGIN_REQUIRED");
  }
  const visitor = user.id;
  const actor = user.is_anonymous
    ? await documentRpc<string | null>({ actor: visitor, visitor, requestId, database }, "x2x_resolve_document_actor")
    : visitor;
  if (!actor) throw new DocumentRequestError(503, "PUBLIC_DOCUMENTS_NOT_CONFIGURED");
  return { actor, visitor, requestId, database: createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "X-X2X-Audit-Actor": actor } },
  }) };
}

export async function documentRpc<T>(context: ActorContext, name: string, args: Record<string, unknown> = {}) {
  const { data, error } = await context.database.rpc(name, { ...args, p_actor: context.actor });
  if (error) {
    if (/^PT4\d{2}$/.test(error.code)) throw new DocumentRequestError(Number(error.code.slice(2)), error.message);
    console.error("Document RPC failed", { requestId: context.requestId, function: name, code: error.code });
    throw new DocumentRequestError(503, "DATABASE_UNAVAILABLE");
  }
  return data as T;
}

export async function documentResponse(request: Request, action: (actor: ActorContext) => Promise<unknown>, status = 200, operation?: string) {
  const requestId = randomUUID();
  const start = performance.now();
  const headers = { "Cache-Control": "private, no-store", Vary: "Authorization", "X-Request-Id": requestId };
  try {
    const context = await authenticate(request, requestId);
    const authenticatedAt = performance.now();
    const data = await action(context);
    const authMs = Math.round(authenticatedAt - start);
    const handlerMs = Math.round(performance.now() - authenticatedAt);
    return Response.json(data, { status, headers: { ...headers, "Server-Timing": `auth;dur=${authMs}, handler;dur=${handlerMs}` } });
  } catch (error) {
    if (!(error instanceof DocumentRequestError)) console.error("Document request failed", { requestId, type: error instanceof Error ? error.name : "unknown" });
    const failure = error instanceof DocumentRequestError ? error : new DocumentRequestError(500, "REQUEST_FAILED");
    status = failure.status;
    return Response.json({ error: failure.code }, { status, headers });
  } finally {
    if (operation) console.info("Document request", { requestId, operation, status, durationMs: Math.round(performance.now() - start) });
  }
}
