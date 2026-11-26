import { Fragment, type Node as PMNode, type Schema } from "@tiptap/pm/model";
import { liftListItem, sinkListItem, splitListItem } from "@tiptap/pm/schema-list";
import { EditorState, TextSelection, type Command, type Transaction } from "@tiptap/pm/state";
import { Transform } from "@tiptap/pm/transform";
import { headingLevels, type DocumentBlock, type DocumentPosition, type HeadingLevel } from "./document-model";

export type BlockType = "paragraph" | "heading" | "bulletList" | "orderedList" | "blockquote" | "callout" | "horizontalRule" | "columns";
export type BlockKind = { type: BlockType; level?: HeadingLevel; start?: number; numberStart?: number };
export type ListStyle = "disc" | "circle" | "square";

export const blockTypes: { kind: BlockKind; label: string; search: string }[] = [
  { kind: { type: "paragraph" }, label: "正文", search: "paragraph text" },
  ...headingLevels.map((level) => ({ kind: { type: "heading" as const, level }, label: "标题 " + level, search: "h" + level + " heading" })),
  { kind: { type: "bulletList" }, label: "无序列表", search: "bullet ul" },
  { kind: { type: "orderedList" }, label: "有序列表", search: "ordered ol" },
  { kind: { type: "blockquote" }, label: "引用", search: "quote" },
  { kind: { type: "callout" }, label: "高亮块", search: "callout highlight" },
  { kind: { type: "horizontalRule" }, label: "分割线", search: "divider hr" },
  { kind: { type: "columns" }, label: "两栏", search: "columns 2 分栏" },
];

export function isList(node: PMNode) {
  return node.type.name === "orderedList" || node.type.name === "bulletList";
}

export function defaultOrderedListType(depth: number) {
  return (["1", "a", "i"] as const)[depth % 3];
}

export function bulletStyle(value: unknown): ListStyle | null {
  return value === "disc" || value === "circle" || value === "square" ? value : null;
}

export function visibleText(doc: PMNode, from = 0, to = doc.content.size) {
  return doc.textBetween(from, to, "\n", (node) => node.type.name === "hardBreak" ? "\n" : "");
}

function textBlocks(node: PMNode, nodes: PMNode[] = []): PMNode[] {
  if (node.isTextblock) nodes.push(node);
  else node.forEach((child) => textBlocks(child, nodes));
  return nodes;
}

function paragraph(node: PMNode, schema: Schema) {
  return schema.nodes.paragraph.create({ ...node.attrs }, node.content);
}

function unwrap(node: PMNode): readonly PMNode[] {
  if (node.type.name === "columns" || isList(node)) return node.content.content.flatMap((child) => child.content.content);
  if (node.type.name === "blockquote" || node.type.name === "callout") return node.content.content;
  return [node];
}

export function convertBlock(doc: PMNode, target: BlockKind, { stripPrefix = 0, toggleSameType, preceding, insideQuote }: {
  stripPrefix?: number; toggleSameType?: boolean; preceding?: PMNode; insideQuote?: boolean;
} = {}): readonly PMNode[] {
  const schema = doc.type.schema;
  const removePrefix = stripPrefix && doc.childCount === 1 && doc.firstChild?.isTextblock;
  const nodes = removePrefix
    ? [doc.firstChild!.cut(stripPrefix)]
    : doc.content.content;
  const first = nodes[0];
  if (!first) return [schema.nodes.paragraph.create()];

  const quoted = first.firstChild;
  if (insideQuote && nodes.length === 1 && first.type === schema.nodes.blockquote && first.childCount === 1 && quoted?.type === schema.nodes.paragraph) {
    if (target.type === "paragraph") return nodes;
    if (target.type === "heading" || target.type === "orderedList" || target.type === "bulletList") {
      const converted = convertBlock(schema.topNodeType.create(null, quoted), target);
      return [first.copy(Fragment.fromArray(converted))];
    }
  }

  if (target.type === "horizontalRule") {
    const rule = schema.nodes.horizontalRule.create();
    return [...(visibleText(doc).length > stripPrefix ? nodes : []), rule, schema.nodes.paragraph.create()];
  }
  if (target.type === "columns") {
    if (first.type.name === "columns") return nodes;
    const column = schema.nodes.column;
    return [schema.nodes.columns.create(null, [column.create(null, nodes), column.createAndFill()!])];
  }
  if (target.type === "blockquote" || target.type === "callout") {
    if (first.type.name !== target.type) return [schema.nodes[target.type].create(null, nodes)];
    return toggleSameType && target.type === "blockquote" && nodes.length === 1 && first.childCount === 1 ? unwrap(first) : nodes;
  }
  if (target.type === "bulletList" || target.type === "orderedList") {
    const list = schema.nodes[target.type];
    const continueNumbering = target.type === "orderedList" && target.start === undefined && first.type !== list;
    const start = target.start ?? (continueNumbering ? preceding?.type === list ? Number(preceding.attrs.start) + preceding.childCount : 1 : undefined);
    if (target.type === "orderedList" && nodes.length === 1 && first.type === schema.nodes.heading) {
      const numberStart = first.attrs.numberStart === null ? 0 : null;
      return [first.type.create({ ...first.attrs, numberStart }, first.content)];
    }
    if (nodes.length === 1 && isList(first)) {
      if (first.type === list && start === undefined) {
        return toggleSameType && first.childCount === 1 && first.firstChild?.childCount === 1 ? unwrap(first) : nodes;
      }
      return [list.create({ ...first.attrs, ...(start === undefined ? {} : { start }) }, first.content)];
    }
    const entries = nodes.map((node) => schema.nodes.listItem.create(null,
      node.isTextblock ? paragraph(node, schema) : [schema.nodes.paragraph.create(), node]));
    return [list.create({ start: start ?? 1, numberMode: continueNumbering ? "continue" : null }, entries)];
  }
  if (target.type === "heading") {
    const type = schema.nodes.heading;
    const level = target.level ?? 1;
    if (toggleSameType && target.numberStart === undefined && nodes.length === 1 && first.type === type && first.attrs.level === level) {
      const text = paragraph(first, schema);
      if (first.attrs.numberStart === null) return [text];
      return [schema.nodes.orderedList.create({ start: first.attrs.numberStart || 1 }, schema.nodes.listItem.create(null, text))];
    }
    const texts = nodes.flatMap((node) => textBlocks(node));
    return texts.length ? texts.map((node) => type.create({ ...node.attrs, level,
      numberStart: target.numberStart ?? node.attrs.numberStart }, node.content)) : [type.create({ level })];
  }
  return nodes.flatMap(unwrap).map((node) => node.isTextblock ? paragraph(node, schema) : node);
}

export function orderedItemHeading(doc: PMNode, level: HeadingLevel, head?: number) {
  const list = doc.firstChild;
  if (doc.childCount !== 1 || list?.type.name !== "orderedList") return;
  const cursor = head === undefined ? null : doc.resolve(Math.min(Math.max(0, head), doc.content.size));
  if (cursor ? cursor.depth < 3 || cursor.node(1) !== list : list.childCount !== 1) return;
  const index = cursor?.index(1) ?? 0;
  const item = list.maybeChild(index);
  const text = item?.firstChild;
  if (!item || !text || (cursor && cursor.parent !== text)) return;
  const before = list.content.content.slice(0, index);
  const after = list.content.content.slice(index + 1);
  const heading = doc.type.schema.nodes.heading.create({ ...text.attrs, level, numberStart: 0 }, text.content);
  return {
    nodes: [...(before.length ? [list.copy(Fragment.fromArray(before))] : []), heading, ...item.content.content.slice(1),
      ...(after.length ? [list.type.create({ ...list.attrs, start: Number(list.attrs.start) + index, numberMode: null }, after)] : [])],
    index: before.length ? 1 : 0,
    offset: cursor ? visibleText(doc, cursor.start(), cursor.pos).length : undefined,
  };
}

function simpleListBlock({ structure }: DocumentBlock, type: BlockType, wholeRows: boolean) {
  const list = structure?.firstChild;
  return structure?.childCount === 1 && list?.type.name === type &&
    (wholeRows || list.childCount === 1) && list.content.content.every((item) =>
      item.childCount === 1 && item.firstChild?.type.name === "paragraph");
}

export function convertBlocks(affected: readonly DocumentBlock[], target: BlockKind, {
  content, blank, nextId, preceding, single, wholeRows, toggleSameType, stripPrefix, head, focusOffset,
}: {
  content: (block: DocumentBlock) => PMNode;
  blank: PMNode;
  nextId: () => string;
  preceding?: PMNode;
  single: boolean;
  wholeRows: boolean;
  toggleSameType: boolean;
  stripPrefix: number;
  head?: number;
  focusOffset: number;
}) {
  const toggle = toggleSameType && (single || (target.type === "heading" && affected.every((block) =>
    block.kind === "heading" && block.level === (target.level ?? 1) && block.numberStart === undefined && !block.structure)));
  const toggleLists = toggleSameType && (target.type === "orderedList" || target.type === "bulletList") &&
    (!single || wholeRows) && affected.every((block) => simpleListBlock(block, target.type, wholeRows));
  const numberHeadings = target.type === "heading" && (!single || wholeRows) &&
    (wholeRows ? affected.some((block) => simpleListBlock(block, "orderedList", true)) :
      affected.every((block) => simpleListBlock(block, "orderedList", false)));
  const replacement: { id: string; node: PMNode; quoteGroup: string | null }[] = [];
  const splitRows = new Map<string, { id: string; node: PMNode }[]>();
  let changed = !affected.length;
  for (const block of affected.length ? affected : [null]) {
    const doc = block ? content(block) : blank;
    const heading = single && target.type === "heading" && !numberHeadings ? orderedItemHeading(doc, target.level ?? 1, head) : undefined;
    let nodes: readonly PMNode[];
    if (block && toggleLists) {
      nodes = unwrap(doc.firstChild!);
    } else if (block && numberHeadings && simpleListBlock(block, "orderedList", wholeRows)) {
      const type = doc.type.schema.nodes.heading;
      nodes = unwrap(doc.firstChild!).map((node) =>
        type.create({ ...node.attrs, level: target.level ?? 1, numberStart: target.numberStart ?? 0 }, node.content));
    } else {
      nodes = heading?.nodes ?? convertBlock(doc, target, {
        stripPrefix, preceding, toggleSameType: toggle, insideQuote: single && toggleSameType && head !== undefined,
      });
    }
    focusOffset = heading?.offset ?? focusOffset;
    if (nodes.length !== doc.childCount || nodes.some((node, i) => !node.eq(doc.child(i)))) changed = true;
    const converted = nodes.map((node, i) => ({
      id: i === (heading?.index ?? 0) && block ? block.id : nextId(), node, quoteGroup: block?.quoteGroup ?? null,
    }));
    replacement.push(...converted);
    if (block && converted.length > 1) splitRows.set(block.id, converted);
    preceding = nodes.at(-1) ?? undefined;
  }
  function mapPosition(position: DocumentPosition) {
    const converted = splitRows.get(position.blockId);
    if (!converted) return position;
    let offset = position.offset;
    for (const { id, node } of converted) {
      const length = visibleText(node).length;
      if (offset <= length || id === converted.at(-1)?.id) return { blockId: id, offset: Math.min(offset, length) };
      offset -= length + 1;
    }
    return position;
  }
  return { replacement, changed, focusOffset, mapPosition, splitRows: splitRows.size > 0 };
}

export function markdownBlock(prefix: string): BlockKind | undefined {
  if (/^#{1,9}$/.test(prefix)) return { type: "heading", level: prefix.length as HeadingLevel };
  if (/^[-*+]$/.test(prefix)) return { type: "bulletList" };
  if (/^\d{1,7}\.$/.test(prefix)) return { type: "orderedList", start: Math.max(1, Number(prefix.slice(0, -1))) };
  if (prefix === ">") return { type: "blockquote" };
  if (prefix === "---") return { type: "horizontalRule" };
}

export type ListCommand = { start: "continue" | number } | { marker: string };
export type ListKey = "Enter" | "Tab" | "Shift+Tab" | "Backspace" | "AppendParagraph";

export function listTransaction(doc: PMNode, anchor: number, head: number, key: ListKey): Transaction | undefined {
  const resolve = (position: number) => doc.resolve(Math.max(0, Math.min(position, doc.content.size)));
  const selection = TextSelection.between(resolve(anchor), resolve(head));
  const { $from, empty } = selection;
  const item = doc.type.schema.nodes.listItem;
  let itemDepth = $from.depth;
  while (itemDepth > 0 && $from.node(itemDepth).type !== item) itemDepth--;
  if (!itemDepth) return;
  const state = EditorState.create({ doc, selection });
  let transaction: Transaction | undefined;
  const run = (command: Command) => command(state, (tr) => { transaction = tr; });
  const atStart = empty && $from.parentOffset === 0 && $from.index(itemDepth) === 0;

  if (key === "AppendParagraph") {
    const at = $from.after(itemDepth + 1);
    const action = state.tr.insert(at, doc.type.schema.nodes.paragraph.create());
    return action.setSelection(TextSelection.create(action.doc, at + 1));
  }
  if (key === "Enter") {
    if (!run(splitListItem(item)) && !$from.parent.content.size) run(liftListItem(item));
  } else if (atStart) {
    if (key === "Tab") run(sinkListItem(item));
    else if (key === "Shift+Tab" || key === "Backspace") run(liftListItem(item));
  }
  if (key === "Backspace" && transaction && itemDepth === 2) {
    const list = $from.node(1);
    const index = $from.index(1);
    if (list.type.name === "orderedList" && index > 0 && index + 1 < list.childCount) {
      // Lifting a middle item keeps the original list's following items in a new root.
      const tailIndex = transaction.doc.childCount - (doc.childCount - $from.index(0));
      const lifted = transaction;
      lifted.doc.forEach((node, offset, childIndex) => {
        if (childIndex === tailIndex && node.type === list.type) {
          lifted.setNodeMarkup(offset, undefined, { ...node.attrs, numberMode: "continue-across" });
        }
      });
    }
  }
  return transaction;
}

export function enclosingList(doc: PMNode, head: number) {
  const pos = doc.resolve(Math.max(0, Math.min(doc.content.size, head)));
  let depth = pos.depth;
  while (depth > 0 && !isList(pos.node(depth))) depth--;
  const list = depth ? pos.node(depth) : doc.firstChild;
  if (!list || !isList(list)) return;
  return { pos, depth, list, before: depth ? pos.before(depth) : 0 };
}

export function changeListType(doc: PMNode, head: number, kind: BlockKind) {
  const target = enclosingList(doc, head);
  if (!target || !["bulletList", "orderedList"].includes(kind.type) || target.list.type.name === kind.type) return doc;
  const { pos, depth, list, before } = target;
  const type = doc.type.schema.nodes[kind.type];
  const index = depth ? pos.index(depth) : 0;
  const item = list.maybeChild(index);
  if (!item) return doc;
  const items = list.content.content;
  const replacement: PMNode[] = [];
  if (index) replacement.push(list.copy(Fragment.fromArray(items.slice(0, index))));
  replacement.push(type.create(null, item));
  if (index + 1 < items.length) {
    const attrs = list.type.name === "orderedList"
      ? { ...list.attrs, start: (Number(list.attrs.start) || 1) + index, numberMode: null }
      : list.attrs;
    replacement.push(list.type.create(attrs, items.slice(index + 1)));
  }
  return new Transform(doc).replaceWith(before, before + list.nodeSize, replacement).doc;
}

export function convertNestedText(doc: PMNode, head: number, kind: BlockKind, stripPrefix: number, toggle: boolean) {
  const cursor = doc.resolve(Math.min(Math.max(0, head), doc.content.size));
  const text = cursor.parent;
  if (!text.isTextblock) return;
  let quote = cursor.depth - 1;
  while (quote > 0 && cursor.node(quote).type.name !== "blockquote") quote--;
  if (!stripPrefix && !(quote && (kind.type === "heading" || (kind.type === "blockquote" && toggle)))) return;
  const schema = doc.type.schema;
  const transform = new Transform(doc);
  if (quote && kind.type === "blockquote") {
    if (!stripPrefix) {
      const wrapper = cursor.node(quote);
      transform.replaceWith(cursor.before(quote), cursor.after(quote), wrapper.content);
      return transform.doc;
    }
    return;
  }

  const literal = stripPrefix ? text.cut(stripPrefix) : text;
  const located = enclosingList(doc, head);
  if (located && located.depth > quote && cursor.depth === located.depth + 2) {
    const { list, depth, before } = located;
    const index = cursor.index(depth);
    const item = list.child(index);
    if (item.firstChild !== text) return;
    const start = (Number(list.attrs.start) || 1) + index;
    const items = list.content.content;
    const existing = item.copy(item.content.replaceChild(0, literal));
    let replacement: readonly PMNode[];
    if (kind.type === "blockquote") {
      const singleton = list.type.create({ ...list.attrs, start, numberMode: null }, existing);
      replacement = [schema.nodes.blockquote.create(null, singleton)];
    } else if (kind.type === "orderedList" || kind.type === "bulletList") {
      const sameType = list.type.name === kind.type;
      if (sameType) return transform.replaceWith(cursor.before(), cursor.after(), literal).doc;
      replacement = [schema.nodes[kind.type].create(null, existing)];
    } else {
      replacement = [...convertBlock(schema.topNodeType.create(null, literal), kind), ...item.content.content.slice(1)];
    }
    if (index) replacement = [list.copy(Fragment.fromArray(items.slice(0, index))), ...replacement];
    if (index + 1 < items.length) {
      replacement = [...replacement, list.type.create({
        ...list.attrs, ...(list.type.name === "orderedList" ? { start: start + 1, numberMode: null } : {}),
      }, items.slice(index + 1))];
    }
    return transform.replaceWith(before, before + list.nodeSize, replacement).doc;
  }
  if (!stripPrefix || quote) {
    const replacement = convertBlock(schema.topNodeType.create(null, literal), kind);
    return transform.replaceWith(cursor.before(), cursor.after(), replacement).doc;
  }
}

export function listSettings(doc: PMNode, head: number, command: ListCommand, previous?: PMNode) {
  const target = enclosingList(doc, head);
  if (!target) return doc;
  const { pos, depth, list, before } = target;
  const attrs = { ...list.attrs };
  if ("start" in command) {
    if (list.type.name !== "orderedList") return doc;
    const precedingIndex = depth > 1 ? pos.index(depth - 1) - 1 : -1;
    const preceding = depth > 1 ? (precedingIndex >= 0 ? pos.node(depth - 1).maybeChild(precedingIndex) : null) : previous;
    attrs.start = command.start === "continue"
      ? preceding?.type === list.type ? Number(preceding.attrs.start) + preceding.childCount : 1
      : command.start;
    attrs.numberMode = command.start === "continue" ? depth > 1 ? "continue" : "continue-across" : null;
  } else if (list.type.name === "orderedList") {
    attrs.type = ["1", "a", "i"].includes(command.marker) ? command.marker : null;
  } else attrs.marker = bulletStyle(command.marker);
  return new Transform(doc).setNodeMarkup(before, undefined, attrs).doc;
}

// Bound long pasted lists by top-level item groups so they can leave the viewport independently.
export const listWindowSize = 32;

export function listWindows(node: PMNode): readonly PMNode[] {
  const windowSize = listWindowSize;
  if (!isList(node) || node.childCount <= windowSize) return [node];
  const nodes: PMNode[] = [];
  for (let index = 0; index < node.childCount; index += windowSize) {
    const attrs = node.type.name === "orderedList" ? { ...node.attrs, start: Number(node.attrs.start) + index, numberMode: index ? "continue" : node.attrs.numberMode } : node.attrs;
    nodes.push(node.type.create(attrs, Fragment.fromArray(node.content.content.slice(index, index + windowSize))));
  }
  return nodes;
}
