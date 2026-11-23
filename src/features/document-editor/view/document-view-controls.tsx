import Link from "next/link";
import { useId, type ReactNode } from "react";
import { sampleSizes, type DocumentSelection, type SampleSize } from "../model/document-model";
import styles from "../editor.module.css";
import { DocumentAction } from "./document-header";

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

export function PreviewSettings({ count, mounted, showInfo, children }: {
  count: number;
  mounted: number;
  showInfo: boolean;
  children: ReactNode;
}) {
  return (
    <details className={styles.previewSettings} onKeyDown={(event) => {
      if (event.key !== "Escape" || !event.currentTarget.open) return;
      event.stopPropagation();
      event.currentTarget.open = false;
      event.currentTarget.querySelector("summary")?.focus();
    }}>
      <summary onMouseDown={(event) => event.preventDefault()}>预览设置</summary>
      <div className={styles.previewSettingsPanel}>
        {showInfo && <p className={styles.metrics}>{count.toLocaleString("zh-CN")} 段 · 挂载 {mounted} 段</p>}
        {children}
      </div>
    </details>
  );
}

export function EditorPreviewControls({ count, mounted, showInfo, size, mode, onJump, simulate, canSimulate }: {
  count: number;
  mounted: number;
  showInfo: boolean;
  size?: SampleSize;
  mode: "window" | "full";
  onJump: (index: number) => void;
  simulate?: () => void;
  canSimulate: boolean;
}) {
  return <PreviewSettings count={count} mounted={mounted} showInfo={showInfo}>
    {size && <SampleControls size={size} mode={mode} />}
    <DocumentJump count={count} onJump={onJump} />
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

export function remeasureViewportRows(
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
