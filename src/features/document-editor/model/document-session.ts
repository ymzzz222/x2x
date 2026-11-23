import { prosemirrorToYXmlFragment, ySyncPluginKey, yXmlFragmentToProseMirrorRootNode } from "@tiptap/y-tiptap";
import { Fragment, type Node } from "@tiptap/pm/model";
import { Transform } from "@tiptap/pm/transform";
import * as Y from "yjs";
import { planRangeEdit, type RangeEdit } from "./document-clipboard";
import { documentSchema, positionAtOffset, sampleContent } from "./document-editor-schema";
import type { FormatMark, MarkValue } from "./document-format";
import { getSelectionRange, type DocumentBlock, type DocumentMatch, type DocumentPosition, type DocumentSelection } from "./document-model";
import { currentAlignment, selectedParagraphs, type ParagraphCommand, type ParagraphLayout } from "./document-paragraph";
import { projectBlock, readBlock, replaceInlineText, type TextSpan } from "./document-projection";
import { changeListType, convertBlock, isList, listSettings, listTransaction, listWindows, listWindowSize, visibleText, type BlockKind, type ListCommand, type ListKey } from "./document-structure";

type ParagraphElement = Y.XmlElement<ParagraphLayout>;
type BlockKey = Pick<DocumentBlock, "id" | "kind" | "level">;
type Location = { position: DocumentPosition; editing: boolean; selection?: DocumentSelection; restoreActiveSelection?: boolean };

const structuralEdit = Symbol("Edit document structure");
const incomingUpdate = Symbol("Apply shared document update");

export function getParagraphFragment(doc: Y.Doc, id: string) {
  return doc.getMap<Y.XmlFragment>("paragraphs").get(id);
}

function writeBlock(fragment: Y.XmlFragment, block: DocumentBlock) {
  const element = new Y.XmlElement(block.kind);
  if (block.kind === "heading") {
    // The XML type supports numeric attributes, but the default declaration only lists strings.
    (element as unknown as Y.XmlElement<{ level: number }>).setAttribute("level", block.level ?? 1);
  }
  if (block.layout?.textAlign) element.setAttribute("textAlign", block.layout.textAlign);
  if (block.layout?.firstLineIndent && block.kind === "paragraph") {
    (element as ParagraphElement).setAttribute("firstLineIndent", true);
  }
  if (block.text) {
    const text = new Y.XmlText();
    element.insert(0, [text]);
    text.insert(0, block.text);
  }
  fragment.delete(0, fragment.length);
  fragment.insert(0, [element]);
}

export class DocumentSession {
  private listeners = new Set<() => void>();
  private doc = new Y.Doc();
  private order = this.doc.getArray<BlockKey>("order");
  private paragraphs = this.doc.getMap<Y.XmlFragment>("paragraphs");
  private fragmentIds = new WeakMap<object, string>();
  private manager?: Y.UndoManager;
  private location?: Location;
  private pendingCaret?: Map<unknown, unknown>;
  private inserted = 0;
  constructor(private blocks: DocumentBlock[], private shared = false) {}
  static fromUpdates(updates: readonly Uint8Array[]) {
    const session = new DocumentSession([], true);
    session.prepare();
    session.applySharedUpdates(updates);
    return session;
  }

  encodeSnapshot() {
    this.prepare();
    return Y.encodeStateAsUpdate(this.doc);
  }

  onLocalUpdate(handle: (update: Uint8Array) => void) {
    function listen(update: Uint8Array, origin: unknown) {
      if (origin !== incomingUpdate) handle(update);
    }
    this.doc.on("update", listen);
    return () => this.doc.off("update", listen);
  }

  applySharedUpdates(updates: readonly Uint8Array[]) {
    this.doc.transact(() => {
      for (const update of updates) Y.applyUpdate(this.doc, update, incomingUpdate);
      // Concurrent moves may insert the same stable block at two positions.
      const seen = new Set<string>();
      const duplicates: number[] = [];
      this.order.toArray().forEach(({ id }, index) => {
        if (seen.has(id) || !this.paragraphs.has(id)) duplicates.push(index);
        else seen.add(id);
      });
      for (const index of duplicates.reverse()) this.order.delete(index);
    }, incomingUpdate);
  }
  getBlocks = () => this.blocks;

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };

  prepare() {
    if (this.manager) return;
    this.doc.transact(() => {
      this.order.insert(0, this.blocks.map(({ id, kind, level }) => level ? { id, kind, level } : { id, kind }));
      for (const block of this.blocks) {
        const fragment = new Y.XmlFragment();
        this.paragraphs.set(block.id, fragment);
        this.fragmentIds.set(fragment, block.id);
        if (block.structure) prosemirrorToYXmlFragment(block.structure, fragment);
        else writeBlock(fragment, block);
      }
    });
    const manager = new Y.UndoManager([this.order, this.paragraphs], {
      trackedOrigins: new Set([ySyncPluginKey, structuralEdit]),
    });
    this.manager = manager;
    manager.on("stack-item-added", ({ stackItem, origin }) => {
      if (origin === structuralEdit || origin === ySyncPluginKey) {
        stackItem.meta.set("before", this.location);
        stackItem.meta.set("after", this.location);
        if (origin === ySyncPluginKey) this.pendingCaret = stackItem.meta;
      }
    });
    manager.on("stack-item-updated", ({ stackItem, origin }) => {
      if (origin === ySyncPluginKey) this.pendingCaret = stackItem.meta;
    });
    this.doc.on("afterTransaction", this.updateBlocks);
  }

  fragmentFor(id: string) {
    return this.paragraphs.get(id);
  }

  setLocation(location: Location) {
    this.location = location;
    this.pendingCaret?.set("after", location);
    this.pendingCaret = undefined;
  }

  endTyping() {
    this.manager?.stopCapturing();
    this.pendingCaret = undefined;
  }

  contentFor = (block: DocumentBlock) => {
    const fragment = this.fragmentFor(block.id);
    return block.structure ?? (fragment ? yXmlFragmentToProseMirrorRootNode(fragment, documentSchema()) : sampleContent(block));
  };

  replaceRange(range: DocumentSelection, operation: RangeEdit, { editing, clipboard }: { editing: boolean; clipboard?: boolean }) {
    const bounds = getSelectionRange(this.blocks, range);
    if (!bounds) return;
    const { startIndex, endIndex, startOffset, endOffset } = bounds;
    const first = this.blocks[startIndex];
    const last = this.blocks[endIndex];
    const firstContent = this.contentFor(first);
    const lastContent = first === last ? firstContent : this.contentFor(last);
    const { nodes, caret, offset } = planRangeEdit(firstContent, lastContent, startOffset, endOffset, operation);
    const replacement = nodes.map((node, index) => ({ id: index === 0 ? first.id : this.nextBlockId(), node }));
    const destination = { blockId: replacement[caret].id, offset };
    const start = { blockId: first.id, offset: startOffset };
    const selected = startIndex !== endIndex || startOffset !== endOffset;
    const before = {
      position: editing ? range.focus : start,
      editing,
      selection: clipboard && selected ? range : undefined,
    };
    const after = { position: destination, editing: editing || operation !== "delete" || clipboard === true };
    this.splice(startIndex, endIndex - startIndex + 1, replacement, before, after);
    return after;
  }

  private splice(index: number, count: number, replacement: { id: string; node: Node }[], before: Location, after: Location) {
    this.prepare();
    const schema = documentSchema();
    const order: BlockKey[] = replacement.map(({ id, node }) => node.type === schema.nodes.heading
      ? { id, kind: "heading", level: node.attrs.level }
      : { id, kind: "paragraph" });
    const previous = this.blocks[index];
    const structureChanged = count !== 1 || replacement.length !== 1 ||
      previous.kind !== order[0].kind || previous.level !== order[0].level;
    this.edit(before, after, () => {
      const kept = new Set(replacement.map(({ id }) => id));
      for (const block of this.blocks.slice(index, index + count)) {
        if (!kept.has(block.id)) this.paragraphs.delete(block.id);
      }
      for (const { id, node } of replacement) {
        let fragment = this.paragraphs.get(id);
        if (!fragment) {
          fragment = new Y.XmlFragment();
          this.paragraphs.set(id, fragment);
          this.fragmentIds.set(fragment, id);
        }
        prosemirrorToYXmlFragment(schema.topNodeType.create(null, node), fragment);
      }
      if (structureChanged) {
        this.order.delete(index, count);
        this.order.insert(index, order);
      }
      if (replacement.some(({ node }) => isList(node)) || previous?.structure || count > 1) this.refreshOrderedLists();
    });
  }

  editBlockType(range: DocumentSelection, target: BlockKind, { insertAt, stripPrefix = 0 }: {
    insertAt?: number;
    stripPrefix?: number;
  } = {}) {
    const bounds = getSelectionRange(this.blocks, range);
    if (!bounds) return;
    const { startIndex, endIndex, endOffset } = bounds;
    const schema = documentSchema();
    const before = { position: range.focus, editing: range.anchor.blockId === range.focus.blockId, selection: range, restoreActiveSelection: true };
    const last = endIndex > startIndex && !endOffset ? endIndex - 1 : endIndex;
    const index = insertAt ?? startIndex;
    const affected = insertAt === undefined ? this.blocks.slice(index, last + 1) : [];
    const blank = schema.topNodeType.createAndFill()!;
    let preceding = this.blocks[index - 1]?.structure?.lastChild;
    const replacement: { id: string; node: Node }[] = [];
    let changed = !affected.length;

    for (const block of affected.length ? affected : [null]) {
      const doc = block ? this.contentFor(block) : blank;
      const resume = target.type === "orderedList" && target.start === undefined && doc.firstChild?.type.name !== "orderedList"
        ? { ...target, resumeNumbering: true, start: preceding?.type.name === "orderedList" ? Number(preceding.attrs.start) + preceding.childCount : 1 }
        : target;
      const nodes = convertBlock(doc, resume, stripPrefix);
      if (nodes.length !== doc.childCount || nodes.some((node, i) => !node.eq(doc.child(i)))) changed = true;
      nodes.forEach((node, i) => replacement.push({ id: i === 0 && block ? block.id : this.nextBlockId(), node }));
      preceding = nodes.at(-1) ?? undefined;
    }
    if (!changed) return;
    const destination = replacement.find(({ id }) => id === range.focus.blockId) ?? replacement.at(-1)!;
    const fromRule = target.type === "horizontalRule";
    const chosen = fromRule ? replacement.at(-1)! : destination;
    const offset = fromRule || insertAt !== undefined || stripPrefix ? 0 : Math.min(range.focus.offset, visibleText(chosen.node).length);
    const after = { position: { blockId: chosen.id, offset }, editing: true };
    this.splice(index, affected.length, replacement, before, after);
    return after;
  }

  private nextBlockId() {
    return "inserted-" + (this.shared ? crypto.randomUUID() : ++this.inserted);
  }

  listEdit(position: DocumentPosition, key: ListKey, anchor: number, head: number) {
    const index = this.blocks.findIndex((block) => block.id === position.blockId);
    const block = this.blocks[index];
    if (!block?.structure) return;
    const doc = this.contentFor(block);
    const transaction = listTransaction(doc, anchor, head, key);
    const before = { position, editing: true };
    if (transaction?.docChanged) {
      const resolved = transaction.selection.$head;
      const nodes = transaction.doc.content.content;
      const nodeIndex = Math.min(resolved.index(0), nodes.length - 1);
      const root = nodes[nodeIndex];
      const start = resolved.depth >= 1 ? resolved.before(1) : resolved.pos;
      const windowIndex = isList(root) ? Math.floor(resolved.index(1) / listWindowSize) : 0;
      const previous = windowIndex ? root.copy(Fragment.fromArray(root.content.content.slice(0, windowIndex * listWindowSize))) : null;
      const offset = Math.max(0, visibleText(transaction.doc, start, resolved.pos).length - (previous ? visibleText(previous).length + 1 : 0));
      const replacement = nodes.flatMap(listWindows).map((node, i) => ({ id: i === 0 ? block.id : this.nextBlockId(), node }));
      const target = replacement[nodes.slice(0, nodeIndex).flatMap(listWindows).length + windowIndex];
      const after = { position: { blockId: target.id, offset }, editing: true };
      this.splice(index, 1, replacement, before, after);
      return after;
    }

    const current = doc.firstChild;
    const previous = this.blocks[index - 1];
    const parent = previous?.structure?.firstChild;
    if (key !== "Tab" || position.offset !== 0 || !current || !parent || !isList(parent) || !isList(current)) return;
    const child = current.firstChild;
    const container = parent.lastChild;
    if (!child || !container) return;
    const nested = current.copy(Fragment.from(child));
    const existing = container.content.content;
    const nestedItems = existing.at(-1);
    const children = nestedItems?.type === nested.type
      ? [...existing.slice(0, -1), nestedItems.copy(nestedItems.content.append(nested.content))]
      : [...existing, nested];
    const group = parent.type.create(parent.attrs, [...parent.content.content.slice(0, -1), container.type.create(container.attrs, children)]);
    const replacement = [{ id: previous.id, node: group }];
    if (current.childCount > 1) replacement.push({ id: block.id, node: current.type.create(current.attrs, current.content.content.slice(1)) });
    const after = { position: { blockId: previous.id, offset: previous.text.length + 1 }, editing: true };
    this.splice(index - 1, 2, replacement, before, after);
    return after;
  }

  convertListType(position: DocumentPosition, target: BlockKind, head: number) {
    const block = this.blocks.find(({ id }) => id === position.blockId);
    if (!block?.structure) return false;
    const doc = block.structure;
    const next = changeListType(doc, head, target);
    if (next.eq(doc)) return false;
    this.prepare();
    const location = { position, editing: true };
    this.edit(location, location, () => {
      prosemirrorToYXmlFragment(next, this.paragraphs.get(block.id)!);
      this.refreshOrderedLists();
    });
    return true;
  }

  private refreshOrderedLists() {
    let next = 1;
    for (const { id } of this.order.toArray()) {
      const root = this.paragraphs.get(id)?.get(0);
      if (!(root instanceof Y.XmlElement) || root.nodeName !== "orderedList") {
        next = 1;
        continue;
      }
      const list = root as Y.XmlElement<{ start: number; numberMode: string }>;
      const continuing = list.getAttribute("numberMode") === "continue";
      const start = Number(list.getAttribute("start")) || 1;
      if (continuing && start !== next) list.setAttribute("start", next);
      next = (continuing ? next : start) + list.length;
    }
  }

  setListOptions(position: DocumentPosition, command: ListCommand, nativeHead?: number) {
    const index = this.blocks.findIndex((block) => block.id === position.blockId);
    const block = this.blocks[index];
    if (!block?.structure) return false;
    const doc = block.structure;
    const head = nativeHead ?? positionAtOffset(doc, position.offset);
    const next = listSettings(doc, head, command, this.blocks[index - 1]?.structure?.lastChild ?? undefined);
    if (next.eq(doc)) return false;
    this.prepare();
    const location = { position, editing: true };
    this.edit(location, location, () => {
      prosemirrorToYXmlFragment(next, this.paragraphs.get(block.id)!);
      this.refreshOrderedLists();
    });
    return true;
  }

  removeBlocks(from: number, to: number) {
    if (from < 0 || to > this.blocks.length || from >= to) return;
    const neighbor = this.blocks[to] ?? this.blocks[from - 1];
    const source = this.blocks[from];
    const before = { position: { blockId: source.id, offset: 0 }, editing: false };
    const after = { position: { blockId: neighbor?.id ?? source.id, offset: 0 }, editing: false };
    const replacement = neighbor ? [] : [{ id: source.id, node: documentSchema().nodes.paragraph.create() }];
    this.splice(from, to - from, replacement, before, after);
    return after;
  }

  moveBlocks(from: number, to: number, beforeIndex: number) {
    if (from < 0 || to > this.blocks.length || from >= to || beforeIndex < 0 || beforeIndex > this.blocks.length ||
      (from <= beforeIndex && beforeIndex <= to)) return;
    this.prepare();
    const moved = this.order.slice(from, to);
    const location = { position: { blockId: moved[0].id, offset: 0 }, editing: false };
    this.edit(location, location, () => {
      this.order.delete(from, to - from);
      this.order.insert(beforeIndex > to ? beforeIndex - moved.length : beforeIndex, moved);
      this.refreshOrderedLists();
    });
    return location;
  }

  formatRange(selection: DocumentSelection, name: FormatMark, value: MarkValue | null, editing: boolean) {
    const bounds = getSelectionRange(this.blocks, selection);
    if (!bounds) return false;
    const { startIndex, endIndex, startOffset, endOffset } = bounds;
    const type = documentSchema().marks[name];
    const mark = value === null ? null : type.create(
      name === "link" ? { href: value } : typeof value === "string" ? { color: value } : null,
    );
    const updates: { id: string; content: Node }[] = [];

    for (let index = startIndex; index <= endIndex; index++) {
      const block = this.blocks[index];
      const from = index === startIndex ? startOffset : 0;
      const to = index === endIndex ? endOffset : block.text.length;
      if (from >= to) continue;
      const content = this.contentFor(block);
      const start = positionAtOffset(content, from);
      const end = positionAtOffset(content, to);
      const transform = new Transform(content);
      if (mark) transform.addMark(start, end, mark);
      else transform.removeMark(start, end, type);
      if (transform.docChanged) updates.push({ id: block.id, content: transform.doc });
    }
    if (!updates.length) return false;

    this.prepare();
    const location = { position: selection.focus, selection, editing, restoreActiveSelection: true };
    this.edit(location, location, () => {
      for (const { id, content } of updates) prosemirrorToYXmlFragment(content, this.paragraphs.get(id)!);
    });
    return true;
  }

  formatParagraphs(selection: DocumentSelection, command: ParagraphCommand, editing: boolean) {
    const targets = selectedParagraphs(this.blocks, selection).filter((block) => "textAlign" in command
      ? command.textAlign !== currentAlignment(block)
      : block.kind === "paragraph" && command.firstLineIndent !== Boolean(block.layout?.firstLineIndent));
    if (!targets.length) return false;

    this.prepare();
    const location = { position: selection.focus, selection, editing, restoreActiveSelection: true };
    this.edit(location, location, () => {
      for (const block of targets) {
        const element = this.paragraphs.get(block.id)?.get(0);
        if (!(element instanceof Y.XmlElement) || element.nodeName !== block.kind) continue;
        const paragraph = element as ParagraphElement;
        if ("textAlign" in command) paragraph.setAttribute("textAlign", command.textAlign);
        else if (command.firstLineIndent) paragraph.setAttribute("firstLineIndent", true);
        else paragraph.removeAttribute("firstLineIndent");
      }
    });
    return true;
  }

  replaceMatches(matches: readonly DocumentMatch[], replacement: string) {
    if (!matches.length) return 0;
    this.prepare();
    const byBlock = new Map<string, { spans: TextSpan[]; matches: DocumentMatch[] }>();
    let count = 0;

    for (const match of matches) {
      const block = this.blocks[match.blockIndex];
      if (block?.id !== match.blockId || block.text.slice(match.from, match.to) !== match.text ||
        match.text === replacement || match.from >= match.to) continue;

      let group = byBlock.get(block.id);
      if (!group) {
        const spans: TextSpan[] = [];
        readBlock(this.paragraphs.get(block.id)!, spans);
        group = { spans, matches: [] };
        byBlock.set(block.id, group);
      }
      group.matches.push(match);
      count++;
    }
    if (!count) return 0;

    const first = byBlock.values().next().value!.matches[0];
    const location = { position: { blockId: first.blockId, offset: first.from }, editing: false };
    this.edit(location, location, () => {
      for (const { spans, matches: edits } of byBlock.values()) {
        edits.sort((a, b) => b.from - a.from);
        for (const match of edits) replaceInlineText(spans, match, replacement);
      }
    });
    return count;
  }

  private edit(before: Location, after: Location, apply: () => void) {
    this.endTyping();
    this.setLocation(before);
    const historyLength = this.manager?.undoStack.length ?? 0;
    this.doc.transact(apply, structuralEdit);
    if (this.manager && this.manager.undoStack.length > historyLength) {
      const meta = this.manager.undoStack.at(-1)!.meta;
      meta.set("before", before);
      meta.set("after", after);
    }
    this.endTyping();
  }

  undo(redo: boolean) {
    this.endTyping();
    const manager = this.manager;
    if (!manager) return;
    const entry = redo ? manager.redo() : manager.undo();
    if (!entry) return;
    const inverse = (redo ? manager.undoStack : manager.redoStack).at(-1);
    inverse?.meta.set("before", entry.meta.get("before"));
    inverse?.meta.set("after", entry.meta.get("after"));
    return entry.meta.get(redo ? "after" : "before") as Location | undefined;
  }

  destroy() {
    this.doc.off("afterTransaction", this.updateBlocks);
    this.manager?.destroy();
    this.doc.destroy();
  }

  private updateBlocks = (transaction: Y.Transaction) => {
    const changed = new Set<string>();
    for (const fragment of transaction.changedParentTypes.keys()) {
      const id = this.fragmentIds.get(fragment);
      if (id) changed.add(id);
    }
    if (transaction.changed.has(this.order) || [...transaction.changed.keys()].some((type) => Object.is(type, this.paragraphs))) {
      const previous = new Map(this.blocks.map((block) => [block.id, block]));
      this.blocks = this.order.toArray().map((key) => {
        const fragment = this.paragraphs.get(key.id)!;
        const before = this.fragmentIds.has(fragment) ? previous.get(key.id) : undefined;
        this.fragmentIds.set(fragment, key.id);
        return before && !changed.has(key.id)
          ? before
          : projectBlock(key.id, fragment);
      });
    } else if (changed.size) {
      this.blocks = this.blocks.map((block) => changed.has(block.id)
        ? projectBlock(block.id, this.paragraphs.get(block.id)!)
        : block);
    } else {
      return;
    }
    this.listeners.forEach((listener) => listener());
  };
}
