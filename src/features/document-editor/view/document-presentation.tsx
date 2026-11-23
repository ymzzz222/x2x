"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useEffect, useEffectEvent, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { PreviewText } from "./document-preview-text";
import type { DocumentBlock, SampleSize } from "../model/document-model";
import { getViewportAnchor } from "./document-view-controls";
import { DocumentAction, DocumentIcon } from "./document-header";
import headerStyles from "./document-header.module.css";
import presentationStyles from "./document-presentation.module.css";
import structureStyles from "./document-structure.module.css";
import styles from "../editor.module.css";

const modes = [
  { value: "continuous", label: "连续滚动" },
  { value: "pages", label: "分页" },
] as const;

type Mode = (typeof modes)[number]["value"];
type Bookmark = { blockId: string; withinRow: number; mode: Mode };

function readBookmark(key: string): Bookmark | null {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) ?? "null");
    if (typeof value?.blockId === "string" && Number.isFinite(value.withinRow) && value.withinRow >= 0 &&
      (value.mode === "continuous" || value.mode === "pages")) {
      return value;
    }
  } catch {
    // An unavailable or damaged bookmark must not prevent a new presentation.
  }
  return null;
}

export function DocumentPresentation({ blocks, size, documentKey, isComposing, comments }: {
  blocks: readonly DocumentBlock[];
  size?: SampleSize;
  documentKey?: string;
  comments?: ReactNode;
  isComposing: () => boolean;
}) {
  const scope = documentKey ?? size;
  const key = scope && "x2x:document-presentation:" + scope;
  const dialog = useRef<HTMLDialogElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const fullscreen = useRef(false);
  const [launch, setLaunch] = useState<{ bookmark: Bookmark | null } | null>(null);
  const [mode, setMode] = useState<Mode>("continuous");
  const [saved, setSaved] = useState<Bookmark | null>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  // eslint-disable-next-line react-hooks/incompatible-library -- Scroll position and row sizes are managed by the viewport.
  const virtualizer = useVirtualizer({
    enabled: launch !== null,
    count: blocks.length,
    getScrollElement: () => viewport.current,
    getItemKey: (index) => blocks[index].id,
    estimateSize: (index) => Math.max(50, 32 + Math.ceil(blocks[index].text.length / 35) * 28),
    overscan: 5,
  });

  function save() {
    const anchor = getViewportAnchor(viewport.current);
    if (!anchor) return;
    const bookmark = { blockId: anchor.blockId, withinRow: anchor.withinRow, mode };
    setSaved(bookmark);
    if (!key) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(bookmark));
    } catch {
      // The position can still be resumed while this page is open.
    }
  }

  function open(bookmark: Bookmark | null) {
    const element = dialog.current;
    if (!element || element.open || isComposing()) return;
    setMode(bookmark?.mode ?? "continuous");
    setLaunch({ bookmark });
    const root = document.documentElement;
    if (document.fullscreenEnabled && root.requestFullscreen && !document.fullscreenElement) {
      void root.requestFullscreen().then(() => {
        if (document.fullscreenElement !== root) return;
        if (element.open) fullscreen.current = true;
        else void document.exitFullscreen().catch(() => {});
      }).catch(() => {
        // The dialog can fill the browser viewport if fullscreen is denied.
      });
    }
    element.showModal();
  }

  function close() {
    save();
    dialog.current?.close();
  }

  function finish() {
    setLaunch(null);
    if (fullscreen.current && document.fullscreenElement === document.documentElement) {
      void document.exitFullscreen().catch(() => {});
    }
    fullscreen.current = false;
  }

  const handleFullscreenChange = useEffectEvent(() => {
    if (fullscreen.current && !document.fullscreenElement && dialog.current?.open) close();
  });
  const handlePageHide = useEffectEvent(() => {
    if (dialog.current?.open) save();
  });

  useEffect(() => {
    function fullscreenChanged() { handleFullscreenChange(); }
    function pageHidden() { handlePageHide(); }
    document.addEventListener("fullscreenchange", fullscreenChanged);
    window.addEventListener("pagehide", pageHidden);
    return () => {
      document.removeEventListener("fullscreenchange", fullscreenChanged);
      window.removeEventListener("pagehide", pageHidden);
    };
  }, []);

  const loadBookmark = useEffectEvent(() => { if (key) setSaved(readBookmark(key)); });
  useEffect(() => { loadBookmark(); }, [key]);

  const updateEdges = useCallback(() => {
    const element = viewport.current;
    if (!element) return;
    const start = element.scrollTop <= 1;
    const end = element.scrollTop + element.clientHeight >= element.scrollHeight - 1;
    setEdges((current) => current.start === start && current.end === end ? current : { start, end });
  }, []);

  useLayoutEffect(() => {
    if (!launch || !viewport.current || !track.current) return;
    const element = viewport.current;
    const observer = new ResizeObserver(updateEdges);
    observer.observe(element);
    observer.observe(track.current);
    element.focus({ preventScroll: true });

    const bookmark = launch.bookmark;
    const index = bookmark ? blocks.findIndex(({ id }) => id === bookmark.blockId) : -1;
    let frame = 0;
    if (bookmark && index >= 0) {
      virtualizer.scrollToIndex(index, { align: "start" });
      // Wait for the target row to mount before restoring a position inside it.
      function restore(attempts: number) {
        const row = element.querySelector<HTMLElement>('[data-index="' + index + '"]');
        if (row && bookmark) {
          const rect = row.getBoundingClientRect();
          const withinRow = Math.min(bookmark.withinRow, Math.max(0, rect.height - 2));
          virtualizer.scrollToOffset(element.scrollTop + rect.top - element.getBoundingClientRect().top + withinRow);
        } else if (attempts > 0) {
          frame = requestAnimationFrame(() => restore(attempts - 1));
        }
      }
      frame = requestAnimationFrame(() => restore(12));
    }

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [blocks, launch, updateEdges, virtualizer]);

  function turn(direction: -1 | 1) {
    const element = viewport.current;
    if (!element) return;
    // Leave enough overlap for a heading line at a page boundary.
    element.scrollTop += direction * Math.max(1, element.clientHeight - 44);
  }

  function handleKeys(event: KeyboardEvent<HTMLDialogElement>) {
    // The editor's global shortcuts belong to the underlying document view.
    event.stopPropagation();
    if (mode !== "pages" || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === "ArrowLeft" || event.key === "PageUp") {
      event.preventDefault();
      turn(-1);
    } else if (event.key === "ArrowRight" || event.key === "PageDown") {
      event.preventDefault();
      turn(1);
    }
  }

  return (
    <>
      <DocumentAction><button type="button" aria-haspopup="dialog" onClick={() => open(null)}>演示</button></DocumentAction>
      {saved && <DocumentAction><button type="button" aria-haspopup="dialog" onClick={() => open(saved)}>继续上次演示</button></DocumentAction>}
      <dialog ref={dialog} aria-label="文档演示" className={presentationStyles.presentation}
        onCancel={save} onClose={finish} onKeyDown={handleKeys}>
        {launch && (
          <>
            <header className={presentationStyles.toolbar}>
              <div className={styles.options} role="group" aria-label="演示方式">
                {modes.map(({ value, label }) => (
                  <button key={value} type="button" aria-pressed={mode === value} onClick={() => setMode(value)}>
                    {label}
                  </button>
                ))}
              </div>
              {mode === "pages" && (
                <div className={presentationStyles.pager} role="group" aria-label="演示翻页">
                  <button type="button" disabled={edges.start} onClick={() => turn(-1)}>上一页</button>
                  <button type="button" disabled={edges.end} onClick={() => turn(1)}>下一页</button>
                </div>
              )}
              {comments}
              <button type="button" className={presentationStyles.exit + " " + headerStyles.iconButton}
                aria-label="退出演示" title="退出演示" onClick={close}><DocumentIcon name="close" /></button>
            </header>
            <div ref={viewport} role="region" aria-label="演示正文" tabIndex={0}
              className={styles.viewport + " " + presentationStyles.viewport} data-layout={mode} data-presentation-viewport="" onScroll={updateEdges}>
              <div className={styles.paper + " " + presentationStyles.paper + " " + structureStyles.content}>
                <div ref={track} className={styles.window} style={{ height: virtualizer.getTotalSize() }}>
                  {virtualizer.getVirtualItems().map((item) => {
                    const block = blocks[item.index];
                    return (
                      <div key={item.key} data-index={item.index} data-block-index={item.index} data-block-id={block.id}
                        ref={virtualizer.measureElement} className={styles.row}
                        style={{ transform: "translateY(" + item.start + "px)" }}>
                        <div className={styles.preview}><PreviewText block={block} selection={null} /></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
