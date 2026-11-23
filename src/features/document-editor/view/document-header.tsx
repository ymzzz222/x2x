import Link from "next/link";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "../editor.module.css";
import headerStyles from "./document-header.module.css";

const iconPaths = {
  back: "M13 4 7 10l6 6",
  close: "m5 5 10 10M15 5 5 15",
} as const;

export function DocumentIcon({ name }: { name: keyof typeof iconPaths | "more" }) {
  return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 20 20" fill="none">
    {name === "more" ? <g fill="currentColor">
      <circle cx="4" cy="10" r="1.4" /><circle cx="10" cy="10" r="1.4" /><circle cx="16" cy="10" r="1.4" />
    </g> : <path d={iconPaths[name]} stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" />}
  </svg>;
}

export function DocumentDialogHeader({ id, children, closeLabel = "关闭" }: { id: string; children: ReactNode; closeLabel?: string }) {
  return <header className={headerStyles.dialogHeading}>
    <h2 id={id}>{children}</h2>
    <form method="dialog"><button type="submit" className={headerStyles.iconButton} aria-label={closeLabel} title={closeLabel}>
      <DocumentIcon name="close" />
    </button></form>
  </header>;
}

function DocumentTitle({ title, rename }: { title: string; rename?: (title: string) => Promise<void> }) {
  const [draft, setDraft] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const errorId = useId();

  async function save(text: string) {
    if (!rename || draft === null || busy) return;
    const value = text.trim();
    if (!value) { setError("请输入文档标题"); return; }
    setError("");
    if (value === title) { setDraft(null); return; }
    setBusy(true);
    try { await rename(value); setDraft(null); }
    catch (error) { setError(error instanceof Error ? error.message : "无法保存标题，请重试"); }
    finally { setBusy(false); }
  }

  if (!rename) return <h1 className={headerStyles.title}>{title}</h1>;
  return <h1 className={headerStyles.title} aria-label={title}>
    <input aria-label="文档标题" maxLength={120} value={draft ?? title} readOnly={busy}
      aria-invalid={Boolean(error && draft !== null && !draft.trim())} aria-describedby={error ? errorId : undefined}
      onChange={(event) => { setDraft(event.currentTarget.value); setError(""); }}
      onBlur={(event) => { void save(event.currentTarget.value); }}
      onKeyDown={(event) => {
        if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return;
        if (event.key === "Enter") {
          event.preventDefault();
          event.currentTarget.blur();
        } else if (event.key === "Escape" && draft !== null && !busy) {
          event.stopPropagation();
          setDraft(null);
          setError("");
        }
      }} />
    <span id={errorId} role="status" className={headerStyles.titleError}>{error}</span>
  </h1>;
}

const actionContext = createContext<{ panel: HTMLDivElement | null; close: () => void } | null>(null);

export function DocumentAction({ children }: { children: ReactNode }) {
  const actions = useContext(actionContext);
  if (!actions) return children;
  if (!actions.panel) return null;
  return createPortal(<div className={headerStyles.actionItem} onClickCapture={(event) => {
    if (event.target instanceof Element && event.target.closest("button:not(:disabled), a[href]")) actions.close();
  }}>{children}</div>, actions.panel);
}

export function DocumentActions({ children }: { children: ReactNode }) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const [panel, setPanel] = useState<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  const place = useCallback(() => {
    if (!panel || !trigger.current) return;
    const anchor = trigger.current.getBoundingClientRect();
    panel.style.setProperty("--actions-top", `${anchor.bottom + 6}px`);
    panel.style.setProperty("--actions-right", `${document.documentElement.clientWidth - anchor.right}px`);
  }, [panel]);

  function close() {
    trigger.current?.focus({ preventScroll: true });
    if (typeof panel?.hidePopover === "function" && panel.matches(":popover-open")) panel.hidePopover();
    setOpen(false);
  }

  useEffect(() => {
    if (!open || !panel) return;
    window.addEventListener("resize", place);
    function outside(event: PointerEvent) {
      if (event.target instanceof Node && !panel?.contains(event.target) && !trigger.current?.contains(event.target)) setOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      trigger.current?.focus({ preventScroll: true });
      setOpen(false);
    }
    const fallback = typeof panel.showPopover !== "function";
    if (fallback) {
      document.addEventListener("pointerdown", outside);
      document.addEventListener("keydown", escape);
    }
    return () => {
      window.removeEventListener("resize", place);
      if (fallback) {
        document.removeEventListener("pointerdown", outside);
        document.removeEventListener("keydown", escape);
      }
    };
  }, [open, panel, place]);

  return <actionContext.Provider value={{ panel, close }}>
    {children}
    <div>
      <button type="button" className={headerStyles.iconButton} ref={trigger} popoverTarget={id} aria-controls={id} aria-expanded={open}
        aria-label="更多操作" title="更多操作" onClick={() => { place(); if (typeof panel?.showPopover !== "function") setOpen(!open); }}>
        <DocumentIcon name="more" />
      </button>
      <div id={id} ref={setPanel} popover="auto" className={headerStyles.actionPanel} role="group" aria-label="文档操作"
        data-open={open} onToggle={(event) => setOpen(event.newState === "open")} />
    </div>
  </actionContext.Provider>;
}

export function DocumentEditorHeader({ status, title, cover, preview, shared, children }: {
  status?: string;
  title?: ReactNode;
  cover?: ReactNode;
  preview: ReactNode;
  shared?: { title: string; rename?: (title: string) => Promise<void>; avatars?: ReactNode };
  children: ReactNode;
}) {
  const router = useRouter();
  const pendingRename = useRef<Promise<void>>(null);

  async function renameTitle(value: string) {
    const pending = shared?.rename?.(value);
    if (!pending) return;
    pendingRename.current = pending;
    try { await pending; }
    finally { if (pendingRename.current === pending) pendingRename.current = null; }
  }

  const statusLine = status !== undefined && <p role="status" className={styles.status}>{status}</p>;
  return <header className={`${styles.header} ${shared ? headerStyles.sharedHeader : ""}`}>
    {cover}
    <div className={`${styles.headerRow} ${shared ? headerStyles.sharedRow : ""}`}>
      <div className={`${styles.heading} ${headerStyles.heading}`}>
        <Link href="/editor" className={headerStyles.iconButton} aria-label="返回文档列表" title="返回文档列表"
          onNavigate={(event) => {
            const pending = pendingRename.current;
            if (!pending) return;
            event.preventDefault();
            void pending.then(() => router.push("/editor"), () => { /* The title input displays the save error. */ });
          }}>
          <DocumentIcon name="back" />
        </Link>
        {shared ? <DocumentTitle title={shared.title} rename={shared.rename ? renameTitle : undefined} /> : title ?? <h1>长文档原型</h1>}
        {!shared && statusLine}
      </div>
      <div className={`${styles.controls} ${headerStyles.controls}`}>
        {children}
        {preview}
      </div>
      {shared?.avatars && <div className={headerStyles.headerAvatars}>{shared.avatars}</div>}
      {shared && statusLine}
    </div>
  </header>;
}
