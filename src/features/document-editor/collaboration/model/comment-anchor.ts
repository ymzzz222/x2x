import { absolutePositionToRelativePosition, initProseMirrorDoc, relativePositionToAbsolutePosition } from "@tiptap/y-tiptap";
import * as Y from "yjs";
import { documentSchema, offsetAt, positionAtOffset } from "../../model/document-editor-schema";
import type { DocumentPosition, DocumentSelection } from "../../model/document-model";
import type { DocumentSession } from "../../model/document-session";
import { decodeUpdate, encodeUpdate } from "./protocol";

type Endpoint = { blockId: string; encoded: string };
export type CommentAnchor = { start: Endpoint; end?: Endpoint };

export function encodeDocumentPosition(session: DocumentSession, endpoint: DocumentPosition): Endpoint | null {
  const fragment = session.fragmentFor(endpoint.blockId);
  if (!fragment) return null;
  const { doc, mapping } = initProseMirrorDoc(fragment, documentSchema());
  const offset = positionAtOffset(doc, endpoint.offset);
  const relative = absolutePositionToRelativePosition(offset, fragment, mapping);
  return { blockId: endpoint.blockId, encoded: encodeUpdate(Y.encodeRelativePosition(relative)) };
}

export function makeCommentAnchor(session: DocumentSession, range: DocumentSelection | null, wholeBlock: boolean): CommentAnchor | null {
  if (!range) return null;
  if (wholeBlock) return { start: { blockId: range.focus.blockId, encoded: "" } };
  const start = encodeDocumentPosition(session, range.anchor);
  const end = encodeDocumentPosition(session, range.focus);
  return start && end ? { start, end } : null;
}

export function resolveDocumentPosition(session: DocumentSession, endpoint: Endpoint): DocumentPosition | null {
  const fragment = session.fragmentFor(endpoint.blockId);
  if (!fragment?.doc) return null;
  if (!endpoint.encoded) return { blockId: endpoint.blockId, offset: 0 };
  const { doc, mapping } = initProseMirrorDoc(fragment, documentSchema());
  const relative = Y.decodeRelativePosition(decodeUpdate(endpoint.encoded));
  const position = relativePositionToAbsolutePosition(fragment.doc, fragment, relative, mapping);
  return position === null ? null : { blockId: endpoint.blockId, offset: offsetAt(doc, position) };
}

export function locateComment(session: DocumentSession, anchor: CommentAnchor) {
  try {
    const start = resolveDocumentPosition(session, anchor.start);
    if (!start) return null;
    const end = anchor.end ? resolveDocumentPosition(session, anchor.end) : start;
    if (!end || (anchor.end && start.blockId === end.blockId && start.offset === end.offset)) return null;
    return { anchor: start, focus: end };
  } catch {
    return null;
  }
}

export function insertDocumentReference(session: DocumentSession, selection: DocumentSelection | null, text: string, url?: string) {
  if (!selection) return;
  const schema = documentSchema();
  const marks = url ? [schema.marks.link.create({ href: url })] : [];
  return session.replaceRange(selection, { nodes: [schema.node("paragraph", null, schema.text(text, marks))], inline: true }, { editing: true });
}
