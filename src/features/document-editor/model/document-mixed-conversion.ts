import type { Node } from "@tiptap/pm/model";
import type { DocumentBlock, DocumentPosition } from "./document-model";
import { convertBlock, isList, visibleText, type BlockKind } from "./document-structure";

type Leaf = {
  id: string;
  node: Node;
  parentId: string | null;
  quoteGroup: string | null;
  calloutGroup: string | null;
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

function hasImportedQuote(block: DocumentBlock) {
  return block.structure?.content.content.some((node) => node.type.name === "blockquote");
}

function logicalBlocks(doc: Node, block: DocumentBlock, nextId: () => string) {
  const leaves: Leaf[] = [];
  let offset = 0;
  function add(node: Node, parentId: string | null, quoteGroup: string | null) {
    const id = leaves.length ? nextId() : block.id;
    const to = offset + visibleText(node).length;
    leaves.push({ id, node, parentId, quoteGroup, calloutGroup: block.calloutGroup ?? null, from: offset, to, selected: true });
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

function restartPlacedList(leaf: Leaf, previous?: Leaf) {
  if (leaf.parentId || leaf.node.type.name !== "orderedList") return;
  const start = previous?.node.type === leaf.node.type ? Number(previous.node.attrs.start) + 1 : 1;
  leaf.node = leaf.node.type.create({ ...leaf.node.attrs, start, numberMode: null }, leaf.node.content);
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
  let previous: Leaf | undefined;
  let changed = false;
  for (const leaf of leaves) {
    if (!leaf.selected || protectedBranches.has(leaf.id) || (leaf.parentId && protectedBranches.has(leaf.parentId))) {
      // Propagate protection to siblings or descendants under the protected branch.
      if (leaf.parentId && protectedBranches.has(leaf.parentId)) protectedBranches.add(leaf.id);
      quote = null;
      previous = undefined;
      continue;
    }
    quote ??= nextId();
    leaf.quoteGroup = quote;
    restartPlacedList(leaf, previous);
    if (!leaf.parentId) previous = leaf;
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
  const structure = affected[0]?.structure;
  const quote = structure?.childCount === 1 ? structure.firstChild : null;
  const quoteWithMultipleBlocks = singleRow && quote?.type.name === "blockquote" && quote.childCount > 1;
  const wrapCallout = target.type === "callout" && !singleRow;
  if (!affected.length || (singleRow && (startOffset === endOffset || (target.type === "blockquote" && !quoteWithMultipleBlocks))) ||
    (!wrapCallout && !["paragraph", "heading", "orderedList", "bulletList", "blockquote"].includes(target.type)) ||
    (!wrapCallout && !quoteWithMultipleBlocks && !affected.some((block) => typeof block.parentId === "string" || hasNestedContent(block) ||
      (!singleRow && (hasImportedQuote(block) || (block.quoteGroup && (target.type === "blockquote" || target.type === "orderedList"))))))) return;

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
  // An input quote can contain several text blocks in one row. Only split it when the command changes its content.
  let changed = !quoteWithMultipleBlocks && leaves.length !== affected.length;
  if (wrapCallout) {
    const selected = leaves.filter((leaf) => leaf.selected);
    const first = selected[0]?.calloutGroup;
    if (first && selected.every((leaf) => leaf.calloutGroup === first)) return { replacement: leaves, changed: false, mapPosition, splitRows: false, focusOffset: endOffset };
    const group = nextId();
    let previous: Leaf | undefined;
    for (const leaf of selected) {
      leaf.calloutGroup = group;
      restartPlacedList(leaf, previous?.quoteGroup === leaf.quoteGroup ? previous : undefined);
      if (!leaf.parentId) previous = leaf;
    }
    changed = true;
  } else if (target.type === "blockquote") {
    changed = editQuoteGroups(leaves, toggleSameType, nextId);
  } else {
    const selected = leaves.filter((leaf) => leaf.selected);
    const sameHeading = target.type === "heading" && toggleSameType && selected.every(({ node }) =>
      node.type.name === "heading" && node.attrs.level === target.level);
    const hasOrderedList = selected.some(({ node }) => node.type.name === "orderedList");
    let preceding: Node | undefined;
    let precedingLeaf: Leaf | undefined;
    for (const leaf of leaves) {
      const previous = leaf.node;
      if (precedingLeaf?.quoteGroup !== leaf.quoteGroup || precedingLeaf?.parentId !== leaf.parentId) preceding = undefined;
      if (leaf.selected) {
        const schema = previous.type.schema;
        if (target.type === "orderedList" && previous.type.name === "heading" && previous.attrs.numberStart !== null) {
          preceding = previous;
          precedingLeaf = leaf;
          continue;
        }
        const numberHeading = target.type === "heading" && hasOrderedList && isList(previous) &&
          (previous.type.name === "orderedList" || leaf.parentId !== null);
        const command = numberHeading ? { ...target, numberStart: target.numberStart ?? 0 } : target;
        leaf.node = convertBlock(schema.topNodeType.create(null, previous), command, { preceding, toggleSameType: sameHeading })[0];
      } else if (target.type === "heading" && previous.type.name === "orderedList" &&
        precedingLeaf?.selected && precedingLeaf.node.type.name === "heading") {
        leaf.node = previous.type.create({ ...previous.attrs, start: 1, numberMode: null }, previous.content);
      }
      changed ||= !previous.eq(leaf.node);
      preceding = leaf.node;
      precedingLeaf = leaf;
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
