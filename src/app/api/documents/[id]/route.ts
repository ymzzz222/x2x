import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import * as Y from "yjs";
import { documentPlainText } from "@/features/document-editor/model/document-clipboard";
import { DocumentSession } from "@/features/document-editor/model/document-session";
import { documentSchema } from "@/features/document-editor/model/document-editor-schema";
import { getSelectedText } from "@/features/document-editor/model/document-model";
import { getDocumentOutline } from "@/features/document-editor/model/document-outline";
import { locateComment, type CommentAnchor } from "@/features/document-editor/collaboration/model/comment-anchor";
import { decodeUpdate, encodeUpdate, maximumUpdateBytes, sharedSchemaVersion, type DocumentCursor, type DocumentRead } from "@/features/document-editor/collaboration/model/protocol";
import { permissions, type ProtectionPolicy } from "@/features/document-editor/collaboration/model/protection";
import { boundedInteger, checkedEmail, documentId, documentResponse, documentRpc, DocumentRequestError, readDocumentJson } from "@/features/document-editor/collaboration/server/request";

type Route = { params: Promise<{ id: string }> };
type Context = Parameters<typeof documentRpc>[0];

function openDocument(context: Context, id: string, generation: number, cursor: number) {
  return documentRpc<DocumentRead>(context, "x2x_open_document", { p_document: id, p_generation: generation, p_after: cursor });
}

function readPosition(value: string | null, fallback: -1 | 0) {
  if (value === null) return fallback;
  if (!/^(?:-1|0|[1-9]\d{0,9})$/.test(value)) throw new DocumentRequestError(400, "INVALID_INTEGER");
  return boundedInteger(Number(value), fallback);
}

function presenceProof(id: string, accessVersion: number, actor: string, session: string) {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) throw new DocumentRequestError(503, "SUPABASE_NOT_CONFIGURED");
  const binding = actor + "." + session;
  const signature = createHmac("sha256", secret)
    .update("x2x-presence:" + id + ":" + accessVersion + ":" + binding).digest("base64url");
  return binding + "." + signature;
}

function verifiedPresenceSessions(id: string, accessVersion: number, proofs: unknown) {
  if (!Array.isArray(proofs) || proofs.length > 256) throw new DocumentRequestError(400, "INVALID_PRESENCE");
  return [...new Set(proofs)].flatMap((proof) => {
    if (typeof proof !== "string" || !/^[0-9a-f-]{36}\.[0-9a-f-]{36}\.[A-Za-z0-9_-]{43}$/.test(proof)) return [];
    const [actor, session] = proof.split(".");
    const expected = presenceProof(id, accessVersion, actor, session);
    return timingSafeEqual(Buffer.from(proof), Buffer.from(expected)) ? [{ actor, session }] : [];
  });
}

export function GET(request: Request, route: Route) {
  const query = new URL(request.url).searchParams;
  return documentResponse(request, async (context) => {
    const id = documentId((await route.params).id);
    if (query.get("view") === "meeting") {
      return documentRpc(context, "x2x_meeting", {
        p_document: id, p_action: "read", p_instance: documentId(query.get("instance")), p_position: null, p_body: null,
      });
    }
    if (query.get("view") === "suggestions") {
      return documentRpc(context, "x2x_suggestions", { p_document: id, p_selection: null });
    }
    if (query.get("view") === "discussion") {
      const args = { p_document: id };
      const [comments, info] = await Promise.all([
        documentRpc<Record<string, unknown>>(context, "x2x_discussion", args),
        documentRpc<Record<string, unknown>>(context, "x2x_document_information", args),
      ]);
      return { ...comments, ...info };
    }
    if (query.get("view") === "history") {
      const version = query.get("version");
      const result = await documentRpc<Record<string, unknown>>(context, "x2x_history", { p_document: id, p_version: version ? documentId(version) : null });
      return version ? { ...result, policy: await documentRpc<ProtectionPolicy>(context, "x2x_read_policy", { p_document: id }) } : result;
    }
    if (query.get("view") === "sharing") {
      const args = { p_document: id };
      const [settings, workspace] = await Promise.all([
        documentRpc<Record<string, unknown>>(context, "x2x_share_settings", args),
        documentRpc(context, "x2x_workspace_rights", { ...args, p_group: null, p_role: null, p_change: false }),
      ]);
      return { ...settings, workspace };
    }
    const presenceSession = query.get("presenceSession");
    const session = presenceSession === null ? undefined : documentId(presenceSession);
    const [document, policy] = await Promise.all([
      openDocument(context, id, readPosition(query.get("generation"), 0), readPosition(query.get("after"), -1)),
      documentRpc<ProtectionPolicy>(context, "x2x_read_policy", { p_document: id }),
    ]);
    return { ...document, policy, presenceProof: document.realtimeReady && session
      ? presenceProof(id, document.accessVersion, context.visitor, session) : undefined };
  }, 200, !query.has("view") && (!query.has("generation") || query.get("generation") === "0") ? "document.open" : undefined);
}

function validatedUpdate(value: unknown) {
  if (typeof value !== "string" || value.length > 4 * Math.ceil(maximumUpdateBytes / 3)) {
    throw new DocumentRequestError(413, "UPDATE_TOO_LARGE");
  }
  try {
    const bytes = decodeUpdate(value);
    if (bytes.length < 2 || bytes.length > maximumUpdateBytes) throw new Error("Bad update size");
    Y.decodeUpdate(bytes);
    return encodeUpdate(bytes);
  } catch {
    throw new DocumentRequestError(400, "INVALID_UPDATE");
  }
}

function password(value: unknown) {
  if (value == null || value === "") return null;
  if (typeof value !== "string" || Buffer.byteLength(value) > 72) throw new DocumentRequestError(400, "INVALID_LINK_PASSWORD");
  return value;
}

async function committedSnapshot(context: Context, id: string, minimumUpdates: number, needsEdit = true) {
  let page = await openDocument(context, id, 0, -1);
  if (needsEdit && page.role === "view") throw new DocumentRequestError(403, "WRITE_DENIED");
  if (page.schema !== sharedSchemaVersion) throw new DocumentRequestError(409, "DOCUMENT_SCHEMA_UNSUPPORTED");
  const generation = page.generation;
  const head = page.head;
  if (!page.snapshot) throw new DocumentRequestError(409, "DOCUMENT_BUSY");
  if (head - page.cursor < minimumUpdates) return null;
  const doc = new Y.Doc();
  try {
    Y.applyUpdate(doc, decodeUpdate(page.snapshot));
    while (true) {
      for (const update of page.updates) {
        if (update.seq <= head) Y.applyUpdate(doc, decodeUpdate(update.data));
      }
      const cursor = page.updates.at(-1)?.seq ?? page.cursor;
      if (cursor >= head) break;
      page = await openDocument(context, id, generation, cursor);
      if (page.schema !== sharedSchemaVersion) throw new DocumentRequestError(409, "DOCUMENT_SCHEMA_UNSUPPORTED");
      if (page.generation !== generation || page.snapshot || !page.updates.length) {
        throw new DocumentRequestError(409, "DOCUMENT_BUSY");
      }
    }
    const bytes = Y.encodeStateAsUpdate(doc);
    if (bytes.length > 2_200_000) throw new DocumentRequestError(413, "SNAPSHOT_TOO_LARGE");
    return { p_document: id, p_generation: generation, p_head: head, p_snapshot: encodeUpdate(bytes) };
  } finally {
    doc.destroy();
  }
}

async function discussion(context: Context, id: string, body: Record<string, unknown>) {
  const kind = body.kind;
  if (kind !== "comment" && kind !== "resolve" && kind !== "reaction" && kind !== "like" && kind !== "follow") {
    throw new DocumentRequestError(400, "UNKNOWN_ACTION");
  }
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (kind === "comment" && (!text || text.length > 4000)) throw new DocumentRequestError(400, "INVALID_COMMENT");
  const anchor = body.anchor ?? null;
  if (anchor && (typeof anchor !== "object" || Array.isArray(anchor) || JSON.stringify(anchor).length > 3000)) {
    throw new DocumentRequestError(400, "INVALID_COMMENT_ANCHOR");
  }
  if (kind !== "comment" && typeof body.enabled !== "boolean") throw new DocumentRequestError(400, "INVALID_ACTION");
  if (kind === "reaction" && !["👍", "❤️", "🎉", "👀"].includes(String(body.emoji))) throw new DocumentRequestError(400, "INVALID_REACTION");
  const mentions = [...new Set((text.match(/@[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}/gi) ?? []).map((match) => match.slice(1).toLowerCase()))].slice(0, 20);
  const comment = await documentRpc(context, "x2x_change_discussion", {
    p_document: id, p_action: kind, p_body: text || null, p_parent: body.comment ? documentId(body.comment) : null,
    p_anchor: anchor, p_private: body.private === true, p_recipient: body.recipient ? checkedEmail(body.recipient) : null,
    p_reaction: kind === "reaction" ? body.emoji : null, p_enabled: body.enabled ?? false, p_mentions: mentions,
  });
  return { comment };
}

async function suggestion(context: Context, id: string, body: Record<string, unknown>) {
  const kind = body.kind;
  if (kind !== "create" && kind !== "revise" && kind !== "withdraw" && kind !== "accept" && kind !== "reject" && kind !== "reply") {
    throw new DocumentRequestError(400, "UNKNOWN_ACTION");
  }
  const selected = kind === "create" ? null : documentId(body.suggestion);
  const before = typeof body.before === "string" ? body.before : "";
  const text = typeof body.text === "string" ? body.text : "";
  const anchor = body.anchor ?? null;
  if (kind === "create" && (!before || before.length > 8000 || !anchor || typeof anchor !== "object" || JSON.stringify(anchor).length > 3000)) {
    throw new DocumentRequestError(400, "INVALID_SUGGESTION");
  }
  if (text.length > 8000 || (kind === "reply" && (!text.trim() || text.length > 4000))) {
    throw new DocumentRequestError(400, "INVALID_SUGGESTION_TEXT");
  }

  const args = {
    p_document: id, p_kind: kind, p_id: selected, p_anchor: anchor, p_before: before || null, p_text: text,
    p_generation: kind === "create" ? boundedInteger(body.generation, 1) : null, p_head: null as number | null,
    p_update: null as string | null, p_revision: null as string | null,
  };
  if (kind === "accept") {
    const [items, snapshot] = await Promise.all([
      documentRpc<{ anchor: CommentAnchor; before: string; after: string; generation: number; state: string }[]>(
        context, "x2x_suggestions", { p_document: id, p_selection: selected }),
      committedSnapshot(context, id, 0),
    ]);
    const item = items[0];
    if (!item || !snapshot || item.generation !== snapshot.p_generation || item.state !== "pending") {
      throw new DocumentRequestError(409, "SUGGESTION_OUTDATED");
    }
    const session = DocumentSession.fromUpdates([decodeUpdate(snapshot.p_snapshot)]);
    try {
      const range = locateComment(session, item.anchor);
      if (!range || getSelectedText(session.getBlocks(), range) !== item.before || item.before === item.after) {
        throw new DocumentRequestError(409, "SUGGESTION_OUTDATED");
      }
      const schema = documentSchema();
      const lines = item.after.split(/\\r?\\n/);
      const nodes = lines.map((line) => schema.node("paragraph", null, line ? schema.text(line) : undefined));
      const updates: Uint8Array[] = [];
      const unsubscribe = session.onLocalUpdate((update) => updates.push(update));
      session.replaceRange(range, item.after ? { nodes, inline: nodes.length === 1 } : "delete", { editing: false });
      unsubscribe();
      if (!updates.length) throw new DocumentRequestError(409, "SUGGESTION_OUTDATED");
      args.p_update = validatedUpdate(encodeUpdate(Y.mergeUpdates(updates)));
      args.p_head = snapshot.p_head;
      args.p_revision = item.after;
    } finally { session.destroy(); }
  }
  return { id: await documentRpc(context, "x2x_change_suggestion", args) };
}

async function protection(context: Context, id: string, body: Record<string, unknown>) {
  const mode = body.kind;
  if (mode !== "settings" && mode !== "approve" && mode !== "decline") throw new DocumentRequestError(400, "UNKNOWN_ACTION");
  const rules = body.rules as Record<string, Record<string, boolean>> | undefined;
  if (mode === "settings" && (!["normal", "internal", "restricted"].includes(String(body.classification)) ||
    typeof body.watermark !== "boolean" || typeof body.externalShare !== "boolean" ||
    !["view", "edit"].every((role) => permissions.every((permission) => typeof rules?.[role]?.[permission] === "boolean")))) {
    throw new DocumentRequestError(400, "INVALID_POLICY");
  }
  const normalized = mode === "settings" ? Object.fromEntries(["view", "edit"].map((role) => [
    role, Object.fromEntries(permissions.map((permission) => [permission, rules![role][permission]])),
  ])) : {};
  await documentRpc(context, "x2x_change_policy", {
    p_document: id, p_action: mode, p_classification: body.classification ?? null,
    p_watermark: body.watermark ?? null, p_external: body.externalShare ?? null, p_rules: normalized,
  });
  return documentRpc(context, "x2x_read_policy", { p_document: id });
}

async function exportDocument(context: Context, id: string, body: Record<string, unknown>) {
  const action = body.action === "duplicate" ? "duplicate" : "download";
  const rights = () => documentRpc<ProtectionPolicy>(context, "x2x_read_policy", { p_document: id });
  if (!(await rights()).allowed[action]) throw new DocumentRequestError(403, "DOCUMENT_ACTION_DENIED");
  const snapshot = await committedSnapshot(context, id, 0, false);
  if (!snapshot || !(await rights()).allowed[action]) throw new DocumentRequestError(403, "DOCUMENT_ACTION_DENIED");
  if (action === "duplicate") {
    const meta = await openDocument(context, id, 0, -1);
    const title = (meta.title + " 的副本").slice(0, 120);
    return { id: await documentRpc(context, "x2x_create_document", { p_title: title, p_snapshot: snapshot.p_snapshot, p_workspace: null }) };
  }
  const session = DocumentSession.fromUpdates([decodeUpdate(snapshot.p_snapshot)]);
  try {
    const blocks = session.getBlocks();
    return { text: documentPlainText(blocks, getDocumentOutline(blocks).sections) };
  }
  finally { session.destroy(); }
}

async function mention(context: Context, id: string, body: Record<string, unknown>) {
  const email = checkedEmail(body.email);
  const blockId = typeof body.block === "string" ? body.block : "";
  if (!/^(block|inserted)-[0-9a-f-]+$/.test(blockId) || blockId.length > 60) throw new DocumentRequestError(400, "INVALID_POSITION");
  const snapshot = await committedSnapshot(context, id, 0);
  if (!snapshot) throw new DocumentRequestError(409, "DOCUMENT_BUSY");
  const session = DocumentSession.fromUpdates([decodeUpdate(snapshot.p_snapshot)]);
  try {
    if (!session.getBlocks().find((candidate) => candidate.id === blockId)?.text.includes("@" + email)) {
      throw new DocumentRequestError(409, "MENTION_NOT_SAVED");
    }
  } finally { session.destroy(); }
  await documentRpc(context, "x2x_mention", {
    p_document: id, p_recipient: email, p_block: blockId, p_generation: snapshot.p_generation, p_head: snapshot.p_head,
  });
  return { sent: true };
}

function readCursor(value: unknown): DocumentCursor | null {
  if (value === null) return null;
  if (!value || typeof value !== "object") throw new DocumentRequestError(400, "INVALID_CURSOR");
  const { blockId, encoded, generation } = value as Partial<DocumentCursor>;
  if (typeof blockId !== "string" || !blockId || blockId.length > 150 ||
      typeof encoded !== "string" || encoded.length > 160 || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) {
    throw new DocumentRequestError(400, "INVALID_CURSOR");
  }
  return { blockId, encoded, generation: boundedInteger(generation, 1) };
}

export function POST(request: Request, route: Route) {
  return documentResponse(request, async (context) => {
    const id = documentId((await route.params).id);
    const body = await readDocumentJson(request);
    const args = { p_document: id };
    switch (body.action) {
      case "rename": {
        const title = typeof body.title === "string" ? body.title.trim() : "";
        if (!title || title.length > 120) throw new DocumentRequestError(400, "INVALID_TITLE");
        return documentRpc(context, "x2x_rename_document", { ...args, p_title: title });
      }
      case "save":
        return documentRpc(context, "x2x_append_update", {
          ...args, p_generation: boundedInteger(body.generation, 1), p_schema: boundedInteger(body.schema, 1),
          p_batch: documentId(body.batch), p_update: validatedUpdate(body.data),
        });
      case "presence":
        return documentRpc({ ...context, actor: context.visitor }, "x2x_heartbeat",
          body.cursorSession === undefined ? args : {
            ...args, p_cursor_session: documentId(body.cursorSession), p_cursor: readCursor(body.cursor),
          });
      case "presence-roster": {
        const accessVersion = boundedInteger(body.accessVersion, 1);
        return documentRpc({ ...context, actor: context.visitor }, "x2x_document_presence_roster", {
          ...args, p_access_version: accessVersion,
          p_sessions: verifiedPresenceSessions(id, accessVersion, body.proofs),
        });
      }
      case "cursor":
        return documentRpc({ ...context, actor: context.visitor }, "x2x_publish_document_cursor", {
          ...args, p_access_version: boundedInteger(body.accessVersion, 1),
          p_session: documentId(body.session), p_cursor: readCursor(body.cursor),
        });
      case "member":
        if (![null, "view", "edit", "manage"].includes(body.role as string | null)) throw new DocumentRequestError(400, "INVALID_ROLE");
        await documentRpc(context, "x2x_set_member", { ...args, p_email: checkedEmail(body.email), p_role: body.role });
        return { changed: true };
      case "link": {
        if (![null, "view", "edit"].includes(body.role as string | null)) throw new DocumentRequestError(400, "INVALID_ROLE");
        const token = body.role ? randomBytes(32).toString("base64url") : null;
        await documentRpc(context, "x2x_set_share_link", { ...args, p_token: token, p_role: body.role, p_password: password(body.password) });
        return { token };
      }
      case "redeem":
        if (typeof body.token !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(body.token)) throw new DocumentRequestError(400, "INVALID_LINK");
        await documentRpc(context, "x2x_redeem_link", { ...args, p_token: body.token, p_password: password(body.password) });
        return { changed: true };
      case "mention":
        return mention(context, id, body);
      case "meeting": {
        if (!["start", "move", "stop", "annotate"].includes(String(body.kind))) throw new DocumentRequestError(400, "UNKNOWN_ACTION");
        const position = body.position as { blockId?: unknown; withinRow?: unknown } | undefined;
        if (body.kind !== "stop" && (!position || typeof position.blockId !== "string" ||
          !/^(block|inserted)-[0-9a-f-]+$/.test(position.blockId) || position.blockId.length > 60 ||
          !Number.isFinite(position.withinRow) || Number(position.withinRow) < 0 || Number(position.withinRow) > 200000)) {
          throw new DocumentRequestError(400, "INVALID_POSITION");
        }
        const text = typeof body.text === "string" ? body.text.trim() : "";
        if (body.kind === "annotate" && (!text || text.length > 500)) throw new DocumentRequestError(400, "INVALID_ANNOTATION");
        return documentRpc(context, "x2x_meeting", {
          ...args, p_action: body.kind, p_instance: documentId(body.instance),
          p_position: position ? { blockId: position.blockId, withinRow: position.withinRow } : null, p_body: text || null,
        });
      }
      case "protection":
        return protection(context, id, body);
      case "download":
      case "duplicate":
        return exportDocument(context, id, body);
      case "suggestion":
        return suggestion(context, id, body);
      case "discussion":
        return discussion(context, id, body);
      case "request-access":
        await documentRpc(context, "x2x_request_access", args);
        return { submitted: true };
      case "workspace-rights":
        if (![null, "view", "edit"].includes(body.role as string | null)) throw new DocumentRequestError(400, "INVALID_ROLE");
        return documentRpc(context, "x2x_workspace_rights", {
          ...args, p_group: body.group ? documentId(body.group) : null, p_role: body.role, p_change: true,
        });
      case "transfer":
        await documentRpc(context, "x2x_transfer_document", { ...args, p_email: checkedEmail(body.email) });
        return { changed: true };
      case "compact": {
        const snapshot = await committedSnapshot(context, id, 64);
        return { changed: Boolean(snapshot && await documentRpc<boolean>(context, "x2x_compact_document", snapshot)) };
      }
      case "version":
      case "restore": {
        const restore = body.action === "restore" ? documentId(body.version) : null;
        const name = restore ? "还原前自动备份" : typeof body.name === "string" ? body.name.trim() : "";
        if (!name || name.length > 120) throw new DocumentRequestError(400, "INVALID_VERSION_NAME");
        const snapshot = await committedSnapshot(context, id, 0);
        if (!snapshot) throw new DocumentRequestError(409, "DOCUMENT_BUSY");
        const version = await documentRpc(context, "x2x_store_version", { ...snapshot, p_name: name, p_restore: restore });
        return { version };
      }
      default:
        throw new DocumentRequestError(400, "UNKNOWN_ACTION");
    }
  });
}
