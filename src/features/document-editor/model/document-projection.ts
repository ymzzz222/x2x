import { yXmlFragmentToProseMirrorRootNode } from "@tiptap/y-tiptap";
import * as Y from "yjs";
import { documentSchema } from "./document-editor-schema";
import { readInlineMarks, type InlineRun } from "./document-format";
import { headingLevels, type DocumentBlock, type DocumentMatch, type HeadingLevel } from "./document-model";
import { paragraphLayout } from "./document-paragraph";

type TextRun = { insert: string; attributes?: Record<string, unknown> };
export type TextSpan = { node: Y.XmlText; from: number; to: number; runs: TextRun[] };

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
  const content = { id, text, ...(structure ? { structure } : {}), ...(inline.length ? { inline } : {}), ...(layout === undefined ? {} : { layout }) };
  if (primary instanceof Y.XmlElement && primary.nodeName === "heading") {
    const level = Number(primary.getAttribute("level")) as HeadingLevel;
    return { ...content, kind: "heading", level: headingLevels.includes(level) ? level : 1 };
  }
  return { ...content, kind: "paragraph" };
}
