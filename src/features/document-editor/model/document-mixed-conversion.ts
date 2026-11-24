import type { Node } from "@tiptap/pm/model";
import type { DocumentBlock, DocumentPosition } from "./document-model";
import { convertBlock, isList, visibleText, type BlockKind } from "./document-structure";

type Leaf = {
  id: string;
  node: Node;
  parentId: string | null;
  quoteGroup: string | null;
  from: number;
  to: number;
  selected: boolean;
};

function hasNestedContent(block: DocumentBlock) {
  let nested = false;
  block.structure?.descendants((node, _position, parent) => {
    if (parent?.type.name === "listItem" && (isList(node) || node.type.name === "blockquote")) nested = true;
    if (node.type.name === "blockquote" && node.content.content.some(isList)) nested = true;
    return !nested;
  });
  return nested;
}

function logicalBlocks(doc: Node, block: DocumentBlock, nextId: () => string) {
  const leaves: Leaf[] = [];
  let offset = 0;
  function add(node: Node, parentId: string | null, quoteGroup: string | null) {
    const id = leaves.length ? nextId() : block.id;
    const to = offset + visibleText(node).length;
    leaves.push({ id, node, parentId, quoteGroup, from: offset, to, selected: true });
    offset = to + 1;
    return id;
  }

  function visit(node: Node, parentId: string | null, quoteGroup: string | null) {
    if (node.type.name === "blockquote") {
      const group = nextId();
      node.forEach((child) => visit(child, parentId, group));
    } else if (isList(node)) {
      node.forEach((item, _offset, index) => {
        const { firstChild } = item;
        if (!firstChild) return;
        const attrs = node.type.name === "orderedList"
          ? { ...node.attrs, start: (Number(node.attrs.start) || 1) + index,
            numberMode: index ? null : node.attrs.numberMode }
          : node.attrs;
        const list = node.type.create(attrs, item.type.create(item.attrs, firstChild));
        const id = add(list, parentId, quoteGroup);
        item.content.content.slice(1).forEach((child) => visit(child, id, quoteGroup));
      });
    } else add(node, parentId, quoteGroup);
  }

  doc.forEach((node) => visit(node, block.parentId ?? null, block.quoteGroup ?? null));
  return leaves;
}

function editQuoteGroups(leaves: Leaf[], toggleSameType: boolean, nextId: () => string) {
  const byId = new Map(leaves.map((leaf) => [leaf.id, leaf]));
  const selected = leaves.filter((leaf) => leaf.selected);
  const first = selected[0]?.quoteGroup;
  if (toggleSameType && first && selected.every((leaf) => leaf.quoteGroup === first)) {
    for (const leaf of selected) leaf.quoteGroup = null;
    return true;
  }
  const protectedBranches = new Set<string>();
  for (const leaf of leaves) {
    if (!leaf.quoteGroup) continue;
    for (let parent: Leaf | undefined = leaf; parent; parent = byId.get(parent.parentId ?? "")) {
      if (protectedBranches.has(parent.id)) break;
      protectedBranches.add(parent.id);
    }
  }
  let quote: string | null = null;
  let changed = false;
  for (const leaf of leaves) {
    if (!leaf.selected || protectedBranches.has(leaf.id) || (leaf.parentId && protectedBranches.has(leaf.parentId))) {
      // Propagate protection to siblings or descendants under the protected branch.
      if (leaf.parentId && protectedBranches.has(leaf.parentId)) protectedBranches.add(leaf.id);
      quote = null;
      continue;
    }
    quote ??= nextId();
    leaf.quoteGroup = quote;
    changed = true;
  }
  return changed;
}

export function convertMixedHierarchy(affected: readonly DocumentBlock[], target: BlockKind, {
  content, nextId, startOffset, endOffset, wholeRows, toggleSameType,
}: {
  content: (block: DocumentBlock) => Node;
  nextId: () => string;
  startOffset: number;
  endOffset: number;
  wholeRows: boolean;
  toggleSameType: boolean;
}) {
  const singleRow = affected.length === 1;
  if (!affected.length || (singleRow && (startOffset === endOffset || target.type === "blockquote")) ||
    !["paragraph", "heading", "orderedList", "bulletList", "blockquote"].includes(target.type) ||
    !affected.some((block) => typeof block.parentId === "string" || hasNestedContent(block))) return;

  const bySource = new Map<string, Leaf[]>();
  const leaves = affected.flatMap((block, index) => {
    const current = logicalBlocks(content(block), block, nextId);
    for (const leaf of current) {
      leaf.selected = wholeRows || (index > 0 || leaf.to >= startOffset) &&
        (index < affected.length - 1 || leaf.from < endOffset || (endOffset === block.text.length && leaf.from === endOffset));
    }
    bySource.set(block.id, current);
    return current;
  });
  if (singleRow && leaves.filter((leaf) => leaf.selected).length < 2) return;
  let changed = leaves.length !== affected.length;
  if (target.type === "blockquote") {
    const quoted = editQuoteGroups(leaves, toggleSameType, nextId);
    changed = quoted;
  } else {
    let preceding: Node | undefined;
    for (const leaf of leaves) {
      const previous = leaf.node;
      if (leaf.selected) {
        const schema = previous.type.schema;
        if (target.type === "orderedList" && previous.type.name === "heading" && previous.attrs.numberStart !== null) {
          preceding = previous;
          continue;
        }
        const command = singleRow && target.type === "heading" && previous.type.name === "orderedList"
          ? { ...target, numberStart: target.numberStart ?? Number(previous.attrs.start) } : target;
        leaf.node = convertBlock(schema.topNodeType.create(null, previous), command, { preceding })[0];
      }
      changed ||= !previous.eq(leaf.node);
      preceding = leaf.node;
    }
  }

  function mapPosition(position: DocumentPosition) {
    const sources = bySource.get(position.blockId);
    const target = sources?.find(({ to }) => position.offset <= to) ?? sources?.at(-1);
    return target ? { blockId: target.id, offset: Math.max(0, Math.min(position.offset - target.from, visibleText(target.node).length)) }
      : position;
  }
  return { replacement: leaves, changed, mapPosition, splitRows: leaves.length !== affected.length, focusOffset: endOffset };
}
