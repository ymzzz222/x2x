import type { DocumentBlock } from "./document-model";

export type DocumentSection = {
  id: string;
  text: string;
  level: NonNullable<DocumentBlock["level"]>;
  index: number;
  end: number;
  children: DocumentSection[];
};

export type DocumentFolds = { body: ReadonlySet<string>; outline: ReadonlySet<string> };

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
  const ancestors: DocumentSection[] = [];

  blocks.forEach((block, index) => {
    if (block.kind !== "heading") return;
    const level = block.level ?? 1;
    while (ancestors.length && ancestors[ancestors.length - 1].level >= level) {
      ancestors.pop()!.end = index;
    }
    const section = { id: block.id, text: block.text, level, index, end: blocks.length, children: [] };
    (ancestors.at(-1)?.children ?? roots).push(section);
    sections.set(block.id, section);
    ancestors.push(section);
  });

  return { roots, sections };
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
