import Link from "next/link";
import { useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Virtualizer } from "@tanstack/react-virtual";
import { documentTextCounts, sampleSizes, type DocumentBlock, type DocumentSelection, type SampleSize } from "../model/document-model";
import styles from "../editor.module.css";
import { DocumentAction } from "./document-header";
import headerStyles from "./document-header.module.css";

import type { DocumentRole, OnlineCollaborator } from "../collaboration/model/protocol";
import type { DocumentSession } from "../model/document-session";

export type MeetingPosition = { blockId: string; withinRow: number };

export type SharedEditorSettings = {
  id: string;
  title: string;
  role: DocumentRole;
  session: DocumentSession;
  controls: ReactNode;
  avatars?: ReactNode;
  rename?: (title: string) => Promise<void>;
  documentActions?: ReactNode;
  collaborators?: readonly OnlineCollaborator[];
  onCursor?: (position: DocumentSelection["focus"] | null) => void;
  copyAllowed?: boolean;
  printAllowed?: boolean;
  watermark?: string;
  discussion?: (selection: DocumentSelection | null, locate: (range: DocumentSelection) => void, jump: (position: MeetingPosition) => void,
    onInsert: (position: DocumentSelection["focus"]) => void) => ReactNode;
  presentationComments?: ReactNode;
};

export type PaperWidth = "default" | "wide" | "full";

export type DocumentView = {
  mode: "edit" | "read";
  width: PaperWidth;
};

const pageModes = [
  { value: "edit", label: "编辑" },
  { value: "read", label: "阅读" },
] as const;

function DocumentTextMetrics({ blocks }: { blocks: readonly DocumentBlock[] }) {
  const counts = useMemo(() => documentTextCounts(blocks), [blocks]);
  return <p className={styles.metrics}>总字数 {counts.words.toLocaleString("zh-CN")} · 总字符数 {counts.characters.toLocaleString("zh-CN")}</p>;
}

export function DocumentInfoAction({ blocks }: { blocks: readonly DocumentBlock[] }) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);

  useLayoutEffect(() => {
    const button = trigger.current;
    const bubble = panel.current;
    if (!open || !button || !bubble) return;
    const native = typeof bubble.showPopover === "function";
    const anchored = native && CSS.supports("position-area: inline-end");
    if (anchored) return;

    function place() {
      const anchor = button!.getBoundingClientRect();
      const width = bubble!.offsetWidth;
      const height = bubble!.offsetHeight;
      const { clientWidth, clientHeight } = document.documentElement;
      const gap = 6;
      const edge = 8;
      const right = anchor.right + gap;
      const left = anchor.left - width - gap;
      const beside = right + width <= clientWidth - edge ? right : left >= edge ? left : null;
      const below = anchor.bottom + gap;
      const top = beside !== null ? anchor.top : below + height <= clientHeight - edge ? below : anchor.top - height - gap;
      bubble!.style.setProperty("--document-info-left", Math.max(edge, Math.min(beside ?? anchor.right - width, clientWidth - width - edge)) + "px");
      bubble!.style.setProperty("--document-info-top", Math.max(edge, Math.min(top, clientHeight - height - edge)) + "px");
    }

    function dismissOutside(event: Event) {
      if (event.target instanceof Node && !button!.contains(event.target) && !bubble!.contains(event.target)) setOpen(false);
    }

    place();
    window.addEventListener("resize", place);
    document.addEventListener("scroll", place, true);
    if (!native) {
      document.addEventListener("pointerdown", dismissOutside);
      document.addEventListener("focusin", dismissOutside);
    }
    return () => {
      window.removeEventListener("resize", place);
      document.removeEventListener("scroll", place, true);
      if (!native) {
        document.removeEventListener("pointerdown", dismissOutside);
        document.removeEventListener("focusin", dismissOutside);
      }
    };
  }, [open]);

  return <DocumentAction>
    <button type="button" ref={trigger} className={headerStyles.documentInfoTrigger}
      popoverTarget={id} aria-controls={id} aria-expanded={open}
      onClick={() => {
        if (typeof panel.current?.showPopover !== "function") setOpen(!open);
      }}
      onKeyDown={(event) => {
        if (event.key !== "Escape" || !open || typeof panel.current?.showPopover === "function") return;
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
      }}>
      文档信息<span aria-hidden="true">›</span>
    </button>
    <section id={id} ref={panel} popover="auto" aria-label="文档信息" className={headerStyles.documentInfoPanel}
      data-open={open} onToggle={(event) => setOpen(event.newState === "open")}>
      {open && <DocumentTextMetrics blocks={blocks} />}
    </section>
  </DocumentAction>;
}

function PreviewSettings({ blocks, mounted, showInfo = true, children }: {
  blocks: readonly DocumentBlock[];
  mounted?: number;
  showInfo?: boolean;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <details className={styles.previewSettings} onToggle={(event) => setOpen(event.currentTarget.open)} onKeyDown={(event) => {
      if (event.key !== "Escape" || !event.currentTarget.open) return;
      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.open = false;
      event.currentTarget.querySelector("summary")?.focus();
    }}>
      <summary onMouseDown={(event) => event.preventDefault()}>预览设置</summary>
      <div className={styles.previewSettingsPanel}>
        {showInfo && mounted !== undefined && <p className={styles.metrics}>{blocks.length.toLocaleString("zh-CN")} 段 · 挂载 {mounted} 段</p>}
        {open && showInfo && <DocumentTextMetrics blocks={blocks} />}
        {children}
      </div>
    </details>
  );
}

export function EditorPreviewControls({ blocks, mounted, showInfo, size, mode, onJump, simulate, canSimulate }: {
  blocks: readonly DocumentBlock[];
  mounted: number;
  showInfo: boolean;
  size?: SampleSize;
  mode: "window" | "full";
  onJump: (index: number) => void;
  simulate?: () => void;
  canSimulate: boolean;
}) {
  return <PreviewSettings blocks={blocks} mounted={mounted} showInfo={showInfo}>
    {size && <SampleControls size={size} mode={mode} />}
    <DocumentJump count={blocks.length} onJump={onJump} />
    {simulate && <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={simulate} disabled={!canSimulate}>
      模拟协作者编辑
    </button>}
  </PreviewSettings>;
}

export function DocumentJump({ count, onJump }: { count: number; onJump: (index: number) => void }) {
  return (
    <form className={styles.form} onSubmit={(event) => {
      event.preventDefault();
      const index = Number(new FormData(event.currentTarget).get("block")) - 1;
      if (Number.isInteger(index) && index >= 0 && index < count) {
        const disclosure = event.currentTarget.closest("details");
        if (disclosure) disclosure.open = false;
        onJump(index);
      }
    }}>
      <label className={styles.srOnly} htmlFor="block-number">段落编号</label>
      <input id="block-number" name="block" type="number" min="1" max={count} placeholder="段落编号" required />
      <button type="submit">跳转</button>
    </form>
  );
}

export function SampleControls({ size, mode }: { size: SampleSize; mode: "window" | "full" }) {
  function href(sample: SampleSize, display: "window" | "full") {
    return "/editor?size=" + sample + (display === "full" ? "&mode=full" : "");
  }

  return (
    <>
      <nav aria-label="挂载方式" className={styles.options}>
        <Link href={href(size, "window")} aria-current={mode === "window" ? "page" : undefined} prefetch={false}>
          窗口化
        </Link>
        <Link href={href(size, "full")} aria-current={mode === "full" ? "page" : undefined} prefetch={false}>
          整篇挂载
        </Link>
      </nav>
      <nav aria-label="样本字数" className={styles.options}>
        {sampleSizes.map((sample) => (
          <Link key={sample} href={href(sample, mode)} aria-current={size === sample ? "page" : undefined} prefetch={false}>
            {sample / 10000} 万字
          </Link>
        ))}
      </nav>
    </>
  );
}

export function DocumentViewControls({ view, onChange, canEdit = true }: {
  view: DocumentView; onChange: (view: DocumentView) => void; canEdit?: boolean;
}) {
  const id = useId();

  return (
    <>
      <div className={styles.options} role="group" aria-label="文档模式" data-document-mode="">
        {pageModes.map(({ value, label }) => (
          <button key={value} type="button" aria-pressed={view.mode === value} disabled={value === "edit" && !canEdit}
            onClick={() => onChange({ ...view, mode: value })}>
            {label}
          </button>
        ))}
      </div>
      <DocumentAction><div className={styles.paperWidth}>
        <label htmlFor={id}>页宽</label>
        <select id={id} value={view.width} onChange={(event) => onChange({ ...view, width: event.currentTarget.value as PaperWidth })}>
          <option value="default">默认</option>
          <option value="wide">较宽</option>
          <option value="full">全宽</option>
        </select>
      </div></DocumentAction>
    </>
  );
}

function widthStorageKey(size: SampleSize | string) {
  return "x2x:document-width:" + size;
}

export function readPaperWidth(size: SampleSize | string): PaperWidth {
  try {
    const width = window.localStorage.getItem(widthStorageKey(size));
    return width === "wide" || width === "full" ? width : "default";
  } catch {
    return "default";
  }
}

export function writePaperWidth(size: SampleSize | string, width: PaperWidth) {
  try {
    window.localStorage.setItem(widthStorageKey(size), width);
  } catch {
    // Changing the view still works when storage is disabled.
  }
}


export type ViewportAnchor = { blockId: string; withinRow?: number; remeasure?: boolean; keepMounted?: boolean };

export function getViewportAnchor(viewport: HTMLElement | null) {
  if (!viewport) return null;
  const { top, bottom } = viewport.getBoundingClientRect();

  for (const row of viewport.querySelectorAll<HTMLElement>("[data-block-index]")) {
    const rect = row.getBoundingClientRect();
    if (rect.bottom > top + 1 && rect.top < bottom) {
      return { blockId: row.dataset.blockId ?? row.id, withinRow: Math.max(0, top - rect.top), remeasure: true };
    }
  }
  return null;
}

export function getFocusedFoldAnchor(viewport: HTMLElement | null, blockId: string): ViewportAnchor | null {
  const button = document.activeElement;
  if (!viewport || !button?.hasAttribute("data-document-fold") || !viewport.contains(button)) return null;
  const row = button.closest<HTMLElement>("[data-block-index]");
  if (row?.id !== blockId) return null;
  return { blockId, withinRow: viewport.getBoundingClientRect().top - row.getBoundingClientRect().top, keepMounted: true };
}

export function restoreViewportAnchor(anchor: ViewportAnchor, row: number | undefined, viewport: HTMLElement | null,
  virtualizer: Pick<Virtualizer<HTMLDivElement, Element>, "resizeItem" | "getOffsetForIndex" | "scrollToOffset">) {
  if (anchor.remeasure) remeasureViewportRows(viewport, virtualizer.resizeItem);
  if (row === undefined || !anchor.withinRow) return false;
  const offset = virtualizer.getOffsetForIndex(row, "start");
  if (!offset) return false;
  const height = document.getElementById(anchor.blockId)?.getBoundingClientRect().height ?? Infinity;
  virtualizer.scrollToOffset(Math.max(0, offset[0] + Math.min(anchor.withinRow, Math.max(0, height - 1))));
  return true;
}

function remeasureViewportRows(
  viewport: HTMLElement | null,
  resize: (index: number, height: number) => void,
) {
  if (!viewport) return;
  // Read the new layout before resizing any item can update scroll offsets.
  const measured = Array.from(viewport.querySelectorAll<HTMLElement>("[data-index]"), (row) => ({
    index: Number(row.dataset.index),
    height: row.offsetHeight,
  }));
  for (const { index, height } of measured) resize(index, height);
}
