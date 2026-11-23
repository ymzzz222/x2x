import { Fragment, type Node as PMNode, type Schema } from "@tiptap/pm/model";
import { liftListItem, sinkListItem, splitListItem } from "@tiptap/pm/schema-list";
import { EditorState, TextSelection, type Command, type Transaction } from "@tiptap/pm/state";
import { Transform } from "@tiptap/pm/transform";
import { headingLevels, type HeadingLevel } from "./document-model";

export type BlockType = "paragraph" | "heading" | "bulletList" | "orderedList" | "blockquote" | "callout" | "horizontalRule" | "columns";
export type BlockKind = { type: BlockType; level?: HeadingLevel; start?: number; resumeNumbering?: boolean };
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

export function convertBlock(doc: PMNode, target: BlockKind, stripPrefix = 0): readonly PMNode[] {
  const schema = doc.type.schema;
  const removePrefix = stripPrefix && doc.childCount === 1 && doc.firstChild?.isTextblock;
  const nodes = removePrefix
    ? [doc.firstChild!.cut(stripPrefix)]
    : doc.content.content;
  const first = nodes[0];
  if (!first) return [schema.nodes.paragraph.create()];

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
    return first.type.name === target.type ? nodes : [schema.nodes[target.type].create(null, nodes)];
  }
  if (target.type === "bulletList" || target.type === "orderedList") {
    const list = schema.nodes[target.type];
    if (nodes.length === 1 && isList(first)) {
      if (first.type === list && target.start === undefined) return nodes;
      return [list.create({ ...first.attrs, ...(target.start === undefined ? {} : { start: target.start }) }, first.content)];
    }
    const entries = nodes.map((node) => schema.nodes.listItem.create(null,
      node.isTextblock ? paragraph(node, schema) : [schema.nodes.paragraph.create(), node]));
    return [list.create({ start: target.start ?? 1, numberMode: target.resumeNumbering ? "continue" : null }, entries)];
  }
  if (target.type === "heading") {
    const texts = nodes.flatMap((node) => textBlocks(node));
    const type = schema.nodes.heading;
    return texts.length ? texts.map((node) => type.create({ ...node.attrs, level: target.level ?? 1 }, node.content))
      : [type.create({ level: target.level ?? 1 })];
  }
  return nodes.flatMap(unwrap).map((node) => node.isTextblock ? paragraph(node, schema) : node);
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
  const type = doc.type.schema.nodes[kind.type];
  return new Transform(doc).setNodeMarkup(target.before, type).doc;
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
    attrs.numberMode = command.start === "continue" ? "continue" : null;
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
