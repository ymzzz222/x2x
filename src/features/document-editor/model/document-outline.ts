import type { DocumentBlock } from "./document-model";

export type DocumentSection = {
  id: string;
  text: string;
  level: NonNullable<DocumentBlock["level"]>;
  index: number;
  end: number;
  children: DocumentSection[];
  numbering?: { label: string; value: number; hasPrevious: boolean };
};

export type DocumentFolds = { body: ReadonlySet<string>; outline: ReadonlySet<string> };

export type DocumentBranch = {
  block: DocumentBlock;
  parentId: string | null;
  explicitParent: string | null;
  index: number;
  end: number;
  indent: number;
};

export function getDocumentHierarchy(blocks: readonly DocumentBlock[], preserved?: ReadonlyMap<string, DocumentBranch>) {
  const branches = new Map<string, DocumentBranch>();
  const parentChanges = new Map<string, string | null>();
  const ancestors: DocumentBranch[] = [];
  blocks.forEach((block, index) => {
    const implicit = ancestors.findLastIndex(({ block: ancestor }) => ancestor.kind === "heading" &&
      (block.kind !== "heading" || (ancestor.level ?? 1) < (block.level ?? 1)));
    const explicit = block.parentId === undefined
      ? implicit : ancestors.findLastIndex(({ block: ancestor }) => ancestor.id === block.parentId);
    const previous = preserved?.get(block.id);
    const usePrevious = previous && (ancestors[explicit]?.block.id ?? null) !== previous.parentId;
    const parentIndex = usePrevious
      ? ancestors.findLastIndex(({ block: ancestor }) => ancestor.id === previous.parentId) : explicit;
    const parent = ancestors[parentIndex];
    const parentId = parent?.block.id ?? null;
    if (usePrevious) parentChanges.set(block.id, parentId);
    while (ancestors.length > parentIndex + 1) ancestors.pop()!.end = index;
    const explicitParent = block.parentId === undefined && !usePrevious ? null : parentId;
    const branch = { block, index, end: blocks.length, parentId, explicitParent,
      indent: explicitParent ? (parent?.indent ?? 0) + 1 : 0 };
    branches.set(block.id, branch);
    ancestors.push(branch);
  });
  return { branches, parentChanges };
}

export function preserveHeadingHierarchy(blocks: readonly DocumentBlock[], index: number, level: DocumentBlock["level"]) {
  const heading = blocks[index];
  if (heading.kind !== "heading" || heading.level === level) return;

  const { branches } = getDocumentHierarchy(blocks);
  const original = branches.get(heading.id)!;
  // An implicitly rooted heading can join the preceding section when it changes level.
  if (level && heading.parentId === undefined && !original.parentId) branches.delete(heading.id);
  const updated = [...blocks];
  updated[index] = { ...heading, kind: level ? "heading" : "paragraph", level };
  const { parentChanges } = getDocumentHierarchy(updated, branches);
  if (!level) {
    for (const child of blocks.slice(index + 1, original.end)) {
      if (child.parentId === undefined) parentChanges.set(child.id, branches.get(child.id)!.parentId);
    }
  }
  return parentChanges;
}

export function indentationParent(blocks: readonly DocumentBlock[], id: string, lift: boolean, headingParentOnly = false) {
  const index = blocks.findIndex((block) => block.id === id);
  if (index < 1) return;
  const block = blocks[index];
  const previous = blocks[index - 1];
  if (lift) return block.parentId ? (getDocumentHierarchy(blocks).branches.get(block.parentId)?.parentId ?? null) : undefined;
  if ((!headingParentOnly || previous.kind === "heading") && block.parentId !== previous.id) return previous.id;
}

export function mergedDescendantParents(blocks: readonly DocumentBlock[], from: number, to: number, mergedId: string) {
  const { branches } = getDocumentHierarchy(blocks);
  const removed = new Set<string>();
  let end = to + 1;
  for (let index = from + 1; index <= to; index++) {
    const branch = branches.get(blocks[index].id)!;
    removed.add(branch.block.id);
    end = Math.max(end, branch.end);
  }
  const parents = new Map<string, string | null>();
  for (let index = to + 1; index < end; index++) {
    const branch = branches.get(blocks[index].id)!;
    if (branch.parentId && removed.has(branch.parentId)) parents.set(branch.block.id, mergedId);
  }
  return parents;
}

export function updateBodyFolds(current: DocumentFolds, body: ReadonlySet<string>): DocumentFolds {
  if (body === current.body) return current;
  const outline = new Set(current.outline);
  for (const id of current.body) {
    if (!body.has(id)) outline.delete(id);
  }
  for (const id of body) {
    if (!current.body.has(id)) outline.add(id);
  }
  return { body, outline };
}

export function toggleOutlineFold(current: DocumentFolds, id: string): DocumentFolds {
  const outline = new Set(current.outline);
  if (!outline.delete(id)) outline.add(id);
  return { ...current, outline };
}

export function getDocumentOutline(blocks: readonly DocumentBlock[]) {
  const roots: DocumentSection[] = [];
  const sections = new Map<string, DocumentSection>();
  const { branches } = getDocumentHierarchy(blocks);
  const lastNumbers = new Map<string | undefined, number>();

  blocks.forEach((block, index) => {
    if (block.kind !== "heading") return;
    const level = block.level ?? 1;
    const ancestors: DocumentSection[] = [];
    const branch = branches.get(block.id)!;
    for (let id = branch.parentId; id; id = branches.get(id)?.parentId ?? null) {
      const section = sections.get(id);
      if (section) ancestors.push(section);
    }
    const section: DocumentSection = { id: block.id, text: block.text, level, index, end: branch.end, children: [] };
    if (block.numberStart !== undefined) {
      const parent = ancestors.find((ancestor) => ancestor.numbering);
      const previous = lastNumbers.get(parent?.id);
      const value = block.numberStart || (previous ?? 0) + 1;
      lastNumbers.set(parent?.id, value);
      const prefix = parent?.numbering?.label.replace(/\.$/, "");
      section.numbering = { label: prefix ? `${prefix}.${value}` : `${value}.`, value, hasPrevious: previous !== undefined };
    }
    (ancestors[0]?.children ?? roots).push(section);
    sections.set(block.id, section);
  });

  return { roots, sections, branches };
}

export function projectDocumentRows(
  length: number,
  sections: ReadonlyMap<string, DocumentSection>,
  collapsed: ReadonlySet<string>,
) {
  const ends = new Map<number, number>();
  for (const id of collapsed) {
    const section = sections.get(id);
    if (section) ends.set(section.index, section.end);
  }

  const indexes: number[] = [];
  const positions = new Map<number, number>();
  for (let index = 0; index < length; index = ends.get(index) ?? index + 1) {
    positions.set(index, indexes.length);
    indexes.push(index);
  }
  return { indexes, positions };
}

export function revealDocumentRow(
  index: number,
  sections: ReadonlyMap<string, DocumentSection>,
  collapsed: ReadonlySet<string>,
) {
  let next: Set<string> | undefined;
  for (const id of collapsed) {
    const section = sections.get(id);
    if (section && section.index < index && index < section.end) {
      next ??= new Set(collapsed);
      next.delete(id);
    }
  }
  return next ?? collapsed;
}
