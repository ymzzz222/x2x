import { createHash } from "node:crypto";
import { DocumentSession } from "@/features/document-editor/model/document-session";
import { createDocument } from "@/features/document-editor/model/document-model";
import { encodeUpdate, type DocumentSummary } from "@/features/document-editor/collaboration/model/protocol";
import { documentId, documentResponse, documentRpc, DocumentRequestError, readDocumentJson } from "@/features/document-editor/collaboration/server/request";

function readCursor(cursor: string | null) {
  if (cursor === null) return { before: null, id: null };
  try {
    if (!/^[A-Za-z0-9_-]{1,128}$/.test(cursor)) throw new Error();
    const decoded: unknown = JSON.parse(Buffer.from(cursor, "base64url").toString());
    if (!Array.isArray(decoded) || decoded.length !== 2) throw new Error();
    const [before, id] = decoded;
    if (typeof before !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/.test(before) ||
        before.startsWith("0000-") || new Date(before.slice(0, 23) + "Z").toISOString().slice(0, 23) !== before.slice(0, 23)) {
      throw new Error();
    }
    return { before, id: documentId(id) };
  } catch {
    throw new DocumentRequestError(400, "INVALID_CURSOR");
  }
}

export function GET(request: Request) {
  return documentResponse(request, async (context) => {
    const query = new URL(request.url).searchParams;
    if (!query.has("limit") && !query.has("cursor")) return documentRpc<DocumentSummary[]>(context, "x2x_list_documents");

    const size = query.get("limit") ?? "30";
    if (!/^(?:[1-9]\d?|100)$/.test(size) || query.getAll("limit").length > 1) throw new DocumentRequestError(400, "INVALID_PAGE_SIZE");
    if (query.getAll("cursor").length > 1) throw new DocumentRequestError(400, "INVALID_CURSOR");
    const cursor = readCursor(query.get("cursor"));
    const limit = Number(size);
    const rows = await documentRpc<DocumentSummary[]>(context, "x2x_list_document_page", {
      p_limit: limit, p_before: cursor.before, p_before_id: cursor.id,
    });
    const items = rows.slice(0, limit);
    const last = items.at(-1);
    const nextCursor = rows.length > limit && last
      ? Buffer.from(JSON.stringify([last.updatedAt, last.id])).toString("base64url")
      : null;
    return { items, nextCursor };
  }, 200, "document.list");
}

export function POST(request: Request) {
  return documentResponse(request, async (context) => {
    const body = await readDocumentJson(request);
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title || title.length > 120) throw new DocumentRequestError(400, "INVALID_TITLE");
    const size = body.sample ?? "empty";
    if (size !== "empty" && size !== 100000 && size !== 300000 && size !== 500000) {
      throw new DocumentRequestError(400, "INVALID_SAMPLE");
    }
    const workspace = body.workspace == null || body.workspace === "" ? null : documentId(body.workspace);
    const rawKey = request.headers.get("Idempotency-Key");
    const key = rawKey === null ? null : documentId(rawKey);
    const session = new DocumentSession(size === "empty" ? [{ id: "block-1", text: "", kind: "paragraph" }] : createDocument(size));
    try {
      const args = { p_title: title, p_snapshot: encodeUpdate(session.encodeSnapshot()), p_workspace: workspace };
      const id = key === null
        ? await documentRpc<string>(context, "x2x_create_document", args)
        : await documentRpc<string>(context, "x2x_create_document_once", {
          ...args, p_key: key, p_fingerprint: createHash("sha256").update(JSON.stringify([title, size, workspace])).digest("hex"),
        });
      return { id };
    } finally {
      session.destroy();
    }
  }, 201, "document.create");
}
