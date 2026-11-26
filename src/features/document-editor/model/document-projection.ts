import { prosemirrorToYXmlFragment, yXmlFragmentToProseMirrorRootNode } from "@tiptap/y-tiptap";
import type { Node } from "@tiptap/pm/model";
import * as Y from "yjs";
import { decodeUpdate, encodeUpdate } from "../collaboration/model/protocol";
import { documentSchema } from "./document-editor-schema";
import { readInlineMarks, type InlineRun } from "./document-format";
import { headingLevels, readHeadingNumberStart, type DocumentBlock, type DocumentMatch, type HeadingLevel } from "./document-model";
import { paragraphLayout, type ParagraphLayout } from "./document-paragraph";

type TextRun = { insert: string; attributes?: Record<string, unknown> };
export type TextSpan = { node: Y.XmlText; from: number; to: number; runs: TextRun[] };

export function headingNumbers(doc: Y.Doc) {
  return doc.getMap<{ start: number; anchor: string }>("headingNumbers");
}

export function quoteGroups(doc: Y.Doc) {
  return doc.getMap<string>("quoteGroups");
}

export function calloutGroups(doc: Y.Doc) {
  return doc.getMap<string>("calloutGroups");
}

export function documentParents(doc: Y.Doc) {
  return doc.getMap<string | null>("documentParents");
}

export function refreshOrderedListStarts(order: readonly { id: string }[], paragraphs: Y.Map<Y.XmlFragment>, quote: Y.Map<string>, callout: Y.Map<string>, following?: string) {
  let next = 1;
  let last = 1;
  let quoteGroup: string | undefined;
  let calloutGroup: string | undefined;
  for (const { id } of order) {
    const currentQuote = quote.get(id);
    const currentCallout = callout.get(id);
    if (currentQuote !== quoteGroup || currentCallout !== calloutGroup) next = last = 1;
    quoteGroup = currentQuote;
    calloutGroup = currentCallout;
    const roots = paragraphs.get(id)?.toArray() ?? [];
    for (const [index, root] of roots.entries()) {
      if (!(root instanceof Y.XmlElement) || root.nodeName !== "orderedList") {
        next = 1;
        continue;
      }
      const list = root as Y.XmlElement<{ start: number; numberMode: string }>;
      let mode = list.getAttribute("numberMode");
      if (index === 0 && id === following && mode === "continue") {
        mode = "continue-across";
        list.setAttribute("numberMode", mode);
      }
      const start = Number(list.getAttribute("start")) || 1;
      const number = mode === "continue-across" ? last : mode === "continue" ? next : start;
      if (number !== start) list.setAttribute("start", number);
      next = last = number + list.length;
    }
  }
}

function readHeadingNumber(id: string, fragment: Y.XmlFragment) {
  const doc = fragment.doc;
  if (!doc) return;
  const number = headingNumbers(doc).get(id);
  if (typeof number?.anchor !== "string") return;
  try {
    const position = Y.createAbsolutePositionFromRelativePosition(Y.decodeRelativePosition(decodeUpdate(number.anchor)), doc);
    if (position?.type === fragment.get(0)) return readHeadingNumberStart(number.start);
  } catch {
    return;
  }
}

function writeHeadingNumber(id: string, fragment: Y.XmlFragment, start?: number) {
  const doc = fragment.doc;
  if (!doc) return;
  const numbers = headingNumbers(doc);
  const heading = fragment.get(0);
  if (start === undefined || !(heading instanceof Y.XmlElement) || heading.nodeName !== "heading") {
    if (numbers.has(id)) numbers.delete(id);
  } else if (readHeadingNumber(id, fragment) !== start) {
    // Anchor to the heading element itself so edits to its first text node preserve the number.
    const position = Y.createRelativePositionFromTypeIndex(heading, 0, -1);
    numbers.set(id, { start, anchor: encodeUpdate(Y.encodeRelativePosition(position)) });
  }
}

export function withHeadingNumber(content: Node, numberStart: number | null) {
  const heading = content.firstChild;
  if (heading?.type.name !== "heading" || heading.attrs.numberStart === numberStart) return content;
  const next = heading.type.create({ ...heading.attrs, numberStart }, heading.content, heading.marks);
  return content.copy(content.content.replaceChild(0, next));
}

export function writeBlockContent(id: string, fragment: Y.XmlFragment, content: Node) {
  const start = readHeadingNumberStart(content.firstChild?.attrs.numberStart);
  prosemirrorToYXmlFragment(withHeadingNumber(content, null), fragment);
  writeHeadingNumber(id, fragment, start);
}

export function writeInitialBlock(fragment: Y.XmlFragment, block: DocumentBlock) {
  if (block.structure) {
    writeBlockContent(block.id, fragment, block.structure);
    return;
  }
  const element = new Y.XmlElement(block.kind);
  if (block.kind === "heading") {
    // The XML type supports numeric attributes, but the default declaration only lists strings.
    (element as unknown as Y.XmlElement<{ level: number }>).setAttribute("level", block.level ?? 1);
  }
  if (block.layout?.textAlign) element.setAttribute("textAlign", block.layout.textAlign);
  if (block.layout?.firstLineIndent && block.kind === "paragraph") {
    (element as Y.XmlElement<ParagraphLayout>).setAttribute("firstLineIndent", true);
  }
  if (block.text) {
    const text = new Y.XmlText();
    element.insert(0, [text]);
    text.insert(0, block.text);
  }
  fragment.delete(0, fragment.length);
  fragment.insert(0, [element]);
  if (block.numberStart !== undefined) writeHeadingNumber(block.id, fragment, block.numberStart);
}

export function readBlock(fragment: Y.XmlFragment, spans?: TextSpan[], inline?: InlineRun[]) {
  let offset = 0;
  let hasTextBlock = false;
  const parts: string[] = [];

  function append(text: string) {
    offset += text.length;
    parts.push(text);
  }

  function visit(node: Y.XmlElement | Y.XmlText | Y.XmlFragment) {
    if (node instanceof Y.XmlText) {
      const start = offset;
      const runs = node.toDelta() as TextRun[];
      for (const run of runs) {
        const from = offset;
        append(run.insert);
        if (inline && run.attributes && offset > from) {
          const marks = readInlineMarks(run.attributes);
          if (Object.keys(marks).length) inline.push({ from, to: offset, marks });
        }
      }
      spans?.push({ node, from: start, to: offset, runs });
      return;
    }
    if (node instanceof Y.XmlElement) {
      if (node.nodeName === "hardBreak") {
        append("\n");
        return;
      }
      if (node.nodeName === "paragraph" || node.nodeName === "heading" || node.nodeName === "codeBlock") {
        if (hasTextBlock) append("\n");
        hasTextBlock = true;
      }
    }
    for (const child of node.toArray()) {
      if (child instanceof Y.XmlElement || child instanceof Y.XmlText) visit(child);
    }
  }

  visit(fragment);
  return parts.join("");
}

export function replaceInlineText(spans: readonly TextSpan[], match: DocumentMatch, replacement: string) {
  const affected = spans.filter((span) => span.from < match.to && span.to > match.from);
  const first = affected[0];
  if (!first) return;

  const start = match.from - first.from;
  let runEnd = 0;
  const style = first.runs.find((run) => (runEnd += run.insert.length) > start)?.attributes;
  for (const span of affected) {
    const from = Math.max(match.from, span.from);
    const to = Math.min(match.to, span.to);
    span.node.delete(from - span.from, to - from);
  }
  if (replacement) first.node.insert(start, replacement, style ?? {});
}

export function projectBlock(id: string, fragment: Y.XmlFragment): DocumentBlock {
  const primary = fragment.get(0);
  const inline: InlineRun[] = [];
  const text = readBlock(fragment, undefined, inline);
  const layout = primary instanceof Y.XmlElement && (primary.nodeName === "paragraph" || primary.nodeName === "heading")
    ? paragraphLayout(primary.getAttributes()) : null;
  const structure = layout === null || fragment.length > 1
    ? yXmlFragmentToProseMirrorRootNode(fragment, documentSchema()) : undefined;
  const quoteGroup = fragment.doc && quoteGroups(fragment.doc).get(id);
  const calloutGroup = fragment.doc && calloutGroups(fragment.doc).get(id);
  const parentId = fragment.doc ? documentParents(fragment.doc).get(id) : undefined;
  const content = { id, text, ...(typeof quoteGroup === "string" && quoteGroup ? { quoteGroup } : {}),
    ...(typeof calloutGroup === "string" && calloutGroup ? { calloutGroup } : {}),
    ...(parentId === null || typeof parentId === "string" ? { parentId } : {}),
    ...(structure ? { structure } : {}), ...(inline.length ? { inline } : {}), ...(layout === undefined ? {} : { layout }) };
  if (primary instanceof Y.XmlElement && primary.nodeName === "heading") {
    const level = Number(primary.getAttribute("level")) as HeadingLevel;
    const numberStart = readHeadingNumber(id, fragment);
    return { ...content, kind: "heading", level: headingLevels.includes(level) ? level : 1,
      ...(numberStart === undefined ? {} : { numberStart }) };
  }
  return { ...content, kind: "paragraph" };
}

export function projectCompatibleBlocks(updates: readonly Uint8Array[]) {
  const source = new Y.Doc();
  const schema = documentSchema();
  const blocks: DocumentBlock[] = [];
  const seen = new Set<string>();

  function canRender(node: unknown): boolean {
    if (node instanceof Y.XmlText) {
      return node.toDelta().every((run: TextRun) => typeof run.insert === "string");
    }
    return node instanceof Y.XmlElement && Object.hasOwn(schema.nodes, node.nodeName) && node.toArray().every(canRender);
  }

  try {
    Y.applyUpdate(source, Y.mergeUpdates([...updates]));
    const fragments = source.getMap<Y.XmlFragment>("paragraphs");
    for (const block of source.getArray<{ id?: unknown } | null>("order").toArray()) {
      const id = block?.id;
      if (typeof id !== "string" || !id || seen.has(id)) continue;
      seen.add(id);
      const fragment = fragments.get(id);
      if (fragment instanceof Y.XmlFragment && fragment.length > 0 && fragment.toArray().every(canRender)) {
        try {
          const projected = projectBlock(id, fragment);
          projected.structure?.check();
          blocks.push(projected);
          continue;
        } catch {
          // A recognized node can still have a structure this version cannot render.
        }
      }
      blocks.push({ id, text: "此内容需要新版编辑器查看", kind: "paragraph" });
    }
    return blocks;
  } finally {
    source.destroy();
  }
}
