import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type ReactNode, type RefObject } from "react";
import { DocumentFormatToolbar, useDocumentFormatting } from "./document-format-toolbar";
import { isBlankParagraph, readHeadingNumberStart, type DocumentBlock, type DocumentSelection } from "../model/document-model";
import { blockTypes, type ListCommand } from "../model/document-structure";
import type { useDocumentBlocks } from "./use-document-blocks";
import styles from "./document-block-tools.module.css";

type Tools = ReturnType<typeof useDocumentBlocks>;

const blockIconPaths: Readonly<Record<string, string>> = {
  add: "M10 4.5v11M4.5 10h11",
  paragraph: "M4.5 5h11M10 5v10m-2.5 0h5",
  bulletList: "M4.5 6h.1m-.1 4h.1m-.1 4h.1M8 6h7.5M8 10h7.5M8 14h7.5",
  orderedList: "m4 5.5 1-.5v3M3.75 11.75a1.25 1.25 0 1 1 2 .9L3.75 15H6M9 6.5h6.5M9 13.5h6.5",
  blockquote: "M8 6a3 3 0 0 0-3 3v4h4V9H5m10-3a3 3 0 0 0-3 3v4h4V9h-4",
  callout: "M10 3.5c.8 4 2.5 5.7 6.5 6.5-4 .8-5.7 2.5-6.5 6.5-.8-4-2.5-5.7-6.5-6.5 4-.8 5.7-2.5 6.5-6.5Z",
  horizontalRule: "M4 10h12",
  columns: "M6 4.5h8A1.5 1.5 0 0 1 15.5 6v8a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 14V6A1.5 1.5 0 0 1 6 4.5ZM10 4.5v11",
  heading: "M3 5.5v9m6-9v9M3 10h6",
};

const headingDigits = [
  "m12.5 8 2-1.2v7.4m-1.8 0h3.6",
  "M12.25 8a2.1 2.1 0 1 1 3.45 2L12.25 14.2h4.2",
  "M12.3 7.6a2.5 2.5 0 0 1 1.7-.8 1.8 1.8 0 1 1 0 3.6 1.95 1.95 0 1 1 0 3.9c-.7 0-1.3-.3-1.8-.8",
  "m15.25 6.8-3.3 4.9h4.7m-1.4-4.9v7.4",
  "M16.1 6.8h-3.6v3.4a2.2 2.2 0 1 1-.25 3.2",
  "M16 7.35c-2.6-1.9-3.8 1.4-3.8 4.7a2 2 0 1 0 .1-.6",
  "M12 6.8h4.6l-3 7.4",
  "M14.3 10.3a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5Zm0 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z",
  "M12.5 13.8c2.6 1.8 3.8-1.4 3.8-4.7a2 2 0 1 0-.1.6",
];

function BlockTypeIcon({ type, level = 1 }: { type: string; level?: number }) {
  return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 20 20" fill="none" data-block-icon={type}
    stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">
    <path d={blockIconPaths[type] ?? blockIconPaths.paragraph} />
    {type === "heading" && <path strokeWidth="1.4" d={headingDigits[level - 1]} />}
  </svg>;
}

export function BlockHandles({ tools, block, index }: { tools: Tools; block: DocumentBlock; index: number }) {
  const { id, kind, level, structure } = block;
  const empty = isBlankParagraph(block);
  const type = structure?.firstChild?.type.name ?? kind;
  const number = index + 1;
  const mode = empty ? "insert" : "block";
  const visible = tools.panel?.id === id && tools.panel.mode === mode;
  const typeLabel = blockTypes.find((entry) => entry.kind.type === type && entry.kind.level === level)?.label;
  return (
    <div className={styles.handles} data-open={visible || undefined}>
      <button type="button" data-block-handle={mode} data-selected={tools.selected(index) || undefined}
        title={empty ? "插入内容" : (typeLabel ?? "内容块") + " · 拖动以移动"}
        aria-label={empty ? "在第 " + number + " 块插入" : "第 " + number + " 块操作"} aria-expanded={visible}
        onMouseDown={(event) => event.preventDefault()}
        onPointerDown={empty ? undefined : (event) => tools.pointerDown(id, event)}
        onClick={(event) => {
          event.stopPropagation();
          if (!empty && event.detail > 0 && tools.consumeDragClick()) return;
          if (!empty && event.shiftKey) tools.selectBlock(id, true);
          else tools.open(id, mode, event.currentTarget, event.detail === 0 ? "keyboard" : "pointer");
        }}>
        <BlockTypeIcon type={empty ? "add" : type} level={level} />
      </button>
    </div>
  );
}

const firstCommand = "button:not(:disabled)";

type PopupPosition = { x: number; y: number };
type PopupOptions = {
  viewport: RefObject<HTMLElement | null>;
  anchor: () => DOMRect | null;
  label: string;
  className?: string;
  preferAbove?: boolean;
  trigger?: HTMLElement;
  focusSelector?: string;
  side?: boolean;
  layer?: "branch" | "commands" | "floating";
  children: ReactNode;
};
function AnchoredTools({ viewport, anchor, label, className, preferAbove, trigger, focusSelector, side, layer, children }: PopupOptions) {
  const panel = useRef<HTMLDivElement>(null);
  const [point, setPoint] = useState<PopupPosition | null>(null);
  useLayoutEffect(() => {
    const element = panel.current;
    const scroller = viewport.current;
    if (!element || !scroller) return;

    function measure() {
      if (!element || !scroller) return;
      const origin = anchor();
      const view = scroller.getBoundingClientRect();
      if (!origin || origin.bottom < view.top - 8 || origin.top > view.bottom) {
        setPoint(null);
        return;
      }
      const target = trigger?.isConnected ? trigger.getBoundingClientRect() : origin;
      const margin = 8;
      const width = element.offsetWidth;
      const height = element.offsetHeight;
      const below = target.bottom + 6;
      const above = target.top - height - 6;
      const bottomEdge = window.innerHeight - margin;
      const preferTop = preferAbove && above >= margin;
      const flipUp = below + height > bottomEdge && above >= margin;
      const rightEdge = window.innerWidth - margin;
      const sideLeft = target.right + width + 2 <= rightEdge ? target.right + 2 :
        target.left - width - 2 >= margin ? target.left - width - 2 : null;
      const alongside = side && sideLeft !== null;
      const y = alongside ? Math.max(margin, Math.min(target.top, bottomEdge - height)) :
        preferTop || flipUp ? above : Math.max(margin, Math.min(below, bottomEdge - height));
      const left = trigger && scroller.contains(trigger) ? origin.left : target.left;
      const x = alongside ? sideLeft : Math.max(margin, Math.min(left, rightEdge - width));
      setPoint((current) => current?.x === x && current.y === y ? current : { x, y });
    }
    const parentPopup = trigger?.closest("[data-editor-overlay]");
    measure();
    parentPopup?.addEventListener("scroll", measure, { passive: true });
    scroller.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    observer.observe(scroller);
    return () => {
      observer.disconnect();
      parentPopup?.removeEventListener("scroll", measure);
      scroller.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [anchor, viewport, preferAbove, trigger, side]);
  const positioned = Boolean(point);
  useLayoutEffect(() => {
    if (positioned && focusSelector) panel.current?.querySelector<HTMLElement>(focusSelector)?.focus({ preventScroll: true });
  }, [positioned, focusSelector, trigger]);
  const style = point ? { left: point.x, top: point.y } : { visibility: "hidden" as const };
  return <div ref={panel} className={styles.popup + (className ? " " + className : "")} style={style} role="group" aria-label={label} data-editor-overlay={layer}>{children}</div>;
}

function preservePointerFocus(event: MouseEvent) {
  if ((event.target as Element).closest("button")) event.preventDefault();
}

function focusNext(event: KeyboardEvent, close: () => void, nested = false) {
  if (event.key === "Escape" || (nested && event.key === "ArrowLeft")) {
    event.preventDefault();
    event.stopPropagation();
    close();
    return;
  }
  const keys = ["ArrowUp", "ArrowDown", "Home", "End"];
  if (!keys.includes(event.key) || (event.target as Element).closest("input,select")) return;
  const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)")].filter((button) => button.offsetParent !== null);
  if (!buttons.length) return;
  const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
  const next = event.key === "Home" || (index < 0 && event.key === "ArrowDown") ? 0 :
    event.key === "End" || index < 0 ? buttons.length - 1 :
    (index + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length;
  event.preventDefault();
  buttons[next].focus();
}

const commonTypes = blockTypes.filter(({ kind }) => (kind.level ?? 0) <= 3);
const headingTypes = blockTypes.filter(({ kind }) => (kind.level ?? 0) > 3);
const quickTypes = commonTypes.filter(({ kind }) => kind.type === "paragraph" || kind.type === "heading");
const otherTypes = commonTypes.filter(({ kind }) => kind.type !== "paragraph" && kind.type !== "heading");

type Branch = "headings" | "convert" | "insert";
type BranchState = { name: Branch; trigger: HTMLButtonElement; keyboard: boolean; parent: Tools["panel"] };

export function DocumentBlockTools({ tools, viewport, count, onCopyLink, copyAllowed = true }: {
  tools: Tools;
  viewport: RefObject<HTMLDivElement | null>;
  count: number;
  copyAllowed?: boolean;
  onCopyLink: (id: string) => void;
}) {
  const [branchState, setBranch] = useState<BranchState | null>(null);
  const [number, setNumber] = useState("1");
  const listId = useId();
  const menu = useRef<HTMLDivElement>(null);
  const { panel, activeId, closePanel, headingNumber } = tools;
  const branch = branchState?.parent === panel ? branchState : null;
  const target = panel && tools.bounds(panel.id);
  const neighbors = target ? tools.moveNeighbors(target) : undefined;
  const listKind = panel && tools.listed(panel.id);
  const rowId = panel?.id ?? activeId;
  const commands = tools.slash ? tools.entries : commonTypes;
  const dropStyle: CSSProperties | undefined = tools.drop
    ? { left: tools.drop.x, top: tools.drop.y, width: tools.drop.width } : undefined;

  useEffect(() => {
    if (!panel) return;
    const trigger = panel.target;
    let closePreview = 0;
    function dismiss(event: globalThis.PointerEvent) {
      const target = event.target;
      if (target instanceof Element && !target.closest("[data-editor-overlay], ." + styles.handles) && !trigger.contains(target)) closePanel();
    }
    function dismissOnEscape(event: globalThis.KeyboardEvent) {
      if (event.key !== "Escape" || event.defaultPrevented || event.isComposing || event.keyCode === 229) return;
      const target = event.target;
      if (target !== document.body && !(target instanceof Node && viewport.current?.contains(target))) return;
      event.preventDefault();
      closePanel();
    }
    function track(event: globalThis.PointerEvent) {
      window.clearTimeout(closePreview);
      const target = event.target;
      if (target instanceof Element && !target.closest("[data-editor-overlay='branch'], [data-editor-overlay='commands']") && !trigger.contains(target)) {
        closePreview = window.setTimeout(closePanel, 160);
      }
    }
    document.addEventListener("pointerdown", dismiss);
    if (panel.entry === "preview") document.addEventListener("pointermove", track);
    if (panel.entry === "pointer" && (panel.mode === "heading-number" || (count === 1 && panel.mode === "insert"))) {
      document.addEventListener("keydown", dismissOnEscape, true);
    }
    return () => {
      window.clearTimeout(closePreview);
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("pointermove", track);
      document.removeEventListener("keydown", dismissOnEscape, true);
    };
  }, [panel, count, closePanel, viewport]);

  useLayoutEffect(() => {
    if (tools.slash) menu.current?.querySelector("[data-command-current]")?.scrollIntoView({ block: "nearest" });
  }, [tools.slash, tools.highlight, commands.length]);

  function close(returnFocus = true) {
    if (returnFocus && panel?.entry === "keyboard") panel.target.focus({ preventScroll: true });
    closePanel();
  }

  function openBranch(name: Branch, trigger: HTMLButtonElement, keyboard: boolean) {
    setBranch({ name, trigger, keyboard, parent: panel });
  }

  function branchButton(name: Branch, label: string) {
    return <button type="button" className={styles.branchButton} aria-expanded={branch?.name === name}
      onPointerEnter={(event) => {
        if (event.pointerType !== "mouse") return;
        if (event.relatedTarget instanceof Element && event.relatedTarget.closest("[data-editor-overlay='branch']")) setBranch(null);
        else openBranch(name, event.currentTarget, false);
      }}
      onKeyDown={(event) => {
        if (event.key !== "ArrowRight") return;
        event.preventDefault();
        openBranch(name, event.currentTarget, true);
      }}
      onClick={(event) => openBranch(name, event.currentTarget, event.detail === 0)}>
      {label}<span aria-hidden="true">›</span>
    </button>;
  }

  function typeButton({ kind, label }: (typeof blockTypes)[number], index = -1, insert = false) {
    const current = tools.currentType;
    const matches = !insert && current?.type === kind.type && current.level === kind.level;
    return <button key={label} type="button" aria-pressed={!insert && current ? matches : undefined} aria-label={label}
      title={label} data-command-current={tools.slash && tools.highlight === index || undefined}
      onClick={() => tools.applyType(kind, panel, insert)}>
      <BlockTypeIcon type={kind.type} level={kind.level} />
      <span className={styles.commandLabel}>{label}</span>
    </button>;
  }

  return (
    <>
      {tools.drop && <div className={styles.dropLine} style={dropStyle} aria-hidden="true" />}
      {rowId && (panel || tools.slash) && <AnchoredTools viewport={viewport}
        anchor={() => document.getElementById(rowId)?.getBoundingClientRect() ?? null}
        trigger={panel?.target} focusSelector={panel?.entry === "keyboard" ? firstCommand : undefined} layer="commands"
        label={headingNumber ? "标题编号" : tools.slash ? "斜杠命令" : "内容块命令"}>
        <div ref={menu} className={styles.commands} id={listId} onMouseDown={preservePointerFocus}
          onKeyDown={(event) => {
            if (event.key === "Tab" && panel?.entry === "keyboard") { close(); return; }
            focusNext(event, () => close());
          }}
          onPointerOver={(event) => {
            const target = (event.target as Element).closest("button");
            if (branch && target && target !== branch.trigger) setBranch(null);
          }}>
          {headingNumber ? (
            <div className={styles.listSettings}>
              <button type="button" disabled={!headingNumber.hasPrevious || headingNumber.start === 0}
                onClick={() => tools.updateHeadingNumber(0)}>继续标题编号</button>
              <button type="button" disabled={headingNumber.start === 1 || (!headingNumber.hasPrevious && headingNumber.start === 0)}
                onClick={() => tools.updateHeadingNumber(1)}>重新开始编号</button>
              <form key={panel?.id} onSubmit={(event) => {
                event.preventDefault();
                const start = readHeadingNumberStart(new FormData(event.currentTarget).get("number"));
                if (start) tools.updateHeadingNumber(start);
              }}>
                <label>设置编号的值<input name="number" type="number" min="1" max="9999999" required defaultValue={headingNumber.value} /></label>
                <button type="submit">应用编号</button>
              </form>
            </div>
          ) : panel?.mode === "block" ? (
            <>
              <div role="group" aria-label="常用块类型" className={styles.quickTypes}>
                {quickTypes.map((entry) => typeButton(entry))}
              </div>
              <div className={styles.typeCommands}>
                {branchButton("headings", "其他标题")}
                {branchButton("convert", "转换块类型")}
              </div>
              {target && <div role="group" aria-label="内容块操作" className={styles.blockActions}>
                <button type="button" onClick={() => tools.selectBlock(panel.id, false)}>选中块</button>
                <button type="button" disabled={!copyAllowed} onClick={() => { void tools.copy(panel.id, true); }}>剪切块</button>
                <button type="button" disabled={!copyAllowed} onClick={() => { void tools.copy(panel.id, false); }}>复制块</button>
                <button type="button" onClick={() => tools.remove(target)}>删除块</button>
                <button type="button" disabled={neighbors?.up === undefined} onClick={() => neighbors?.up !== undefined && tools.move(target, neighbors.up)}>上移</button>
                <button type="button" disabled={neighbors?.down === undefined} onClick={() => neighbors?.down !== undefined && tools.move(target, neighbors.down)}>下移</button>
                <button type="button" onClick={() => { onCopyLink(panel.id); close(); }}>复制块链接</button>
                {branchButton("insert", "在下方添加")}
              </div>}
            </>
          ) : (
            <div role="group" aria-label={panel?.mode === "insert" ? "插入块" : "转换类型"} className={styles.typeCommands}>
              {commands.map((entry, index) => typeButton(entry, index, false))}
              {panel && branchButton("headings", "其他标题")}
              {tools.slash && !commands.length && <p role="status">没有匹配的命令</p>}
            </div>
          )}
          {panel?.mode === "block" && listKind && (
            <div role="group" aria-label="列表编号与标记" className={styles.listSettings}>
              <label>标记
                <select defaultValue="" onChange={(event) => { if (event.currentTarget.value) tools.updateList(panel.id, { marker: event.currentTarget.value }); }}>
                  <option value="" disabled>选择标记</option>
                  {listKind === "orderedList" ? <><option value="1">数字</option><option value="a">字母</option><option value="i">罗马数字</option></>
                    : <><option value="disc">实心圆</option><option value="circle">空心圆</option><option value="square">方块</option></>}
                </select>
              </label>
              {listKind === "orderedList" && <>
                {([["续编", "continue"], ["重新开始", 1]] as const).map(([label, start]) => (
                  <button key={label} type="button" onClick={() => tools.updateList(panel.id, { start } satisfies ListCommand)}>{label}</button>
                ))}
                <form onSubmit={(event) => {
                  event.preventDefault();
                  const start = Number(number);
                  if (Number.isSafeInteger(start) && start > 0) tools.updateList(panel.id, { start });
                }}>
                  <label>起始编号<input type="number" min="1" max="9999999" required value={number}
                    onChange={(event) => setNumber(event.currentTarget.value)} /></label>
                  <button type="submit">应用编号</button>
                </form>
              </>}
            </div>
          )}
        </div>
      </AnchoredTools>}
      {branch && <AnchoredTools viewport={viewport} side layer="branch" className={styles.submenu}
        anchor={() => rowId ? document.getElementById(rowId)?.getBoundingClientRect() ?? null : null}
        trigger={branch.trigger} focusSelector={branch.keyboard ? firstCommand : undefined}
        label={branch.name === "headings" ? "其他标题" : branch.name === "insert" ? "在下方添加" : "转换块类型"}>
        <div className={styles.commands} onMouseDown={preservePointerFocus} onKeyDown={(event) => {
          if (event.key === "Tab") { close(); return; }
          focusNext(event, () => { setBranch(null); branch.trigger.focus({ preventScroll: true }); }, true);
        }}>
          <div className={styles.typeCommands}>
            {(branch.name === "headings" ? headingTypes : branch.name === "insert" ? commonTypes : otherTypes)
              .map((entry) => typeButton(entry, -1, branch.name === "insert"))}
          </div>
        </div>
      </AnchoredTools>}
    </>
  );
}

export function FloatingSelectionTools({ selection, viewport, format, tools, restoreSelection, onEdit }: {
  selection: DocumentSelection | null;
  viewport: RefObject<HTMLDivElement | null>;
  format: ReturnType<typeof useDocumentFormatting>;
  tools: Tools;
  restoreSelection: (selection: DocumentSelection) => void;
  onEdit?: () => void;
}) {
  const [selecting, setSelecting] = useState(false);
  useEffect(() => {
    function start(event: globalThis.PointerEvent) {
      if (event.target instanceof Element && viewport.current?.contains(event.target) && !event.target.closest("button")) setSelecting(true);
    }
    function end() { setSelecting(false); }
    document.addEventListener("pointerdown", start, true);
    document.addEventListener("pointerup", end, true);
    document.addEventListener("pointercancel", end, true);
    return () => {
      document.removeEventListener("pointerdown", start, true);
      document.removeEventListener("pointerup", end, true);
      document.removeEventListener("pointercancel", end, true);
    };
  }, [viewport]);
  const typeOpen = tools.panel?.mode === "type" && tools.panel.target.dataset.toolbar === "floating";
  if (selecting || !selection || (tools.panel && !typeOpen) || tools.slash) return null;
  function anchor() {
    const scroll = viewport.current;
    if (!scroll) return null;
    const visible = scroll.getBoundingClientRect();
    const inView = (rect: DOMRect) => rect.bottom > visible.top && rect.top < visible.bottom;
    const native = document.getSelection();
    if (native?.rangeCount && !native.isCollapsed && scroll.contains(native.anchorNode)) {
      const rect = Array.from(native.getRangeAt(0).getClientRects()).find(inView);
      if (rect) return rect;
    }
    // Windowing also mounts selected text outside the viewport.
    for (const painted of scroll.querySelectorAll("[data-document-selection]")) {
      const rect = Array.from(painted.getClientRects()).find(inView);
      if (rect) return rect;
    }
    return document.getElementById(selection!.focus.blockId)?.getBoundingClientRect() ?? null;
  }
  return <AnchoredTools viewport={viewport} anchor={anchor} label="浮动选区格式" className={styles.floating}
    preferAbove layer="floating" focusSelector={format.panel === "link" ? "input" : undefined}>
    <div onKeyDown={(event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      tools.closePanel();
      tools.dismissFloating();
      restoreSelection(selection);
    }}>
      {onEdit ? <button type="button" className={styles.editSelection} onMouseDown={preservePointerFocus} onClick={onEdit}>编辑</button> :
        <DocumentFormatToolbar format={format} indent={{ available: tools.canIndent, apply: () => tools.indent(selection) }} blockType={{
          expanded: typeOpen,
          open: (target, keyboard) => tools.open(selection.focus.blockId, "type", target, keyboard ? "keyboard" : "pointer"),
          preview: (target, previous) => {
            if (previous instanceof Element && previous.closest("[data-editor-overlay='commands']")) tools.closePanel();
            else tools.open(selection.focus.blockId, "type", target, "preview");
          },
        }} />}
    </div>
  </AnchoredTools>;
}
