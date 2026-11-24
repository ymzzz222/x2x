import type { Node as PMNode } from "@tiptap/pm/model";
import type { InlineRun } from "./document-format";
import type { ParagraphLayout } from "./document-paragraph";

export const sampleSizes = [100000, 300000, 500000] as const;
export type SampleSize = (typeof sampleSizes)[number];

export const headingLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
export type HeadingLevel = (typeof headingLevels)[number];

export function readHeadingNumberStart(value: unknown) {
  if (typeof value !== "number" && (typeof value !== "string" || !/^\d+$/.test(value))) return;
  const start = Number(value);
  return Number.isSafeInteger(start) && start >= 0 && start <= 9_999_999 ? start : undefined;
}

export function headingPresentation(level: HeadingLevel) {
  const depth = level + 1;
  const attributes = { "data-heading-level": level };
  if (depth <= 6) return { tag: `h${depth}` as "h2" | "h3" | "h4" | "h5" | "h6", attributes };
  return { tag: "div" as const, attributes: { ...attributes, role: "heading", "aria-level": depth } };
}

export type DocumentBlock = {
  id: string;
  text: string;
  kind: "paragraph" | "heading";
  level?: HeadingLevel;
  numberStart?: number;
  quoteGroup?: string;
  parentId?: string | null;
  inline?: readonly InlineRun[];
  layout?: ParagraphLayout | null;
  structure?: PMNode;
};

type TextCounts = { words: number; characters: number };
const blockTextCounts = new WeakMap<DocumentBlock, TextCounts>();
let wordSegmenter: Intl.Segmenter | undefined;

export function documentTextCounts(blocks: readonly DocumentBlock[]): TextCounts {
  const segmenter = wordSegmenter ??= new Intl.Segmenter("zh-CN", { granularity: "word" });
  let words = 0;
  let characters = 0;
  for (const block of blocks) {
    let counts = blockTextCounts.get(block);
    if (!counts) {
      let blockWords = 0;
      for (const { segment, isWordLike } of segmenter.segment(block.text)) {
        if (isWordLike || /[\p{Extended_Pictographic}\p{Regional_Indicator}\u20E3]/u.test(segment)) blockWords++;
      }
      counts = { words: blockWords, characters: block.text.replace(/\s/g, "").length };
      blockTextCounts.set(block, counts);
    }
    words += counts.words;
    characters += counts.characters;
  }
  return { words, characters };
}

export function isBlankParagraph(block: DocumentBlock) {
  return block.kind === "paragraph" && !block.structure && !block.quoteGroup && !block.text.trim();
}

export type DocumentPosition = { blockId: string; offset: number };
export type DocumentSelection = { anchor: DocumentPosition; focus: DocumentPosition; wholeBlocks?: boolean };

type SelectionRange = {
  startIndex: number;
  endIndex: number;
  startOffset: number;
  endOffset: number;
};

const paragraphCharacters = Array.from(
  "文档正文记录项目讨论、观察结果与待办事项。这个段落用于检查读写、查找、滚动和跨段落选择。" +
    "混合输入包含中文标点、Web editor 以及示例字符🙂。",
);

function sampleParagraph(length: number, index: number) {
  const start = (index * 13) % paragraphCharacters.length;
  const cycle = [...paragraphCharacters.slice(start), ...paragraphCharacters.slice(0, start)];
  const repeats = Math.floor(length / cycle.length);
  return cycle.join("").repeat(repeats) + cycle.slice(0, length % cycle.length).join("");
}

const sampleHeadingLevels: HeadingLevel[] = [1, 2, 3, 3, 2, 3, 3, 2, 3, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export function createDocument(size: SampleSize): DocumentBlock[] {
  const blocks: DocumentBlock[] = [];
  let remaining = size;
  for (let index = 1; remaining > 0; index++) {
    const heading = index % 36 === 0;
    const section = index / 36;
    const title = heading ? `第 ${section} 节 · 长文档阅读与编辑` : "";
    const titleCharacters = Array.from(title);
    const requestedLength = heading
      ? titleCharacters.length
      : index === 53
        ? 6000
        : 36 + ((index * 29) % 160);
    const length = Math.min(requestedLength, remaining);
    blocks.push({
      id: `block-${index}`,
      text: heading ? titleCharacters.slice(0, length).join("") : sampleParagraph(length, index),
      kind: heading ? "heading" : "paragraph",
      ...(heading && { level: sampleHeadingLevels[(section - 1) % sampleHeadingLevels.length] }),
    });
    remaining -= length;
  }
  return blocks;
}

function normalizeOffset(text: string, offset: number) {
  const position = Math.max(0, Math.min(text.length, Math.trunc(offset) || 0));
  if (position === 0 || position === text.length) return position;

  const previous = text.charCodeAt(position - 1);
  const next = text.charCodeAt(position);
  const insideSurrogatePair = previous >= 0xd800 && previous <= 0xdbff &&
    next >= 0xdc00 && next <= 0xdfff;
  return insideSurrogatePair ? position - 1 : position;
}

export function getSelectionRange(
  blocks: readonly DocumentBlock[],
  selection: DocumentSelection,
): SelectionRange | null {
  const anchorIndex = blocks.findIndex((block) => block.id === selection.anchor.blockId);
  const focusIndex = blocks.findIndex((block) => block.id === selection.focus.blockId);
  if (anchorIndex < 0 || focusIndex < 0) return null;

  const anchorOffset = normalizeOffset(blocks[anchorIndex].text, selection.anchor.offset);
  const focusOffset = normalizeOffset(blocks[focusIndex].text, selection.focus.offset);
  if (anchorIndex < focusIndex || (anchorIndex === focusIndex && anchorOffset <= focusOffset)) {
    return { startIndex: anchorIndex, endIndex: focusIndex, startOffset: anchorOffset, endOffset: focusOffset };
  }
  return { startIndex: focusIndex, endIndex: anchorIndex, startOffset: focusOffset, endOffset: anchorOffset };
}

export function getSelectedText(blocks: readonly DocumentBlock[], selection: DocumentSelection) {
  const range = getSelectionRange(blocks, selection);
  if (!range) return "";

  const { startIndex, endIndex, startOffset, endOffset } = range;
  if (startIndex === endIndex) return blocks[startIndex].text.slice(startOffset, endOffset);

  const middle = blocks.slice(startIndex + 1, endIndex).map((block) => block.text);
  return [
    blocks[startIndex].text.slice(startOffset),
    ...middle,
    blocks[endIndex].text.slice(0, endOffset),
  ].join("\n");
}

export function deleteSelectedText(blocks: DocumentBlock[], selection: DocumentSelection) {
  const range = getSelectionRange(blocks, selection);
  if (!range) return blocks;

  const { startIndex, endIndex, startOffset, endOffset } = range;
  if (startIndex === endIndex && startOffset === endOffset) return blocks;

  const start = blocks[startIndex];
  const end = blocks[endIndex];
  return [
    ...blocks.slice(0, startIndex),
    { ...start, text: start.text.slice(0, startOffset) + end.text.slice(endOffset) },
    ...blocks.slice(endIndex + 1),
  ];
}

export function selectDocument(blocks: readonly DocumentBlock[]): DocumentSelection {
  const first = blocks[0];
  const last = blocks[blocks.length - 1];
  return {
    anchor: { blockId: first?.id ?? "", offset: 0 },
    focus: { blockId: last?.id ?? "", offset: last?.text.length ?? 0 },
    wholeBlocks: true,
  };
}

export type DocumentMatch = {
  blockId: string;
  blockIndex: number;
  from: number;
  to: number;
  text: string;
};

export function findDocumentMatches(blocks: readonly DocumentBlock[], query: string): DocumentMatch[] {
  if (!query) return [];

  const literal = query.replace(/[-.*+?^$(){}|[\]\\]/g, "\\$&");
  const pattern = new RegExp(literal, "giu");
  const matches: DocumentMatch[] = [];
  blocks.forEach((block, blockIndex) => {
    for (const match of block.text.matchAll(pattern)) {
      matches.push({
        blockId: block.id,
        blockIndex,
        from: match.index,
        to: match.index + match[0].length,
        text: match[0],
      });
    }
  });
  return matches;
}
