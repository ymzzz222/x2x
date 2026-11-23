import { useCallback, useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent, type PointerEvent, type RefObject } from "react";
import type { ActiveBlockHandle } from "./active-block-editor";
import { writeWholeBlocks } from "../model/document-clipboard";
import { getSelectionRange, headingLevels, isBlankParagraph, type DocumentBlock, type DocumentPosition, type DocumentSelection, type HeadingLevel } from "../model/document-model";
import type { DocumentSection } from "../model/document-outline";
import type { DocumentSession } from "../model/document-session";
import { blockTypes, enclosingList, isList, markdownBlock, type BlockKind, type ListCommand, type ListKey } from "../model/document-structure";

type Entry = "pointer" | "keyboard" | "preview";
type Anchor = {
  id: string;
  mode: "block" | "insert" | "type";
  target: HTMLElement;
  entry: Entry;
  caret?: NonNullable<ReturnType<ActiveBlockHandle["selection"]>>;
};
type Bounds = { start: number; end: number };
type Drop = { index: number; x: number; y: number; width: number };
type Drag = { pointer: number; handle: HTMLElement; id: string; originalX: number; originalY: number; y: number; moved: boolean; frame: number; drop?: Drop };

type Options = {
  blocks: readonly DocumentBlock[];
  session: DocumentSession;
  outline: ReadonlyMap<string, DocumentSection>;
  folded: ReadonlySet<string>;
  viewport: RefObject<HTMLDivElement | null>;
  activeId: string | null;
  readCaret: ActiveBlockHandle["selection"];
  selection: DocumentSelection | null;
  editable: boolean;
  isComposing: () => boolean;
  select: (selection: DocumentSelection) => void;
  activate: (position: DocumentPosition, scroll?: boolean) => void;
  focusBlock: (position: DocumentPosition) => void;
  status: (message: string) => void;
};

function position(id: string, offset = 0) {
  return { blockId: id, offset };
}

export function useDocumentBlocks(options: Options) {
  const { blocks, session, outline, folded, viewport, activeId, readCaret, selection, editable, isComposing, select, activate, focusBlock, status } = options;
  const [panel, setPanel] = useState<Anchor | null>(null);
  const [blockSelection, setBlockSelection] = useState<{ first: string; last: string } | null>(null);
  const [dismissedSlash, setDismissedSlash] = useState("");
  const [historyPausedSlash, setHistoryPausedSlash] = useState(false);
  const [dismissedSelection, setDismissedSelection] = useState<DocumentSelection | null>(null);
  const [highlighted, setHighlighted] = useState({ token: "", index: 0 });
  const [drop, setDrop] = useState<Drop | null>(null);
  const drag = useRef<Drag | null>(null);
  const swallowClick = useRef(false);

  const current = blocks.find((block) => block.id === activeId);
  const query = editable && current?.kind === "paragraph" && !current.structure ? /^\/([^\n/]{0,35})$/.exec(current.text) : null;
  const token = query ? activeId + ":" + query[1] : "";
  const slash = !!query && token !== dismissedSlash && !panel && !historyPausedSlash && !isComposing();
  const entries = slash ? blockTypes.filter(({ label, search, kind }) => (kind.level ?? 0) <= 3 &&
    (label + " " + search).toLowerCase().includes(query[1].trim().toLowerCase())) : [];
  const textSelected = Boolean(!blockSelection && selection &&
    (selection.anchor.blockId !== selection.focus.blockId || selection.anchor.offset !== selection.focus.offset));
  const selectionDismissed = Boolean(selection && dismissedSelection && (["anchor", "focus"] as const).every((end) =>
    selection[end].blockId === dismissedSelection[end].blockId && selection[end].offset === dismissedSelection[end].offset));
  const showFloating = textSelected && !selectionDismissed && !slash;
  const highlight = highlighted.token === token ? highlighted.index : 0;
  const activePanel = editable ? panel : null;

  function blockBounds(id: string): Bounds | undefined {
    const start = blocks.findIndex((entry) => entry.id === id);
    if (start < 0) return;
    return { start, end: folded.has(id) ? outline.get(id)?.end ?? start + 1 : start + 1 };
  }

  function bounds(id: string): Bounds | undefined {
    const current = blockBounds(id);
    if (!current || !blockSelection || !selection) return current;
    const first = blockBounds(blockSelection.first);
    const last = blockBounds(blockSelection.last);
    if (!first || !last) return current;
    const start = Math.min(first.start, last.start);
    const end = Math.max(first.end, last.end);
    return current.start >= start && current.start < end ? { start, end } : current;
  }

  function rangeOf({ start, end }: Bounds) {
    return { anchor: position(blocks[start].id), focus: position(blocks[end - 1].id, blocks[end - 1].text.length) };
  }

  function selectBlock(id: string, extend: boolean) {
    const own = blockBounds(id);
    if (!own) return;
    const first = extend && blockSelection ? blockBounds(blockSelection.first) : undefined;
    setPanel(null);
    setBlockSelection({ first: first ? blockSelection!.first : id, last: id });
    select(rangeOf({ start: Math.min(own.start, first?.start ?? own.start), end: Math.max(own.end, first?.end ?? own.end) }));
  }

  function reset() {
    setPanel(null);
    setBlockSelection(null);
    setDismissedSelection(null);
    if (token) setDismissedSlash(token);
  }

  function startInput() {
    setHistoryPausedSlash(false);
    setDismissedSlash("");
  }

  function closeForHistory() {
    reset();
    setHistoryPausedSlash(true);
  }

  function open(id: string, mode: Anchor["mode"], target: HTMLElement, entry: Entry = "pointer") {
    if (!editable || isComposing()) return;
    const caret = id === activeId ? readCaret() ?? undefined : undefined;
    setPanel((current) => {
      if (current?.id !== id || current.mode !== mode || current.target !== target) return { id, mode, target, caret, entry };
      if (entry === "preview") return current;
      return current.entry === "preview" ? { ...current, entry } : null;
    });
  }

  const closePanel = useCallback(() => setPanel(null), []);

  function dismissFloating() { setDismissedSelection(selection); }

  function applyType(kind: BlockKind, source = activePanel, insertBelow = false) {
    if (!editable || isComposing()) return;
    const id = slash ? activeId : source?.id ?? selection?.focus.blockId ?? activeId;
    if (!id) return;
    const index = blocks.findIndex((block) => block.id === id);
    if (index < 0) return;
    const caret = source?.caret ?? (activeId === id ? readCaret() ?? undefined : undefined);
    const location = position(id, slash ? 0 : caret?.focus);
    const selected = selection && getSelectionRange(blocks, selection);
    const range = !slash && (!source || source.mode === "type") && selected ? selection! : { anchor: location, focus: location };
    const inserting = insertBelow || source?.mode === "insert";
    const blank = isBlankParagraph(blocks[index]);
    if (!slash && !inserting && caret && range.anchor.blockId === range.focus.blockId &&
      session.convertListType(position(id, caret.focus), kind, caret.headPos)) {
      reset();
      activate(position(id, caret.focus), true);
      return;
    }
    const result = session.editBlockType(range, kind, {
      insertAt: insertBelow || (inserting && !blank) ? blockBounds(id)?.end : undefined,
      stripPrefix: slash ? current?.text.length : undefined,
    });
    reset();
    if (result) activate(result.position, true);
    else if (source?.entry === "keyboard") source.target.focus({ preventScroll: true });
  }

  function remove(target: Bounds) {
    const result = session.removeBlocks(target.start, target.end);
    reset();
    if (result) {
      focusBlock(result.position);
      status("已删除所选内容块");
    }
  }

  function move(target: Bounds, index: number) {
    const source = outline.get(blocks[target.start].id);
    if (source && target.end >= source.end) {
      for (const section of outline.values()) {
        if (section.level <= source.level && section.index < index && index < section.end) {
          index = index > target.end ? section.end : section.index;
          break;
        }
      }
    }
    const result = session.moveBlocks(target.start, target.end, index);
    if (!result) return;
    reset();
    focusBlock(result.position);
    status("已移动所选内容块");
  }

  async function copy(id: string, cut: boolean) {
    const target = bounds(id);
    if (!target) return;
    const data = new DataTransfer();
    writeWholeBlocks(data, blocks.slice(target.start, target.end), session.contentFor);
    try {
      if (navigator.clipboard.write && typeof ClipboardItem !== "undefined") {
        const plain = new Blob([data.getData("text/plain")], { type: "text/plain" });
        const html = new Blob([data.getData("text/html")], { type: "text/html" });
        await navigator.clipboard.write([new ClipboardItem({ "text/plain": plain, "text/html": html })]);
      } else await navigator.clipboard.writeText(data.getData("text/plain"));
      if (cut && session.getBlocks() === blocks) remove(target);
      else status(cut ? "内容块已更改，已复制原内容" : "已复制内容块");
      if (!cut && activePanel?.entry === "keyboard") activePanel.target.focus({ preventScroll: true });
      closePanel();
    } catch {
      status("无法写入剪贴板");
    }
  }

  function clipboard(event: ClipboardEvent) {
    if (!event.clipboardData || (event.type === "cut" && !editable)) return false;
    if (activeId || !blockSelection || !selection || (event.type !== "copy" && event.type !== "cut")) return false;
    const target = bounds(blockSelection.first);
    if (!target) return false;
    event.preventDefault();
    event.stopPropagation();
    writeWholeBlocks(event.clipboardData, blocks.slice(target.start, target.end), session.contentFor);
    if (event.type === "cut" && editable) remove(target);
    else status("已复制内容块");
    return true;
  }

  function updateList(id: string, command: ListCommand) {
    const caret = activePanel?.caret ?? (id === activeId ? readCaret() ?? undefined : undefined);
    if (session.setListOptions(position(id, caret?.focus), command, caret?.headPos)) {
      reset();
      activate(position(id, caret?.focus), true);
    }
  }

  function keydown(event: KeyboardEvent) {
    if (isComposing()) return false;
    const blockEntry = activePanel?.entry === "pointer" && activePanel.mode !== "type" ? activePanel.mode : null;
    if (event.key === "Escape") {
      if (blockEntry) return false;
      if (slash) setDismissedSlash(token);
      else if (showFloating) {
        closePanel();
        dismissFloating();
      } else if (activePanel) closePanel();
      else return false;
      return true;
    }
    if (!editable) return false;
    if (blockEntry && event.key === "Tab") {
      if (blockEntry === "insert") closePanel();
      return true;
    }
    if (selectionDismissed && event.key.startsWith("Arrow")) setDismissedSelection(null);
    if (slash && entries.length && ["ArrowDown", "ArrowUp", "Enter"].includes(event.key)) {
      if (event.key === "Enter") applyType(entries[highlight % entries.length].kind);
      else setHighlighted({ token, index: (highlight + (event.key === "ArrowDown" ? 1 : -1) + entries.length) % entries.length });
      return true;
    }
    const caret = readCaret();
    const key = event.key;
    const modifier = event.metaKey || event.ctrlKey;
    if (activePanel && !modifier && !event.altKey && key.length === 1) closePanel();
    if (modifier && event.altKey && /^(?:Digit|Numpad)[0-9]$/.test(event.code)) {
      const level = Number(event.code.at(-1));
      if (!selection && !activeId) return false;
      applyType(level && headingLevels.includes(level as HeadingLevel) ? { type: "heading", level: level as HeadingLevel } : { type: "paragraph" },
        activePanel);
      return true;
    }
    if (modifier && event.shiftKey && (event.code === "Digit7" || event.code === "Digit8") && (selection || activeId)) {
      applyType({ type: event.code === "Digit7" ? "orderedList" : "bulletList" }, activePanel);
      return true;
    }
    if (modifier && key === "Enter" && caret && activeId && current?.structure) {
      const result = session.listEdit(position(activeId, caret.focus), "AppendParagraph", caret.anchorPos, caret.headPos);
      if (result) { activate(result.position, true); return true; }
    }
    if (modifier || event.altKey) return false;
    if (!caret || !activeId) {
      if (blockSelection && (key === "Backspace" || key === "Delete")) {
        const target = bounds(blockSelection.first);
        if (target) { remove(target); return true; }
      }
      return false;
    }
    if (key === " " && current && !current.structure && caret.anchor === caret.focus) {
      const prefix = current.text.slice(0, caret.focus);
      const kind = markdownBlock(prefix);
      if (kind) {
        const result = session.editBlockType({ anchor: position(activeId), focus: position(activeId) }, kind, { stripPrefix: prefix.length });
        if (result) { reset(); activate(result.position, true); return true; }
      }
    }
    if (current?.structure && ["Enter", "Backspace", "Tab"].includes(key) && (!event.shiftKey || key === "Tab")) {
      const result = session.listEdit(position(activeId, caret.focus), (event.shiftKey ? "Shift+Tab" : key) as ListKey, caret.anchorPos, caret.headPos);
      if (result) { activate(result.position, true); return true; }
    }
    return false;
  }

  function readDrop(y: number): Drop | undefined {
    const scroll = viewport.current;
    if (!scroll) return;
    const viewportRect = scroll.getBoundingClientRect();
    const rows = [...scroll.querySelectorAll<HTMLElement>("[data-block-index]")]
      .map((row) => ({ row, rect: row.getBoundingClientRect() }))
      .filter(({ rect }) => rect.bottom > viewportRect.top && rect.top < viewportRect.bottom);
    const next = rows.find(({ rect }) => y < (rect.top + rect.bottom) / 2);
    const target = next ?? rows.at(-1);
    if (!target) return;
    const index = Number(target.row.dataset.blockIndex);
    const boundary = next ? index : blockBounds(target.row.id)?.end ?? index + 1;
    return { index: boundary, x: target.rect.left, y: next ? target.rect.top : target.rect.bottom, width: target.rect.width };
  }

  function cancelDrag() {
    const active = drag.current;
    if (!active) return;
    drag.current = null;
    cancelAnimationFrame(active.frame);
    if (active.handle.hasPointerCapture(active.pointer)) active.handle.releasePointerCapture(active.pointer);
    setDrop(null);
  }

  useEffect(() => {
    function cancel(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape" && drag.current?.moved) {
        event.stopPropagation();
        cancelDrag();
        status("已取消移动");
      }
    }
    document.addEventListener("keydown", cancel, true);
    return () => document.removeEventListener("keydown", cancel, true);
  }, [status]);

  useEffect(() => () => { if (drag.current) cancelAnimationFrame(drag.current.frame); }, []);

  function pointerDown(id: string, event: PointerEvent<HTMLButtonElement>) {
    if (!editable || isComposing() || !event.isPrimary || event.button !== 0 || !viewport.current) return;
    swallowClick.current = false;
    drag.current = {
      pointer: event.pointerId, handle: viewport.current, id, originalX: event.clientX,
      originalY: event.clientY, y: event.clientY, moved: false, frame: 0,
    };
  }

  function pointerMove(event: PointerEvent<HTMLDivElement>) {
    const active = drag.current;
    if (!active || active.pointer !== event.pointerId) return;
    active.y = event.clientY;
    if (active.moved || Math.hypot(event.clientX - active.originalX, event.clientY - active.originalY) < 5) return;
    active.moved = true;
    swallowClick.current = true;
    active.handle.setPointerCapture(active.pointer);
    setPanel(null);

    function frame() {
      if (!active || drag.current !== active) return;
      const scroll = viewport.current;
      const rectangle = scroll?.getBoundingClientRect();
      if (!scroll || !rectangle) return;
      const delta = active.y < rectangle.top + 24
        ? active.y - rectangle.top - 24 : Math.max(0, active.y - rectangle.bottom + 24);
      if (delta) scroll.scrollTop += Math.sign(delta) * Math.min(42, Math.ceil(Math.abs(delta) / 3));
      active.drop = readDrop(active.y);
      const source = bounds(active.id);
      const drop = active.drop;
      setDrop(drop && source && (drop.index < source.start || drop.index > source.end) ? drop : null);
      active.frame = requestAnimationFrame(frame);
    }
    frame();
  }

  function pointerEnd(event: PointerEvent<HTMLDivElement>) {
    const active = drag.current;
    if (!active || active.pointer !== event.pointerId) return;
    const target = bounds(active.id);
    const destination = event.type === "pointerup" && active.moved ? readDrop(event.clientY) : undefined;
    cancelDrag();
    if (target && destination) move(target, destination.index);
  }

  function consumeDragClick() {
    const consumed = swallowClick.current;
    swallowClick.current = false;
    return consumed;
  }

  const chosen = blockSelection && selection ? bounds(blockSelection.first) : undefined;
  const source = activePanel && blocks.find((block) => block.id === activePanel.id);
  const currentType = source && activePanel?.mode !== "insert" &&
    (activePanel?.mode !== "type" || selection?.anchor.blockId === selection?.focus.blockId)
    ? { type: source.structure?.firstChild?.type.name ?? source.kind, level: source.level } : null;

  return {
    selected: (index: number) => chosen && index >= chosen.start && index < chosen.end,
    panel: activePanel, slash, entries, highlight, activeId, drop, keydown, clipboard, reset, open, applyType, bounds, copy,
    textSelected, showFloating, dismissFloating, closePanel, closeForHistory, startInput, selectBlock,
    currentType,
    remove, move, updateList, pointerDown, pointerMove, pointerEnd, consumeDragClick, current,
    listed: (id: string) => {
      const doc = blocks.find((block) => block.id === id)?.structure;
      const node = doc && enclosingList(doc, activePanel?.caret?.headPos ?? 0)?.list;
      return node && isList(node) ? node.type.name : null;
    },
  };
}
