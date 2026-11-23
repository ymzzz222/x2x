import { DOMParser, DOMSerializer, Fragment, type Node } from "@tiptap/pm/model";
import { documentSchema, offsetAt, positionAtOffset } from "./document-editor-schema";
import { listWindows } from "./document-structure";
import { getSelectedText, getSelectionRange, type DocumentBlock, type DocumentSelection } from "./document-model";

type ReadContent = (block: DocumentBlock) => Node;
type PastedContent = { nodes: readonly Node[]; inline: boolean };
export type RangeEdit = "delete" | "split" | PastedContent;

export function writeClipboard(
  data: DataTransfer,
  blocks: readonly DocumentBlock[],
  selection: DocumentSelection,
  readContent: ReadContent,
) {
  const range = getSelectionRange(blocks, selection);
  if (!range || (range.startIndex === range.endIndex && range.startOffset === range.endOffset)) return false;
  const { startIndex, endIndex, startOffset, endOffset } = range;
  const serializer = DOMSerializer.fromSchema(documentSchema());
  const holder = document.createElement("div");

  for (let index = startIndex; index <= endIndex; index++) {
    const content = readContent(blocks[index]);
    const from = index === startIndex && startOffset > 0 ? positionAtOffset(content, startOffset) : 0;
    const to = index === endIndex && endOffset < blocks[index].text.length
      ? positionAtOffset(content, endOffset)
      : content.content.size;
    serializer.serializeFragment(content.cut(from, to).content, { document }, holder);
  }

  data.setData("text/plain", getSelectedText(blocks, selection));
  data.setData("text/html", holder.innerHTML);
  return true;
}

export function writeWholeBlocks(data: DataTransfer, blocks: readonly DocumentBlock[], readContent: ReadContent) {
  const serializer = DOMSerializer.fromSchema(documentSchema());
  const holder = document.createElement("div");
  for (const block of blocks) serializer.serializeFragment(readContent(block).content, { document }, holder);
  data.setData("text/plain", blocks.map(({ text }) => text).join("\n"));
  data.setData("text/html", holder.innerHTML);
}

export function readClipboard(data: DataTransfer): PastedContent | null {
  const schema = documentSchema();
  const html = data.getData("text/html");
  if (html) {
    // Parse in an inert template and retain only content understood by the editor schema.
    const template = document.createElement("template");
    template.innerHTML = html;
    const content = DOMParser.fromSchema(schema).parse(template.content, { preserveWhitespace: true });
    if (content.textContent || content.childCount > 1 || content.firstChild?.type !== schema.nodes.paragraph) {
      return { nodes: content.content.content.flatMap(listWindows), inline: content.childCount === 1 && content.firstChild?.type === schema.nodes.paragraph };
    }
  }
  const text = data.getData("text/plain");
  if (!text) return null;
  const lines = text.split(/\r\n?|\n/);
  const nodes = lines.map((line) => schema.nodes.paragraph.create(null, line ? schema.text(line) : undefined));
  return { nodes, inline: lines.length === 1 };
}

export function planRangeEdit(first: Node, last: Node, from: number, to: number, edit: RangeEdit) {
  const schema = documentSchema();
  const left = first.cut(0, positionAtOffset(first, from)).content;
  const right = last.cut(positionAtOffset(last, to)).content;
  const before = from > 0 ? left.content : [];
  const after = to < offsetAt(last, last.content.size) ? right.content : [];

  if (edit === "split") {
    const firstAfter = right.firstChild;
    const continuation = firstAfter?.type === schema.nodes.heading
      ? schema.nodes.paragraph.create(null, firstAfter.content)
      : firstAfter ?? schema.nodes.paragraph.create();
    return { nodes: [...left.content, continuation, ...right.content.slice(1)], caret: left.childCount, offset: 0 };
  }

  const inserted = edit === "delete" ? [] : edit.nodes;
  const inline = edit === "delete" || edit.inline;
  const leftEdge = left.lastChild;
  const rightEdge = right.firstChild;

  if (inline && leftEdge?.isTextblock && rightEdge?.isTextblock) {
    const insertedContent = inserted[0]?.content ?? Fragment.empty;
    const prefix = leftEdge.content.append(insertedContent);
    const joined = prefix.append(rightEdge.content);
    if (leftEdge.type.validContent(joined)) {
      return {
        nodes: [...left.content.slice(0, -1), leftEdge.copy(joined), ...right.content.slice(1)],
        caret: left.childCount - 1,
        offset: leftEdge.copy(prefix).textBetween(0, prefix.size, "\n", "\n").length,
      };
    }
  }

  // Multiline pastes become independently mounted blocks. Keep the old text on both sides.
  const nodes = [...before, ...inserted, ...after];
  if (!nodes.length) nodes.push(schema.nodes.paragraph.create());
  const caret = Math.max(0, before.length + inserted.length - 1);
  const offset = before.length || inserted.length
    ? nodes[caret].textBetween(0, nodes[caret].content.size, "\n", "\n").length
    : 0;
  return { nodes, caret, offset };
}
