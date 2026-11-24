import { DOMParser, DOMSerializer, Fragment, type Node } from "@tiptap/pm/model";
import { documentSchema, offsetAt, positionAtOffset } from "./document-editor-schema";
import { defaultOrderedListType, isList, listWindows, visibleText } from "./document-structure";
import { getSelectedText, getSelectionRange, type DocumentBlock, type DocumentSelection } from "./document-model";
import type { DocumentSection } from "./document-outline";

type ReadContent = (block: DocumentBlock) => Node;
type Outline = ReadonlyMap<string, DocumentSection>;
type ClipboardRelation = { parent?: number | null; quote?: number };
type PastedContent = { nodes: readonly Node[]; inline: boolean; relations?: readonly ClipboardRelation[] };
type ClipboardPart = Pick<DocumentBlock, "id" | "parentId" | "quoteGroup"> & { content: Fragment };
export type RangeEdit = "delete" | "split" | PastedContent;

function writeClipboardHtml(data: DataTransfer, parts: readonly ClipboardPart[]) {
  const serializer = DOMSerializer.fromSchema(documentSchema());
  const holder = document.createElement("div");
  const structured = parts.some((part) => part.parentId !== undefined);
  const rows = structured ? new Map(parts.map(({ id }, index) => [id, index])) : null;
  let previous: string | undefined;
  let parent: HTMLElement = holder;
  for (const { content, quoteGroup, parentId } of parts) {
    if (quoteGroup !== previous) {
      parent = quoteGroup ? document.createElement("blockquote") : holder;
      if (quoteGroup) holder.append(parent);
    }
    let target = parent;
    if (rows) {
      target = document.createElement("div");
      target.dataset.x2xClipboardRow = "1";
      if (parentId !== undefined) {
        const index = parentId === null ? undefined : rows.get(parentId);
        target.dataset.x2xClipboardParent = index === undefined ? "root" : String(index);
      }
      parent.append(target);
    }
    serializer.serializeFragment(content, { document }, target);
    previous = quoteGroup;
  }
  data.setData("text/html", holder.innerHTML);
}

function readStructuredClipboard(fragment: DocumentFragment, parser: DOMParser): PastedContent | undefined {
  const isRow = (element: Element): element is HTMLElement => element.tagName === "DIV" &&
    element.getAttribute("data-x2x-clipboard-row") === "1";
  const nodes: Node[] = [];
  const relations: ClipboardRelation[] = [];
  const rows: number[] = [];

  for (const element of fragment.children) {
    if (element.tagName === "META" && element.hasAttribute("charset")) continue;
    const group = element.tagName === "BLOCKQUOTE" ? [...element.children] : [element];
    if (!group.length || !group.every(isRow)) return;
    const quote = element.tagName === "BLOCKQUOTE" ? nodes.length : undefined;
    for (const row of group) {
      const offset = nodes.length;
      let parent: number | null | undefined;
      const hint = row.dataset.x2xClipboardParent;
      if (hint === "root") parent = null;
      else if (hint !== undefined) {
        if (!/^\d+$/.test(hint) || rows[Number(hint)] === undefined) return;
        parent = rows[Number(hint)];
      }
      rows.push(offset);
      const content = parser.parse(row, { preserveWhitespace: true }).content.content.flatMap(listWindows);
      if (!content.length) return;
      nodes.push(...content);
      relations.push(...content.map(() => ({ parent, quote })));
    }
  }

  if (nodes.length) return { nodes, relations, inline: false };
}

export function applyClipboardRelations(replacement: { id: string; node: Node }[], start: number,
  relations: readonly ClipboardRelation[], nextId: () => string) {
  const quotes = new Map<number, string>();
  return replacement.map((part, index) => {
    const relation = relations[index - start];
    if (!relation) return part;
    const { parent, quote } = relation;
    if (quote !== undefined && !quotes.has(quote)) quotes.set(quote, nextId());
    return {
      ...part,
      parentId: typeof parent === "number" ? replacement[start + parent]?.id : parent,
      quoteGroup: quote === undefined ? null : quotes.get(quote),
    };
  });
}

function orderedMarker(value: number, style: string) {
  let marker = "";
  const type = style.toLowerCase();
  if (type === "a" && value > 0) {
    for (let index = value; index > 0; index = Math.floor((index - 1) / 26)) {
      marker = String.fromCharCode(97 + (index - 1) % 26) + marker;
    }
  }
  if (type === "i" && value > 0 && value < 4000) {
    let remaining = value;
    const digits = [[1000, "m"], [900, "cm"], [500, "d"], [400, "cd"], [100, "c"], [90, "xc"],
      [50, "l"], [40, "xl"], [10, "x"], [9, "ix"], [5, "v"], [4, "iv"], [1, "i"]] as const;
    for (const [amount, symbol] of digits) {
      marker += symbol.repeat(Math.floor(remaining / amount));
      remaining %= amount;
    }
  }
  if (style === "A" || style === "I") marker = marker.toUpperCase();
  return (marker || String(value)) + ". ";
}

function wholeBlockText(block: DocumentBlock, outline: Outline) {
  const heading = outline.get(block.id)?.numbering?.label;
  if (heading) return heading + " " + block.text;
  if (!block.structure) return block.text;
  const lines: string[] = [];
  function append(node: Node, depth: number, prefix = "") {
    if (node.isTextblock) {
      lines.push(prefix + visibleText(node));
    } else if (isList(node)) {
      const ordered = node.type.name === "orderedList";
      const type = node.attrs.type;
      const style = typeof type === "string" ? type : defaultOrderedListType(depth);
      const start = Number.isSafeInteger(node.attrs.start) ? Number(node.attrs.start) : 1;
      node.forEach((item, _offset, index) => append(item, depth + 1, ordered ? orderedMarker(start + index, style) : ""));
    } else {
      node.forEach((child, _offset, index) => append(child, depth, index === 0 ? prefix : ""));
    }
  }
  append(block.structure, 0);
  return lines.join("\n");
}

export function documentPlainText(blocks: readonly DocumentBlock[], outline: Outline) {
  return blocks.map((block) => wholeBlockText(block, outline)).join("\n");
}

export function writeClipboard(
  data: DataTransfer,
  blocks: readonly DocumentBlock[],
  selection: DocumentSelection,
  readContent: ReadContent,
  outline: Outline,
) {
  const range = getSelectionRange(blocks, selection);
  if (!range || (range.startIndex === range.endIndex && range.startOffset === range.endOffset)) return false;
  const { startIndex, endIndex, startOffset, endOffset } = range;
  const parts: ClipboardPart[] = [];

  for (let index = startIndex; index <= endIndex; index++) {
    if (index === endIndex && index !== startIndex && !endOffset && !selection.wholeBlocks) break;
    const content = readContent(blocks[index]);
    const from = index === startIndex && startOffset > 0 ? positionAtOffset(content, startOffset) : 0;
    const to = index === endIndex && endOffset < blocks[index].text.length
      ? positionAtOffset(content, endOffset)
      : content.content.size;
    const { id, parentId, quoteGroup } = blocks[index];
    parts.push({ id, content: content.cut(from, to).content, parentId, quoteGroup });
  }

  const wholeDocument = startIndex === 0 && startOffset === 0 &&
    endIndex === blocks.length - 1 && endOffset === blocks[endIndex].text.length;
  data.setData("text/plain", wholeDocument ? documentPlainText(blocks, outline) : getSelectedText(blocks, selection));
  writeClipboardHtml(data, parts);
  return true;
}

export function writeWholeBlocks(data: DataTransfer, blocks: readonly DocumentBlock[], readContent: ReadContent, outline: Outline) {
  data.setData("text/plain", documentPlainText(blocks, outline));
  writeClipboardHtml(data, blocks.map((block) => ({
    id: block.id, parentId: block.parentId, quoteGroup: block.quoteGroup, content: readContent(block).content,
  })));
}

export function readClipboard(data: DataTransfer): PastedContent | null {
  const schema = documentSchema();
  const html = data.getData("text/html");
  if (html) {
    // Parse in an inert template and retain only content understood by the editor schema.
    const template = document.createElement("template");
    template.innerHTML = html;
    const parser = DOMParser.fromSchema(schema);
    const structured = readStructuredClipboard(template.content, parser);
    if (structured) return structured;
    const content = parser.parse(template.content, { preserveWhitespace: true });
    if (content.textContent || content.childCount > 1 || content.firstChild?.type !== schema.nodes.paragraph) {
      return { nodes: content.content.content.flatMap(listWindows), inline: content.childCount === 1 && content.firstChild?.type === schema.nodes.paragraph };
    }
  }
  const text = normalizePastedText(data.getData("text/plain"));
  return text ? plainTextContent(text) : null;
}

export function normalizePastedText(text: string) {
  return text.normalize("NFC").replace(/\t/g, "        ").replace(/[\u200B\u200D]/g, "");
}

export function plainTextContent(text: string): PastedContent {
  const schema = documentSchema();
  const lines = text.split(/\r\n?|\n/);
  const nodes = lines.map((line) => schema.nodes.paragraph.create(null, line ? schema.text(line) : undefined));
  return { nodes, inline: lines.length === 1 };
}

export function planRangeEdit(first: Node, last: Node, from: number, to: number, edit: RangeEdit) {
  const schema = documentSchema();
  const list = first.lastChild;
  const item = list?.lastChild;
  const previousText = item?.firstChild;
  const followingText = last.firstChild;
  if (edit === "delete" && first !== last && to === 0 && from === offsetAt(first, first.content.size) &&
    list?.type.name === "orderedList" && item?.childCount === 1 && previousText?.type === schema.nodes.paragraph &&
    followingText?.type === schema.nodes.paragraph) {
    const merged = previousText.copy(previousText.content.append(followingText.content));
    const updated = list.copy(list.content.replaceChild(list.childCount - 1, item.copy(Fragment.from(merged))));
    return { nodes: [...first.content.content.slice(0, -1), updated, ...last.content.content.slice(1)],
      caret: first.childCount - 1, offset: visibleText(list).length };
  }
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
