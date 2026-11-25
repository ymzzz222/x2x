import { useEffect, useEffectEvent, type KeyboardEvent } from "react";
import type { ActiveBlockHandle } from "./active-block-editor";
import { plainTextContent, type RangeEdit } from "../model/document-clipboard";
import { selectDocument, type DocumentBlock, type DocumentPosition, type DocumentSelection, type getSelectionRange } from "../model/document-model";

type Options = {
  windowed: boolean;
  editable: boolean;
  blocks: readonly DocumentBlock[];
  activeId: string | null;
  activeIndex?: number;
  selection: DocumentSelection | null;
  selectionRange: ReturnType<typeof getSelectionRange>;
  hasSelection: boolean;
  blockIndexes: ReadonlyMap<string, number>;
  firstVisibleIndex: number;
  viewport: { current: HTMLDivElement | null };
  readEditor: () => ActiveBlockHandle | null;
  isComposing: () => boolean;
  blockShortcut: (event: KeyboardEvent<HTMLDivElement>) => boolean;
  formatShortcut: (event: KeyboardEvent<HTMLDivElement>) => boolean;
  selectRange: (selection: DocumentSelection) => void;
  changeHistory: (redo: boolean) => void;
  resetBlockTools: () => void;
  activate: (position: DocumentPosition, scrollIntoView?: boolean, columnX?: number) => void;
  replaceRange: (range: DocumentSelection, operation: RangeEdit) => void;
  jumpTo: (index: number) => void;
};

export function useNativeHistory(viewport: Options["viewport"], windowed: boolean, editable: boolean,
  isComposing: Options["isComposing"], changeHistory: Options["changeHistory"]) {
  const handleHistory = useEffectEvent((event: InputEvent) => {
    const redo = event.inputType === "historyRedo";
    if ((!redo && event.inputType !== "historyUndo") || !editable || !event.cancelable ||
      event.isComposing || isComposing() || !(event.target instanceof Element) ||
      !event.target.closest(".tiptap")) return;
    event.preventDefault();
    changeHistory(redo);
  });

  useEffect(() => {
    const body = viewport.current;
    if (!windowed || !body) return;
    const onBeforeInput = (event: InputEvent) => handleHistory(event);
    body.addEventListener("beforeinput", onBeforeInput, true);
    return () => body.removeEventListener("beforeinput", onBeforeInput, true);
  }, [viewport, windowed]);
}

export function documentKey(event: KeyboardEvent<HTMLDivElement>, {
  windowed, editable, blocks, activeId, activeIndex, selection, selectionRange, hasSelection, blockIndexes, firstVisibleIndex,
  viewport, readEditor, isComposing, blockShortcut, formatShortcut, selectRange, changeHistory, resetBlockTools, activate, replaceRange, jumpTo,
}: Options) {
  if (!windowed || event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229 || isComposing()) return;
  const modifier = event.metaKey || event.ctrlKey;
  const key = event.key.toLowerCase();
  const button = (event.target as HTMLElement).closest("button");
  if (button && !(button.hasAttribute("data-document-fold") && modifier && key === "z")) return;
  if (modifier && key === "a") {
    resetBlockTools();
    if (!(activeId && readEditor()?.selectParagraph())) selectRange(selectDocument(blocks));
  } else if (!editable) {
    // WebKit can use Backspace to navigate away from a focused read-only body.
    if (key !== "backspace" && (key !== "escape" || !blockShortcut(event))) return;
  } else if (modifier && key === "z") {
    changeHistory(event.shiftKey);
  } else if (blockShortcut(event) || formatShortcut(event)) {
    // The shared format command handles selections outside the active editor.
  } else if (modifier || event.altKey) {
    return;
  } else if (activeId && activeIndex !== undefined) {
    const editor = readEditor();
    const caret = editor?.selection();
    if (!caret) return;
    const current = blocks[activeIndex];
    const following = blocks[activeIndex + 1];
    const anchor = { blockId: activeId, offset: caret.anchor };
    const focus = { blockId: activeId, offset: caret.focus };
    if (current.structure && (key === "backspace" || key === "enter")) return;
    if (key === "backspace" && !event.shiftKey && !caret.anchor && !caret.focus && activeIndex > 0) {
      const previous = blocks[activeIndex - 1];
      replaceRange({ anchor: { blockId: previous.id, offset: previous.text.length }, focus }, "delete");
    } else if (key === "delete" && !event.shiftKey && caret.anchor === caret.focus && caret.focus === current.text.length &&
      current.kind === "paragraph" && !current.structure && following?.kind === "paragraph" && !following.structure &&
      current.quoteGroup === following.quoteGroup && current.parentId === following.parentId) {
      replaceRange({ anchor, focus: { blockId: following.id, offset: 0 } }, "delete");
    } else if (key === "enter" && !event.shiftKey) {
      replaceRange({ anchor, focus }, "split");
    } else if (key === "arrowleft" || key === "arrowright" || key === "arrowup" || key === "arrowdown") {
      if (caret.anchor !== caret.focus && !event.shiftKey) return;
      const direction = key === "arrowleft" ? "left" : key === "arrowright" ? "right" : key === "arrowup" ? "up" : "down";
      const edge = editor?.edge(direction);
      const backward = direction === "left" || direction === "up";
      const neighbor = blocks[activeIndex + (backward ? -1 : 1)];
      if (!edge || !neighbor) return;
      const next = { blockId: neighbor.id, offset: backward ? neighbor.text.length : 0 };
      if (event.shiftKey) selectRange({ anchor, focus: next });
      else activate(next, true, edge.columnX);
    } else {
      return;
    }
  } else if (selection && hasSelection && (key === "delete" || key === "backspace" || key === "enter")) {
    replaceRange(selection, key === "enter" ? "split" : "delete");
  } else if (selection && hasSelection && !event.shiftKey && (key === "arrowleft" || key === "arrowright")) {
    const bounds = selectionRange!;
    const index = key === "arrowleft" ? bounds.startIndex : bounds.endIndex;
    const offset = key === "arrowleft" ? bounds.startOffset : bounds.endOffset;
    jumpTo(index);
    activate({ blockId: blocks[index].id, offset });
  } else if (selection && hasSelection && [...event.key].length === 1) {
    replaceRange(selection, plainTextContent(event.key));
  } else if (event.target === viewport.current && key === "enter") {
    const position = selection?.focus ?? { blockId: blocks[firstVisibleIndex].id, offset: 0 };
    const index = blockIndexes.get(position.blockId);
    if (index !== undefined) jumpTo(index);
    activate(position);
  } else {
    return;
  }
  event.preventDefault();
  event.stopPropagation();
}
