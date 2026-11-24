import { useId, useMemo, useState, type KeyboardEvent, type MouseEvent } from "react";
import { commonMarks, normalizeLink, toggles, type FormatMark, type MarkValue } from "../model/document-format";
import type { DocumentBlock, DocumentSelection } from "../model/document-model";
import { paragraphAlignments, paragraphSelectionState, type ParagraphCommand } from "../model/document-paragraph";
import styles from "./document-format-toolbar.module.css";

type Panel = "link" | "colors";
type FormatCommand = { mark: FormatMark; value: MarkValue | null } | ParagraphCommand;
type ApplyFormat = (range: DocumentSelection, command: FormatCommand) => boolean;

export function useDocumentFormatting(
  blocks: readonly DocumentBlock[],
  paragraphRange: DocumentSelection | null,
  hasTextSelection: boolean,
  onApply: ApplyFormat,
  onRestore: (selection: DocumentSelection) => void,
  readNativeSelection: () => DocumentSelection | null,
) {
  const selection = hasTextSelection ? paragraphRange : null;
  const paragraph = useMemo(() => paragraphSelectionState(blocks, paragraphRange), [blocks, paragraphRange]);
  const [openPanel, setPanel] = useState<Panel | null>(null);
  const panel = selection ? openPanel : null;
  const [url, setUrl] = useState("");
  const marks = useMemo(() => selection ? commonMarks(blocks, selection) : {}, [blocks, selection]);

  function currentRange() {
    const native = readNativeSelection();
    if (!native) return selection;
    return native.anchor.offset !== native.focus.offset ? native : null;
  }

  function open(name: Panel) {
    const range = currentRange();
    if (!range) return;
    if (panel === name) {
      close();
      return;
    }
    setPanel(name);
    if (name === "link") {
      const link = commonMarks(blocks, range).link;
      setUrl(typeof link === "string" ? link : "");
    }
  }

  function close() {
    if (panel && selection) onRestore(selection);
    setPanel(null);
  }

  function apply(name: FormatMark, value: MarkValue | null) {
    if (selection) onApply(selection, { mark: name, value });
    if (panel === "link") setPanel(null);
  }

  function toggle(name: FormatMark, range = currentRange()) {
    if (!range) return;
    setPanel(null);
    onApply(range, { mark: name, value: commonMarks(blocks, range)[name] ? null : true });
  }

  function applyParagraph(command: ParagraphCommand) {
    const range = readNativeSelection() ?? paragraphRange;
    if (range) onApply(range, command);
  }

  function shortcut(event: KeyboardEvent, revealSelectionTools: () => void) {
    if (event.key === "Tab" && !event.metaKey && !event.ctrlKey && !event.altKey) {
      const native = readNativeSelection();
      return !!native && native.anchor.offset === 0 && native.focus.offset === 0 &&
        onApply(native, { firstLineIndent: !event.shiftKey });
    }
    if (!(event.metaKey || event.ctrlKey) || event.altKey) return false;
    const range = currentRange();
    if (!range) return false;
    const key = event.key.toLowerCase();
    const command = toggles.find((entry) => entry.key === key && ("shift" in entry) === event.shiftKey);
    if (command) toggle(command.name, range);
    else if (key === "k" && !event.shiftKey) {
      revealSelectionTools();
      open("link");
    } else return false;
    return true;
  }

  return { selection, panel, open, close, apply, toggle, shortcut, url, setUrl, marks, paragraph, applyParagraph };
}

const textColors = [
  { value: "", label: "默认" },
  { value: "#245bdb", label: "蓝色" },
  { value: "#d83931", label: "红色" },
  { value: "#15803d", label: "绿色" },
  { value: "#7c3aed", label: "紫色" },
];
const backgroundColors = [
  { value: "", label: "默认" },
  { value: "#ffe928", label: "黄色" },
  { value: "#bae6fd", label: "蓝色" },
  { value: "#bbf7d0", label: "绿色" },
  { value: "#fbcfe8", label: "粉色" },
];

const markIcons = { bold: "B", italic: "I", underline: "U", strike: "S", code: "‹/›" };

export function DocumentFormatToolbar({ format, blockType, indent }: {
  format: ReturnType<typeof useDocumentFormatting>;
  blockType: {
    expanded: boolean;
    open: (target: HTMLButtonElement, keyboard: boolean) => void;
    preview?: (target: HTMLButtonElement, previous: EventTarget | null) => void;
  };
  indent: { available: boolean; apply: () => void };
}) {
  const panelId = useId();
  const indentReason = useId();
  const boldHint = useId();
  const [active, setActive] = useState("blockType");
  const [nativeNavigation, setNativeNavigation] = useState(false);
  const { selection, marks, paragraph, panel } = format;
  const mac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent);

  function navigate(event: KeyboardEvent<HTMLDivElement>) {
    if (panel && event.key === "Escape") {
      event.stopPropagation();
      format.close();
      return;
    }
    if (nativeNavigation) return;
    const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>("button")];
    const index = buttons.indexOf(event.target as HTMLButtonElement);
    if (index < 0) return;
    let next: number;
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = buttons.length - 1;
    else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
      const direction = (event.key === "ArrowRight") !== rtl ? 1 : -1;
      next = (index + direction + buttons.length) % buttons.length;
    } else return;
    event.preventDefault();
    buttons[next].focus();
  }

  function button(name: string, available = Boolean(selection)) {
    return {
      tabIndex: nativeNavigation ? undefined : active === name ? 0 : -1,
      onFocus: () => setActive(name),
      onMouseDown: (event: MouseEvent) => event.preventDefault(),
      "aria-disabled": !available,
    };
  }

  const href = normalizeLink(format.url);
  return (
    <div className={styles.formatControls}>
      <div role="toolbar" aria-label="选区工具栏" aria-controls="document-body" className={styles.formatToolbar}
        {...{ focusgroup: "toolbar wrap" }}
        ref={(element) => { if (element) setNativeNavigation("focusGroup" in element); }}
        onKeyDown={navigate}>
        <button type="button" {...button("blockType", true)}
          title="块类型" aria-label="块类型" aria-expanded={blockType.expanded} data-toolbar="floating"
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") blockType.preview?.(event.currentTarget, event.relatedTarget);
          }}
          onClick={(event) => blockType.open(event.currentTarget, event.detail === 0)}>
          <span aria-hidden="true" className={styles.typeIcon}>T</span>
        </button>
        <span role="separator" aria-orientation="vertical" className={styles.formatSeparator} />
        <div role="group" aria-label="选区排版" className={styles.formatGroup}>
          {paragraphAlignments.map(({ value, label }) => (
            <button key={value} type="button" {...button(value, paragraph.canAlign)} aria-pressed={paragraph.alignment === value}
              aria-label={label} title={label} onClick={() => paragraph.canAlign && format.applyParagraph({ textAlign: value })}>
              <span aria-hidden="true" className={styles.alignIcon} data-align={value} />
            </button>
          ))}
          <button type="button" {...button("firstLineIndent", paragraph.canIndent)} aria-pressed={paragraph.indented}
            aria-label="首行缩进" title="首行缩进" onClick={() => paragraph.canIndent && format.applyParagraph({ firstLineIndent: !paragraph.indented })}>
            <span aria-hidden="true" className={styles.indentIcon}>⇥</span>
          </button>
          <span className={styles.hintedControl}>
            <button type="button" {...button("indentBlock", indent.available)} aria-label="增加缩进"
              aria-describedby={indent.available ? undefined : indentReason} onClick={indent.apply}>
              <span aria-hidden="true" className={styles.indentIcon}>↳</span>
            </button>
            {!indent.available && <span id={indentReason} role="tooltip" className={styles.formatHint}>无法缩进当前内容块</span>}
          </span>
        </div>
        <span role="separator" aria-orientation="vertical" className={styles.formatSeparator} />
        <div role="group" aria-label="行内样式" className={styles.formatGroup}>
          {toggles.map(({ name, label }) => {
            const bold = name === "bold";
            const control = <button key={name} type="button" {...button(name)} aria-pressed={Boolean(marks[name])}
              aria-label={label} title={bold ? undefined : label} aria-describedby={bold ? boldHint : undefined}
              aria-keyshortcuts={bold ? (mac ? "Meta+B" : "Control+B") : undefined} onClick={() => format.toggle(name)}>
              <span aria-hidden="true" className={styles.markIcon} data-mark={name}>{markIcons[name]}</span>
            </button>;
            return bold ? <span key={name} className={styles.hintedControl}>
              {control}
              <span id={boldHint} role="tooltip" className={styles.formatHint}>
                <span><span aria-hidden="true">粗体 </span>{mac ? "⌘ + B" : "Ctrl + B"}</span>
                <span>Markdown：**文字**</span>
              </span>
            </span> : control;
          })}
        </div>
        <span role="separator" aria-orientation="vertical" className={styles.formatSeparator} />
        <div role="group" aria-label="链接与配色" className={styles.formatGroup}>
          <button type="button" {...button("link")} aria-expanded={panel === "link"}
            aria-label="链接" title="链接" aria-controls={panelId} onClick={() => format.open("link")}>
            <span aria-hidden="true" className={styles.linkIcon} />
          </button>
          <button type="button" {...button("colors")} aria-expanded={panel === "colors"}
            aria-label="文字与背景颜色" title="文字与背景颜色" aria-controls={panelId} onClick={() => format.open("colors")}>
            <span aria-hidden="true" className={styles.colorIcon}>A</span>
          </button>
        </div>
      </div>
      <div id={panelId} hidden={!panel} className={styles.formatPanel}
        onKeyDown={(event) => { if (event.key === "Escape") { event.stopPropagation(); format.close(); } }}>
        {panel === "link" && (
          <form onSubmit={(event) => { event.preventDefault(); if (href) format.apply("link", href); }}>
            <label>链接地址
              <input value={format.url} type="text" inputMode="url" placeholder="example.com"
                onChange={(event) => format.setUrl(event.currentTarget.value)} />
            </label>
            <button type="submit" disabled={!href}>应用</button>
            {marks.link && <button type="button" onClick={() => format.apply("link", null)}>移除链接</button>}
            <button type="button" onClick={format.close}>取消</button>
          </form>
        )}
        {panel === "colors" && (
          <div role="group" aria-label="文字与背景颜色" className={styles.formatGroup}>
            {([["textColor", "文字颜色", textColors], ["backgroundColor", "背景颜色", backgroundColors]] as const).map(([name, label, colors]) => (
              <label key={name}>{label}
                <select value={String(marks[name] ?? "")}
                  onChange={(event) => format.apply(name, event.currentTarget.value || null)}>
                  {colors.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                  {typeof marks[name] === "string" && !colors.some(({ value }) => value === marks[name]) &&
                    <option value={marks[name]}>当前颜色</option>}
                </select>
              </label>
            ))}
            <button type="button" onClick={format.close}>完成</button>
          </div>
        )}
      </div>
    </div>
  );
}
