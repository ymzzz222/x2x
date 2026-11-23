import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode, type RefObject } from "react";
import type { VirtualItem } from "@tanstack/react-virtual";
import type { ActiveBlockHandle } from "../editing/active-block-editor";
import { BlockHandles } from "../editing/document-block-tools";
import type { useDocumentBlocks } from "../editing/use-document-blocks";
import type { DocumentBlock, DocumentMatch } from "../model/document-model";
import type { DocumentSection } from "../model/document-outline";
import type { DocumentSession } from "../model/document-session";
import { resolveDocumentPosition } from "../collaboration/model/comment-anchor";
import { collaboratorColor, type OnlineCollaborator } from "../collaboration/model/protocol";
import styles from "../editor.module.css";
import collaborationStyles from "../collaboration/components/shared-document.module.css";
import { PreviewText } from "./document-preview-text";

type RowProps = {
  item: VirtualItem;
  block: DocumentBlock;
  documentIndex: number;
  tools: ReturnType<typeof useDocumentBlocks>;
  editable: boolean;
  onClick: (event: MouseEvent<HTMLDivElement>) => void;
  measure: (element: HTMLDivElement | null) => void;
  section?: DocumentSection;
  collapsed: boolean;
  onToggle: (section: DocumentSection) => void;
  selection: [number, number] | null;
  matches?: readonly DocumentMatch[];
  currentMatch?: DocumentMatch;
  showEmptyHint: boolean;
  session: DocumentSession;
  peers?: readonly OnlineCollaborator[];
  activeEditor?: RefObject<ActiveBlockHandle | null>;
  children?: ReactNode;
};

export function DocumentRow({ item, block, documentIndex, tools, editable, onClick, measure, section, collapsed, onToggle,
  selection, matches, currentMatch, showEmptyHint, session, peers, activeEditor, children }: RowProps) {
  const cursors = useMemo(() => peers?.filter((peer) => peer.cursor?.blockId === block.id), [block.id, peers]);
  const fold = section && section.end > section.index + 1 ? section : undefined;
  const showHandles = editable && !tools.textSelected;
  return <div id={block.id} data-index={item.index} data-block-index={documentIndex}
    data-row-heading={block.kind === "heading" ? block.level ?? 1 : undefined}
    data-block-selected={tools.selected(documentIndex) || undefined}
    ref={measure}
    onMouseDown={(event) => { if (event.shiftKey && !(event.target as Element).closest(".tiptap")) event.preventDefault(); }}
    onClick={onClick} className={styles.row} style={{ transform: "translateY(" + item.start + "px)" }}>
    {(showHandles || fold) && <div className={styles.rowControls}>
      {showHandles && <BlockHandles tools={tools} block={block} index={documentIndex} />}
      {fold && <button type="button" className={styles.fold + " " + styles.rowFold}
        aria-label={(fold.text || "未命名标题") + " 章节"} aria-expanded={!collapsed}
        onClick={(event) => { event.stopPropagation(); onToggle(fold); }} />}
    </div>}
    {children || <div className={styles.preview}>
      {showEmptyHint && <span className={styles.emptyParagraphHint} aria-hidden="true">输入正文…</span>}
      <PreviewText block={block} selection={selection} matches={matches} current={currentMatch} />
    </div>}
    {cursors?.length ? <CollaboratorCursors block={block} session={session} peers={cursors} activeEditor={activeEditor} /> : null}
  </div>;
}

type Marker = { id: string; name: string; left: number; top: number; height: number };

function previewCoordinates(row: HTMLElement, offset: number, cache: WeakMap<HTMLElement, Text[]>) {
  const leaves = [...row.querySelectorAll<HTMLElement>("[data-block-text]")];
  const leaf = leaves.findLast((element) => Number(element.dataset.textOffset ?? 0) <= offset);
  if (!leaf) return null;
  let nodes = cache.get(leaf);
  if (!nodes) {
    const walker = row.ownerDocument.createTreeWalker(leaf, NodeFilter.SHOW_TEXT);
    nodes = [];
    for (let node = walker.nextNode(); node; node = walker.nextNode()) nodes.push(node as Text);
    cache.set(leaf, nodes);
  }
  let remaining = offset - Number(leaf.dataset.textOffset ?? 0);
  const range = row.ownerDocument.createRange();
  for (const [index, text] of nodes.entries()) {
    if (remaining <= text.length || index === nodes.length - 1) {
      range.setStart(text, Math.min(remaining, text.length));
      range.collapse(true);
      const rect = range.getBoundingClientRect();
      return rect.height ? rect : leaf.getBoundingClientRect();
    }
    remaining -= text.length;
  }
  return leaf.getBoundingClientRect();
}

function CollaboratorCursors({ block, session, peers, activeEditor }: {
  block: DocumentBlock;
  session: DocumentSession;
  peers: OnlineCollaborator[];
  activeEditor?: RefObject<ActiveBlockHandle | null>;
}) {
  const layer = useRef<HTMLSpanElement>(null);
  const [markers, setMarkers] = useState<Marker[]>([]);

  useLayoutEffect(() => {
    const overlay = layer.current;
    const row = overlay?.parentElement;
    if (!overlay || !row) return;
    let cache = new WeakMap<HTMLElement, Text[]>();
    let frame = 0;
    function measure() {
      frame = 0;
      const box = row!.getBoundingClientRect();
      const next = peers.flatMap((peer) => {
        if (!peer.cursor) return [];
        try {
          const position = resolveDocumentPosition(session, peer.cursor);
          if (!position || position.blockId !== block.id) return [];
          const rect = activeEditor?.current?.coordsAt(position.offset) ?? previewCoordinates(row!, position.offset, cache);
          return !rect || rect.bottom <= rect.top ? [] : [{
            id: peer.id, name: peer.name,
            left: rect.left - box.left, top: rect.top - box.top, height: rect.bottom - rect.top,
          }];
        } catch {
          return [];
        }
      });
      setMarkers((previous) => JSON.stringify(previous) === JSON.stringify(next) ? previous : next);
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(measure);
    }
    const resize = new ResizeObserver(schedule);
    resize.observe(row);
    const mutation = new MutationObserver((records) => {
      if (!records.some(({ target }) => !overlay.contains(target))) return;
      cache = new WeakMap();
      schedule();
    });
    mutation.observe(row, { childList: true, characterData: true, subtree: true });
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutation.disconnect();
    };
  }, [activeEditor, block, peers, session]);

  return <span ref={layer} aria-hidden="true" className={collaborationStyles.cursorLayer}>
    {markers.map((marker) => <span key={marker.id} className={collaborationStyles.cursor}
        data-collaborator-cursor={marker.id} data-collaborator-name={marker.name}
        style={{ left: marker.left, top: marker.top, height: marker.height, "--collaborator-color": collaboratorColor(marker.id) } as CSSProperties} />)}
  </span>;
}
