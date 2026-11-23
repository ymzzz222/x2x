import { getSelectionRange, type DocumentBlock, type DocumentSelection } from "./document-model";

export const paragraphAlignments = [
  { value: "left", label: "左对齐" },
  { value: "center", label: "居中对齐" },
  { value: "right", label: "右对齐" },
] as const;

export type ParagraphAlignment = (typeof paragraphAlignments)[number]["value"];
export type ParagraphLayout = { textAlign?: ParagraphAlignment; firstLineIndent?: true };
export type ParagraphCommand = { textAlign: ParagraphAlignment } | { firstLineIndent: boolean };

export const firstLineIndentWidth = "2em";

export function readParagraphAlignment(value: unknown) {
  return paragraphAlignments.find((option) => option.value === value)?.value;
}

export function paragraphLayout(attributes: Record<string, unknown>): ParagraphLayout | undefined {
  const textAlign = readParagraphAlignment(attributes.textAlign);
  const firstLineIndent = attributes.firstLineIndent === true ? true : undefined;
  return textAlign || firstLineIndent ? { textAlign, firstLineIndent } : undefined;
}

export function paragraphStyle(layout: ParagraphLayout | null | undefined) {
  if (!layout) return;
  return { textAlign: layout.textAlign, textIndent: layout.firstLineIndent ? firstLineIndentWidth : undefined };
}

export function currentAlignment(block: DocumentBlock) {
  return block.layout?.textAlign ?? "left";
}

export function selectedParagraphs(blocks: readonly DocumentBlock[], selection: DocumentSelection) {
  const bounds = getSelectionRange(blocks, selection);
  if (!bounds) return [];
  const { startIndex, endIndex, endOffset } = bounds;
  // Ending at the start of the next paragraph leaves that paragraph outside the selection.
  const exclusiveEnd = endIndex + (startIndex === endIndex || endOffset > 0 ? 1 : 0);
  return blocks.slice(startIndex, exclusiveEnd).filter((block) => block.layout !== null);
}

export function paragraphSelectionState(blocks: readonly DocumentBlock[], selection: DocumentSelection | null) {
  const paragraphs = selection ? selectedParagraphs(blocks, selection) : [];
  const align = paragraphs[0] && currentAlignment(paragraphs[0]);
  const ordinary = paragraphs.filter((block) => block.kind === "paragraph");
  return {
    canAlign: paragraphs.length > 0,
    alignment: paragraphs.every((block) => currentAlignment(block) === align) ? align : undefined,
    canIndent: ordinary.length > 0,
    indented: ordinary.length > 0 && ordinary.every((block) => block.layout?.firstLineIndent),
  };
}
