import { useEffect, useRef, type MouseEvent, type PointerEvent } from "react";
import type { DocumentPosition, DocumentSelection, getSelectionRange } from "../model/document-model";

function offsetFromDOM(container: HTMLElement, node: Node, offset: number) {
  const range = document.createRange();
  range.selectNodeContents(container);
  range.setEnd(node, offset);
  return range.toString().length + Number(container.dataset.textOffset ?? 0);
}

export function positionFromPoint(row: HTMLElement, x: number, y: number): DocumentPosition {
  const caret = document.caretPositionFromPoint?.(x, y);
  const fallback = caret ? null : document.caretRangeFromPoint?.(x, y);
  const node = caret?.offsetNode ?? fallback?.startContainer;
  const caretOffset = caret?.offset ?? fallback?.startOffset;
  const leaf = node?.parentElement?.closest<HTMLElement>("[data-text-offset]");
  const container = leaf && row.contains(leaf) ? leaf : row.querySelector<HTMLElement>("[data-block-text], .tiptap");
  if (!container) return { blockId: row.id, offset: 0 };
  const rect = container.getBoundingClientRect();
  let offset = 0;
  if (node && caretOffset !== undefined && container.contains(node)) {
    return { blockId: row.id, offset: offsetFromDOM(container, node, caretOffset) };
  } else if (y >= rect.bottom || (y > rect.top && x >= rect.right)) {
    offset = container.textContent?.length ?? 0;
  }
  return { blockId: row.id, offset: offset + Number(container.dataset.textOffset ?? 0) };
}

export function selectedRowRange(range: ReturnType<typeof getSelectionRange>, index: number, length: number): [number, number] | null {
  if (!range || index < range.startIndex || index > range.endIndex) return null;
  return [index === range.startIndex ? range.startOffset : 0, index === range.endIndex ? range.endOffset : length];
}

type Drag = {
  viewport: HTMLDivElement;
  pointerId: number;
  anchor: DocumentPosition;
  startX: number;
  startY: number;
  x: number;
  y: number;
  nativeEditor: boolean;
  active: boolean;
  frame: number;
  focus?: DocumentPosition;
};

export function useDocumentSelection(
  selectRange: (selection: DocumentSelection) => void,
  isComposing: () => boolean,
) {
  const drag = useRef<Drag | null>(null);
  const swallowClick = useRef(false);

  useEffect(() => () => {
    if (drag.current) cancelAnimationFrame(drag.current.frame);
  }, []);

  function update(dragging: Drag, scroll = true) {
    const { viewport, x, y, anchor } = dragging;
    const rect = viewport.getBoundingClientRect();
    const distance = y < rect.top + 24 ? y - (rect.top + 24) : Math.max(0, y - (rect.bottom - 24));
    if (scroll && distance) {
      viewport.scrollTop += Math.sign(distance) * Math.min(36, Math.ceil(Math.abs(distance) / 3));
    }

    const rowY = Math.max(rect.top + 1, Math.min(y, rect.bottom - 1));
    const column = viewport.querySelector("[data-block-index]")?.getBoundingClientRect();
    if (column) {
      const rowX = Math.max(column.left + 1, Math.min(x, column.right - 1));
      const row = document.elementFromPoint(rowX, rowY)?.closest<HTMLElement>("[data-block-index]");
      if (row && viewport.contains(row)) {
        const focus = positionFromPoint(row, rowX, rowY);
        if (focus.blockId !== dragging.focus?.blockId || focus.offset !== dragging.focus.offset) {
          dragging.focus = focus;
          selectRange({ anchor, focus });
        }
      }
    }
    dragging.frame = requestAnimationFrame(() => update(dragging));
  }

  return {
    onPointerDown(event: PointerEvent<HTMLDivElement>) {
      swallowClick.current = false;
      if (!event.isPrimary || event.button !== 0 || event.pointerType !== "mouse" || event.shiftKey || isComposing()) return;
      const target = event.target as Element;
      if (target.closest("button")) return;
      const row = target.closest<HTMLElement>("[data-block-index]");
      if (!row) return;
      const { clientX: x, clientY: y } = event;
      drag.current = {
        viewport: event.currentTarget,
        pointerId: event.pointerId,
        anchor: positionFromPoint(row, x, y),
        startX: x,
        startY: y,
        x, y,
        nativeEditor: Boolean(target.closest(".tiptap")),
        active: false,
        frame: 0,
      };
    },
    onPointerMove(event: PointerEvent<HTMLDivElement>) {
      const current = drag.current;
      if (!current || current.pointerId !== event.pointerId) return;
      current.x = event.clientX;
      current.y = event.clientY;
      if (current.active) {
        event.preventDefault();
        return;
      }
      if (Math.hypot(current.x - current.startX, current.y - current.startY) < 4) return;
      const row = (event.target as Element).closest<HTMLElement>("[data-block-index]");
      const bounds = current.viewport.getBoundingClientRect();
      if (current.nativeEditor && row?.id === current.anchor.blockId &&
        current.y >= bounds.top + 24 && current.y <= bounds.bottom - 24) return;
      event.preventDefault();
      current.active = true;
      swallowClick.current = true;
      current.viewport.setPointerCapture(event.pointerId);
      document.getSelection()?.removeAllRanges();
      update(current);
    },
    onPointerUp: finish,
    onPointerCancel: finish,
    onLostPointerCapture: finish,
    onDoubleClick(event: MouseEvent<HTMLDivElement>) {
      const native = document.getSelection();
      const leaf = (event.target as Element).closest<HTMLElement>("[data-block-text]");
      const row = leaf?.closest<HTMLElement>("[data-block-index]");
      if (!row || !leaf || !native?.anchorNode || !native.focusNode || native.isCollapsed ||
        !leaf.contains(native.anchorNode) || !leaf.contains(native.focusNode) || isComposing()) return;
      selectRange({
        anchor: { blockId: row.id, offset: offsetFromDOM(leaf, native.anchorNode, native.anchorOffset) },
        focus: { blockId: row.id, offset: offsetFromDOM(leaf, native.focusNode, native.focusOffset) },
      });
    },
    onClickCapture(event: MouseEvent<HTMLDivElement>) {
      if (!swallowClick.current) return;
      swallowClick.current = false;
      event.preventDefault();
      event.stopPropagation();
    },
  };

  function finish(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    cancelAnimationFrame(current.frame);
    if (current.active && event.type === "pointerup") {
      current.x = event.clientX;
      current.y = event.clientY;
      update(current, false);
      cancelAnimationFrame(current.frame);
    }
    drag.current = null;
    if (current.viewport.hasPointerCapture(event.pointerId)) current.viewport.releasePointerCapture(event.pointerId);
  }
}
