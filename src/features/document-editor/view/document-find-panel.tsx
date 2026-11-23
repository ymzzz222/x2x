import { useEffect, useEffectEvent, useId, useLayoutEffect, useMemo, useRef, useState, type FormEvent, type RefObject } from "react";
import { findDocumentMatches, type DocumentBlock, type DocumentMatch } from "../model/document-model";
import { DocumentIcon } from "./document-header";
import headerStyles from "./document-header.module.css";
import styles from "./document-find-panel.module.css";

type FindMode = "find" | "replace";
const tabs = [{ mode: "find", label: "查找" }, { mode: "replace", label: "替换" }] as const;

type FindOptions = {
  enabled: boolean;
  blocks: readonly DocumentBlock[];
  onLocate: (match: DocumentMatch) => void;
  onReplace: (matches: readonly DocumentMatch[], value: string) => { count: number; blocks: readonly DocumentBlock[] };
  viewport: RefObject<HTMLDivElement | null>;
};

export function useDocumentFind({ enabled, blocks, onLocate, onReplace, viewport }: FindOptions) {
  const id = useId();
  const [panel, setPanel] = useState<{ mode: FindMode; focusRequest: number } | null>(null);
  const [search, setSearch] = useState({ query: "", index: 0 });
  const returnFocus = useRef<HTMLElement | null>(null);
  const open = panel !== null;
  const { matches, byBlock } = useMemo(() => {
    const all = findDocumentMatches(blocks, search.query);
    const grouped = new Map<string, DocumentMatch[]>();
    for (const match of all) {
      const group = grouped.get(match.blockId);
      if (group) group.push(match);
      else grouped.set(match.blockId, [match]);
    }
    return { matches: all, byBlock: grouped };
  }, [blocks, search.query]);
  const index = Math.min(search.index, Math.max(0, matches.length - 1));
  const current = matches[index];

  function openPanel(mode: FindMode) {
    if (!open) returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setPanel((current) => ({ mode, focusRequest: (current?.focusRequest ?? 0) + 1 }));
  }

  function closePanel() {
    setPanel(null);
    setSearch({ query: "", index: 0 });
    const previous = returnFocus.current;
    if (previous?.isConnected && previous !== document.body) previous.focus({ preventScroll: true });
    else viewport.current?.focus({ preventScroll: true });
  }

  const onShortcut = useEffectEvent((event: KeyboardEvent) => {
    if (event.defaultPrevented || event.isComposing || event.keyCode === 229) return;
    if (event.target instanceof Element && event.target.closest("dialog[open]:not([data-find-dialog])")) return;
    if ((event.metaKey || event.ctrlKey) && !event.shiftKey && !event.altKey && event.key.toLowerCase() === "f") {
      event.preventDefault();
      openPanel("find");
    } else if (open && event.key === "Escape") {
      event.preventDefault();
      closePanel();
    }
  });

  useEffect(() => {
    if (!enabled) return;
    function listen(event: KeyboardEvent) { onShortcut(event); }
    window.addEventListener("keydown", listen);
    return () => window.removeEventListener("keydown", listen);
  }, [enabled]);

  const locateCurrent = useEffectEvent(() => {
    if (open && current) onLocate(current);
  });

  useEffect(() => {
    locateCurrent();
  }, [open, search]);

  function updateQuery(query: string) {
    setSearch((previous) => previous.query === query ? previous : { query, index: 0 });
  }

  function step(direction: number) {
    if (matches.length) setSearch({ ...search, index: (index + direction + matches.length) % matches.length });
  }

  function replace(value: string, all: boolean) {
    if (!current) return 0;

    const result = onReplace(all ? matches : [current], value);
    if (result.count) {
      const remaining = findDocumentMatches(result.blocks, search.query);
      const next = remaining.findIndex((match) => match.blockIndex > current.blockIndex ||
        (match.blockIndex === current.blockIndex && match.from >= current.from + value.length));
      setSearch({ ...search, index: all || next < 0 ? 0 : next });
    } else if (!all) {
      step(1);
    }
    return result.count;
  }

  return { id, open, mode: panel?.mode ?? "find", focusRequest: panel?.focusRequest ?? 0, query: search.query,
    activeMatch: current, byBlock, matchCount: matches.length, position: current ? index + 1 : 0,
    openPanel, closePanel, updateQuery, step, replace,
    selectMode: (mode: FindMode) => setPanel((current) => current && current.mode !== mode ? { ...current, mode } : current) };
}

export function DocumentFindPanel({ find, editable }: { find: ReturnType<typeof useDocumentFind>; editable: boolean }) {
  const { id } = find;
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [replacement, setReplacement] = useState("");
  const [status, setStatus] = useState("");
  const composing = useRef(false);
  const disabled = !find.matchCount;
  const mode = editable ? find.mode : "find";
  const queryForm = id + "-query-form";
  const replaceForm = id + "-replace-form";

  useLayoutEffect(() => {
    const panel = dialog.current;
    if (!panel) return;
    const header = panel.previousElementSibling;
    function place() {
      panel?.style.setProperty("--find-top", `${header?.getBoundingClientRect().bottom ?? 0}px`);
    }
    place();
    if (typeof panel.showPopover === "function") {
      if (!panel.matches(":popover-open")) panel.showPopover();
    } else if (!panel.open) {
      panel.show();
    }
    const resize = new ResizeObserver(place);
    if (header) resize.observe(header);
    return () => resize.disconnect();
  }, []);

  useLayoutEffect(() => {
    input.current?.focus({ preventScroll: true });
    input.current?.select();
  }, [find.focusRequest]);

  function selectMode(mode: FindMode) {
    composing.current = false;
    find.selectMode(mode);
  }

  function replace(all: boolean) {
    const count = find.replace(replacement, all);
    setStatus(count ? "已替换 " + count + " 处" : "内容没有变化");
  }

  function submitFind(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!composing.current) find.step(1);
  }

  function submitReplace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!composing.current && !disabled) replace(false);
  }

  const fields = <search className={styles.fields} aria-label={mode === "replace" ? "查找与替换" : "查找文档"}>
    <form id={queryForm} className={styles.field} onSubmit={submitFind}>
      <label htmlFor={id + "-query"}>查找文字</label>
      <div className={styles.query}>
        <input id={id + "-query"} name="query" type="search" ref={input} defaultValue={find.query} placeholder="在文档内查找"
          autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false} enterKeyHint="next"
          onCompositionStart={() => { composing.current = true; }}
          onCompositionEnd={(event) => {
            composing.current = false;
            find.updateQuery(event.currentTarget.value);
          }}
          onChange={(event) => {
            setStatus("");
            if (!composing.current) find.updateQuery(event.currentTarget.value);
          }}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) {
              event.preventDefault();
            } else if (event.shiftKey) {
              event.preventDefault();
              find.step(-1);
            }
          }} />
        <output aria-label="匹配计数" className={styles.count}>{find.position} / {find.matchCount}</output>
      </div>
    </form>
    {mode === "replace" && <form id={replaceForm} className={styles.field} onSubmit={submitReplace}>
      <label htmlFor={id + "-replacement"}>替换为</label>
      <input id={id + "-replacement"} name="replacement" value={replacement} placeholder="输入替换文字"
        autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false}
        onChange={(event) => { setReplacement(event.currentTarget.value); setStatus(""); }}
        onCompositionStart={() => { composing.current = true; }}
        onCompositionEnd={() => { composing.current = false; }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229)) event.preventDefault();
        }} />
    </form>}
    <div className={styles.actionRow}>
      <div className={styles.actions}>
        <button type="button" disabled={disabled} onClick={() => find.step(-1)}>上一处</button>
        <button type="submit" form={queryForm} disabled={disabled}>下一处</button>
      </div>
      {mode === "replace" && <div className={styles.actions}>
        <button type="submit" form={replaceForm} disabled={disabled}>替换当前</button>
        <button type="button" className={styles.primary} disabled={disabled} onClick={() => replace(true)}>全部替换</button>
      </div>}
    </div>
    {mode === "replace" && <span className={styles.feedback} role="status" aria-label="替换结果">{status}</span>}
  </search>;

  return <dialog ref={dialog} id={id} className={styles.dialog} popover="manual" data-find-dialog=""
    aria-label={editable ? "查找与替换" : "查找"}>
    <header className={styles.header}>
      {editable ? <div role="tablist" aria-label="查找与替换" className={styles.tabs} onKeyDown={(event) => {
        const { key, currentTarget } = event;
        if (key !== "ArrowLeft" && key !== "ArrowRight" && key !== "Home" && key !== "End") return;
        event.preventDefault();
        const next = key === "Home" ? "find" : key === "End" ? "replace" : mode === "find" ? "replace" : "find";
        currentTarget.querySelector<HTMLButtonElement>(`[data-find-tab="${next}"]`)?.focus();
      }}>
        {tabs.map((tab) => <button key={tab.mode} type="button" role="tab" id={`${id}-${tab.mode}-tab`}
          data-find-tab={tab.mode} aria-selected={mode === tab.mode} tabIndex={mode === tab.mode ? 0 : -1}
          onFocus={() => selectMode(tab.mode)} onClick={() => selectMode(tab.mode)}>{tab.label}</button>)}
      </div> : <h2>查找</h2>}
      <button type="button" className={headerStyles.iconButton} aria-label="关闭" title="关闭" onClick={find.closePanel}>
        <DocumentIcon name="close" />
      </button>
    </header>
    {editable ? tabs.map((tab) => <div key={tab.mode} role="tabpanel" aria-labelledby={`${id}-${tab.mode}-tab`}
      hidden={tab.mode !== mode}>{tab.mode === mode && fields}</div>) : fields}
  </dialog>;
}
