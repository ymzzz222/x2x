import { prosemirrorToYXmlFragment, ySyncPluginKey, yXmlFragmentToProseMirrorRootNode } from "@tiptap/y-tiptap";
import { Fragment, type Node } from "@tiptap/pm/model";
import { Transform } from "@tiptap/pm/transform";
import * as Y from "yjs";
import { applyClipboardRelations, planRangeEdit, type RangeEdit } from "./document-clipboard";
import { documentSchema, positionAtOffset, sampleContent } from "./document-editor-schema";
import type { FormatMark, MarkValue } from "./document-format";
import { DocumentHistory, type DocumentLocation as Location } from "./document-history";
import { getSelectionRange, type DocumentBlock, type DocumentMatch, type DocumentPosition, type DocumentSelection } from "./document-model";
import { currentAlignment, selectedParagraphs, type ParagraphCommand, type ParagraphLayout } from "./document-paragraph";
import { calloutGroups, documentParents, headingNumbers, projectBlock, quoteGroups, readBlock, refreshOrderedListStarts, replaceInlineText, withHeadingNumber, writeBlockContent, writeInitialBlock, type TextSpan } from "./document-projection";
import { getDocumentHierarchy, indentationParent, mergedDescendantParents, preserveHeadingHierarchy } from "./document-outline";
import { convertMixedHierarchy } from "./document-mixed-conversion";
import { changeListType, convertBlocks, convertNestedText, isList, listSettings, listTransaction, listWindows, listWindowSize, visibleText, type BlockKind, type ListCommand, type ListKey } from "./document-structure";

type ParagraphElement = Y.XmlElement<ParagraphLayout>;
type BlockKey = Pick<DocumentBlock, "id" | "kind" | "level">;
type ReplacementBlock = { id: string; node: Node; quoteGroup?: string | null; calloutGroup?: string | null; parentId?: string | null };

const structuralEdit = Symbol("Edit document structure");
const incomingUpdate = Symbol("Apply shared document update");

export function getParagraphFragment(doc: Y.Doc, id: string) {
  return doc.getMap<Y.XmlFragment>("paragraphs").get(id);
}

export class DocumentSession {
  private listeners = new Set<() => void>();
  private doc = new Y.Doc();
  private order = this.doc.getArray<BlockKey>("order");
  private paragraphs = this.doc.getMap<Y.XmlFragment>("paragraphs");
  private headingNumbers = headingNumbers(this.doc);
  private quoteGroups = quoteGroups(this.doc);
  private calloutGroups = calloutGroups(this.doc);
  private parents = documentParents(this.doc);
  private fragmentIds = new WeakMap<object, string>();
  private history?: DocumentHistory;
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
    if (this.history) return;
    this.doc.transact(() => {
      this.order.insert(0, this.blocks.map(({ id, kind, level }) => level ? { id, kind, level } : { id, kind }));
      for (const block of this.blocks) {
        const fragment = new Y.XmlFragment();
        this.paragraphs.set(block.id, fragment);
        this.fragmentIds.set(fragment, block.id);
        writeInitialBlock(fragment, block);
        if (block.quoteGroup) this.quoteGroups.set(block.id, block.quoteGroup);
        if (block.calloutGroup) this.calloutGroups.set(block.id, block.calloutGroup);
        if (block.parentId !== undefined) this.parents.set(block.id, block.parentId);
      }
    });
    this.history = new DocumentHistory(new Y.UndoManager([this.order, this.paragraphs, this.headingNumbers, this.quoteGroups, this.calloutGroups, this.parents], {
      trackedOrigins: new Set([ySyncPluginKey, structuralEdit]),
    }), ySyncPluginKey);
    this.doc.on("afterTransaction", this.updateBlocks);
  }

  fragmentFor(id: string) {
    return this.paragraphs.get(id);
  }

  setLocation(location: Location) {
    this.history?.setLocation(location);
  }

  endTyping() {
    this.history?.endTyping();
  }

  fold(id: string, folded: boolean) {
    this.prepare();
    this.history!.fold(id, folded);
  }

  contentFor = (block: DocumentBlock) => {
    const fragment = this.fragmentFor(block.id);
    const content = block.structure ?? (fragment ? yXmlFragmentToProseMirrorRootNode(fragment, documentSchema()) : sampleContent(block));
    return block.numberStart === undefined ? content : withHeadingNumber(content, block.numberStart);
  };

  replaceRange(range: DocumentSelection, operation: RangeEdit, { editing, clipboard }: { editing: boolean; clipboard?: boolean }) {
    const bounds = getSelectionRange(this.blocks, range);
    if (!bounds) return;
    const { startIndex, endIndex, startOffset, endOffset } = bounds;
    const first = this.blocks[startIndex];
    const last = this.blocks[endIndex];
    if (operation === "split" && first === last && startOffset === 0 && endOffset === 0 &&
      !first.structure && (first.kind === "paragraph" || first.text.length > 0)) {
      const location = { position: range.focus, editing: true };
      this.splice(startIndex, 0, [{
        id: this.nextBlockId(), node: documentSchema().nodes.paragraph.create(), quoteGroup: first.quoteGroup,
        calloutGroup: first.calloutGroup, parentId: first.parentId,
      }], location, location);
      return location;
    }
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
      selection: selected && (clipboard || typeof operation !== "string") ? range : undefined,
    };
    const after = { position: destination, editing: editing || operation !== "delete" || clipboard === true };
    const relations = typeof operation === "object" ? operation.relations : undefined;
    const pasted = relations ? applyClipboardRelations(replacement, caret - relations.length + 1, relations, () => this.nextBlockId()) : replacement;
    const parents = operation === "delete" && startIndex < endIndex && endOffset === 0
      ? mergedDescendantParents(this.blocks, startIndex, endIndex, destination.blockId) : undefined;
    this.splice(startIndex, endIndex - startIndex + 1, pasted, before, after, parents);
    return after;
  }

  private splice(index: number, count: number, replacement: ReplacementBlock[],
    before: Location, after: Location, parentChanges?: ReadonlyMap<string, string | null>, historyGroup?: string) {
    this.prepare();
    const schema = documentSchema();
    const order: BlockKey[] = replacement.map(({ id, node }) => node.type === schema.nodes.heading
      ? { id, kind: "heading", level: node.attrs.level }
      : { id, kind: "paragraph" });
    const previous = this.blocks[index];
    const following = count > 0 && replacement.length > 0 &&
      this.blocks[index + count - 1]?.structure?.firstChild?.type.name === "orderedList" &&
      replacement.at(-1)?.node.type.name !== "orderedList" ? this.blocks[index + count]?.id : undefined;
    const structureChanged = count !== 1 || replacement.length !== 1 ||
      previous.kind !== order[0].kind || previous.level !== order[0].level;
    this.edit(before, after, () => {
      const kept = new Set(replacement.map(({ id }) => id));
      for (const block of this.blocks.slice(index, index + count)) {
        if (kept.has(block.id)) continue;
        this.paragraphs.delete(block.id);
        if (this.headingNumbers.has(block.id)) this.headingNumbers.delete(block.id);
        if (this.quoteGroups.has(block.id)) this.quoteGroups.delete(block.id);
        if (this.calloutGroups.has(block.id)) this.calloutGroups.delete(block.id);
        if (this.parents.has(block.id)) this.parents.delete(block.id);
      }
      for (const { id, node, quoteGroup, calloutGroup, parentId } of replacement) {
        let fragment = this.paragraphs.get(id);
        if (!fragment) {
          fragment = new Y.XmlFragment();
          this.paragraphs.set(id, fragment);
          this.fragmentIds.set(fragment, id);
          const group = quoteGroup === undefined && count ? previous?.quoteGroup : quoteGroup;
          if (group) this.quoteGroups.set(id, group);
          const callout = calloutGroup === undefined && count ? previous?.calloutGroup : calloutGroup;
          if (callout) this.calloutGroups.set(id, callout);
          const parent = parentId === undefined && count ? previous?.parentId : parentId;
          if (parent !== undefined) this.parents.set(id, parent);
        } else {
          if (parentId !== undefined && this.parents.get(id) !== parentId) this.parents.set(id, parentId);
          if (quoteGroup === null) this.quoteGroups.delete(id);
          else if (quoteGroup && this.quoteGroups.get(id) !== quoteGroup) this.quoteGroups.set(id, quoteGroup);
          if (calloutGroup === null) this.calloutGroups.delete(id);
          else if (calloutGroup && this.calloutGroups.get(id) !== calloutGroup) this.calloutGroups.set(id, calloutGroup);
        }
        writeBlockContent(id, fragment, schema.topNodeType.create(null, node));
      }
      if (parentChanges) for (const [id, parent] of parentChanges) this.parents.set(id, parent);
      if (structureChanged) {
        this.order.delete(index, count);
        this.order.insert(index, order);
      }
      if (replacement.some(({ node }) => isList(node)) || previous?.structure || count > 1) this.refreshOrderedLists(following);
    }, historyGroup);
  }

  editBlockType(range: DocumentSelection, target: BlockKind, { insertAt, stripPrefix = 0, toggleSameType = false, head, folded, headingShortcut }: {
    insertAt?: number;
    stripPrefix?: number;
    toggleSameType?: boolean;
    head?: number;
    folded?: ReadonlySet<string>;
    headingShortcut?: boolean;
  } = {}): Location | undefined {
    const bounds = getSelectionRange(this.blocks, range);
    if (!bounds) return;
    const { startIndex, endIndex, startOffset, endOffset } = bounds;
    const before: Location = { position: range.focus, editing: range.anchor.blockId === range.focus.blockId, selection: range, restoreActiveSelection: true };
    const last = endIndex > startIndex && !endOffset && !range.wholeBlocks ? endIndex - 1 : endIndex;
    const index = insertAt ?? startIndex;
    const affected = insertAt === undefined ? this.blocks.slice(index, last + 1) : [];
    const preserveRange = insertAt === undefined && !before.editing && target.type !== "horizontalRule";
    const wholeRows = affected.length > 0 && startOffset === 0 &&
      (endIndex > last || endOffset >= affected.at(-1)!.text.length) &&
      (startIndex !== endIndex || startOffset !== endOffset);
    const mixed = convertMixedHierarchy(affected, target, {
      content: this.contentFor, nextId: () => this.nextBlockId(), startOffset,
      endOffset: endIndex > last ? affected.at(-1)?.text.length ?? 0 : endOffset, wholeRows, toggleSameType,
    });
    const selectedText = toggleSameType && head !== undefined && startIndex === endIndex && startOffset !== endOffset
      && affected.length === 1 && !affected[0].structure;
    if (!mixed && affected.length === 1 && affected[0].structure && head !== undefined) {
      const block = affected[0];
      const content = this.contentFor(block);
      const nested = convertNestedText(content, head, target, stripPrefix, toggleSameType);
      if (nested && !nested.eq(content)) {
        const after = { position: { blockId: block.id, offset: Math.max(0, range.focus.offset - stripPrefix) }, editing: true };
        this.prepare();
        this.edit(before, after, () => {
          writeBlockContent(block.id, this.paragraphs.get(block.id)!, nested);
          this.refreshOrderedLists();
        });
        return after;
      }
    }
    if (!mixed && target.type === "blockquote" && (affected.length > 1 || selectedText || (toggleSameType && affected[0]?.quoteGroup))) {
      const group = affected[0].quoteGroup;
      const unwrap = toggleSameType && group && affected.every((block) => block.quoteGroup === group);
      const ids = affected.filter((block) => folded?.has(block.id)).map((block) => block.id);
      const after: Location = { ...before, selection: preserveRange || selectedText ? range : undefined,
        foldChange: ids.length && !unwrap ? { ids, folded: true } : undefined };
      if (after.foldChange) before.foldChange = { ids, folded: false };
      this.prepare();
      this.edit(before, after, () => {
        const next = unwrap ? undefined : this.nextBlockId();
        for (const block of affected) {
          if (next) this.quoteGroups.set(block.id, next);
          else this.quoteGroups.delete(block.id);
        }
      });
      return after;
    }
    const { replacement, changed, focusOffset, mapPosition, splitRows } = mixed ?? convertBlocks(affected, target, {
      content: this.contentFor, blank: documentSchema().topNodeType.createAndFill()!, nextId: () => this.nextBlockId(),
      preceding: this.blocks[index - 1]?.structure?.lastChild ?? undefined,
      single: before.editing && affected.length === 1, wholeRows, toggleSameType, stripPrefix, head, focusOffset: range.focus.offset,
    });
    if (!changed) return;
    const destination = replacement.find(({ id }) => id === range.focus.blockId) ?? replacement.at(-1)!;
    const fromRule = target.type === "horizontalRule";
    const chosen = fromRule ? replacement.at(-1)! : destination;
    const offset = fromRule || insertAt !== undefined || stripPrefix ? 0 : Math.min(focusOffset, visibleText(chosen.node).length);
    const after: Location = preserveRange || (startOffset !== endOffset && splitRows && !fromRule)
      ? { ...before, editing: false, position: mapPosition(range.focus),
        selection: { ...range, anchor: mapPosition(range.anchor), focus: mapPosition(range.focus) } }
      : { position: { blockId: chosen.id, offset }, editing: true };
    if (folded?.size) {
      const keptHeadings = new Set(replacement.filter(({ node }) => node.type.name === "heading").map(({ id }) => id));
      const opened = affected.filter(({ id }) => folded.has(id) && !keptHeadings.has(id)).map(({ id }) => id);
      if (opened.length) before.foldChange = after.foldChange = { ids: opened, folded: false };
    }
    const next = replacement[0]?.node;
    const parentChanges = affected.length === 1 && replacement.length === 1
      ? preserveHeadingHierarchy(this.blocks, index, next.type.name === "heading" ? next.attrs.level : undefined)
      : undefined;
    const historyGroup = headingShortcut && preserveRange && target.type === "heading" && !splitRows && !after.foldChange &&
      replacement.every(({ node }) => node.type.name === "heading")
      ? JSON.stringify(range) : undefined;
    this.splice(index, affected.length, replacement, before, after, parentChanges, historyGroup);
    return after;
  }

  private nextBlockId() {
    return "inserted-" + (this.shared ? crypto.randomUUID() : ++this.inserted);
  }

  indentBlock(position: DocumentPosition, lift: boolean, headingParentOnly = false, selection?: DocumentSelection) {
    const parent = indentationParent(this.blocks, position.blockId, lift, headingParentOnly);
    if (parent === undefined) return false;
    this.prepare();
    const location = { position, editing: true, selection, restoreActiveSelection: Boolean(selection) };
    this.edit(location, location, () => this.parents.set(position.blockId, parent));
    return true;
  }

  applyMarkdown(position: DocumentPosition, head: number, target: BlockKind) {
    const block = this.blocks.find(({ id }) => id === position.blockId);
    const fragment = this.paragraphs.get(position.blockId);
    if (!block || !fragment) return;
    const content = this.contentFor(block);
    const literal = new Transform(content).insert(head, content.type.schema.text(" ")).doc;
    this.doc.transact(() => prosemirrorToYXmlFragment(literal, fragment), ySyncPluginKey);
    const focus = { blockId: position.blockId, offset: position.offset + 1 };
    this.setLocation({ position: focus, editing: true });
    return this.editBlockType({ anchor: focus, focus }, target, { stripPrefix: focus.offset });
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

  private refreshOrderedLists(following?: string) {
    refreshOrderedListStarts(this.order.toArray(), this.paragraphs, this.quoteGroups, this.calloutGroups, following);
  }

  setListOptions(position: DocumentPosition, command: ListCommand, nativeHead?: number) {
    const index = this.blocks.findIndex((block) => block.id === position.blockId);
    const block = this.blocks[index];
    if (!block?.structure) return false;
    const doc = block.structure;
    const head = nativeHead ?? positionAtOffset(doc, position.offset);
    const previous = "start" in command && command.start === "continue"
      ? this.blocks.slice(0, index).findLast((candidate) => candidate.structure?.lastChild?.type.name === "orderedList")
      : undefined;
    const next = listSettings(doc, head, command, previous?.structure?.lastChild ?? undefined);
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
    const destination = beforeIndex > to ? beforeIndex - moved.length : beforeIndex;
    const remaining = this.blocks.slice(0, from).concat(this.blocks.slice(to));
    const reordered = remaining.slice(0, destination).concat(this.blocks.slice(from, to), remaining.slice(destination));
    const { parentChanges } = getDocumentHierarchy(reordered, getDocumentHierarchy(this.blocks).branches);
    const location = { position: { blockId: moved[0].id, offset: 0 }, editing: false };
    this.edit(location, location, () => {
      this.order.delete(from, to - from);
      this.order.insert(destination, moved);
      for (const [id, parent] of parentChanges) this.parents.set(id, parent);
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
      for (const { id, content } of updates) writeBlockContent(id, this.paragraphs.get(id)!, content);
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

  private edit(before: Location, after: Location, apply: () => void, group?: string) {
    this.history!.edit(before, after, () => this.doc.transact(apply, structuralEdit), group);
  }

  undo(redo: boolean) {
    return this.history?.undo(redo);
  }

  destroy() {
    this.doc.off("afterTransaction", this.updateBlocks);
    this.history?.destroy();
    this.doc.destroy();
  }

  private updateBlocks = (transaction: Y.Transaction) => {
    const changed = new Set<string>();
    let structureChanged = transaction.changed.has(this.order);
    for (const [type, keys] of transaction.changed) {
      if (Object.is(type, this.paragraphs)) structureChanged = true;
      if (Object.is(type, this.headingNumbers) || Object.is(type, this.quoteGroups) || Object.is(type, this.calloutGroups) || Object.is(type, this.parents)) {
        for (const id of keys) if (id !== null) changed.add(id);
      }
    }
    for (const fragment of transaction.changedParentTypes.keys()) {
      const id = this.fragmentIds.get(fragment);
      if (id) changed.add(id);
    }
    if (structureChanged) {
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
