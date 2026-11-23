import { isAllowedUri } from "@tiptap/extension-link";
import { getSelectionRange, type DocumentBlock, type DocumentSelection } from "./document-model";

export const toggles = [
  { name: "bold", label: "粗体", key: "b" },
  { name: "italic", label: "斜体", key: "i" },
  { name: "underline", label: "下划线", key: "u" },
  { name: "strike", label: "删除线", key: "x", shift: true },
  { name: "code", label: "行内代码", key: "e" },
] as const;

export type ToggleMark = (typeof toggles)[number]["name"];
export type FormatMark = ToggleMark | "link" | "textColor" | "backgroundColor";
export type MarkValue = true | string;
export type InlineMarks = Partial<Record<FormatMark, MarkValue>>;
export type InlineRun = { from: number; to: number; marks: InlineMarks };

export function inlineColor(value: unknown) {
  if (typeof value !== "string") return;
  return /^(?:#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})|[a-z]{3,20}|(?:rgba?|hsla?)\([\d.,%/\s+-]+\))$/i.test(value)
    ? value
    : undefined;
}

export function readInlineMarks(attributes: Record<string, unknown>): InlineMarks {
  const marks: InlineMarks = {};
  for (const [key, attrs] of Object.entries(attributes)) {
    const name = key.split("--")[0] as FormatMark;
    if (!attrs || typeof attrs !== "object") continue;
    if (name === "link" && "href" in attrs && typeof attrs.href === "string" && isAllowedUri(attrs.href)) {
      marks.link = attrs.href;
    } else if (name === "textColor" || name === "backgroundColor") {
      const color = inlineColor("color" in attrs ? attrs.color : undefined);
      if (color) marks[name] = color;
    } else if (toggles.some((toggle) => toggle.name === name)) {
      marks[name] = true;
    }
  }
  return marks;
}

export function commonMarks(blocks: readonly DocumentBlock[], selection: DocumentSelection): InlineMarks {
  const bounds = getSelectionRange(blocks, selection);
  if (!bounds) return {};
  const { startIndex, endIndex, startOffset, endOffset } = bounds;
  let common: InlineMarks | undefined;

  for (let index = startIndex; index <= endIndex; index++) {
    const block = blocks[index];
    const from = index === startIndex ? startOffset : 0;
    const to = index === endIndex ? endOffset : block.text.length;
    if (from >= to) continue;
    let edge = from;

    for (const run of block.inline ?? []) {
      if (run.to <= from) continue;
      if (run.from > edge) break;
      if (!common) common = { ...run.marks };
      else for (const key of Object.keys(common) as FormatMark[]) {
        if (common[key] !== run.marks[key]) delete common[key];
      }
      if (!Object.keys(common).length) return {};
      edge = Math.min(run.to, to);
      if (edge === to) break;
    }
    if (edge !== to) return {};
  }
  return common ?? {};
}

export function normalizeLink(input: string) {
  const text = input.trim();
  if (!text || /\s/.test(text)) return;
  const href = /^(?:[\w-]+\.)+[a-z]{2,}(?=[:/?#]|$)/i.test(text) ? "https://" + text : text;
  if (!/^https?:\/\//i.test(href)) return;
  try {
    const url = new URL(href);
    if (url.protocol === "http:" || url.protocol === "https:") return href;
  } catch {
    return;
  }
}
