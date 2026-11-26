"use client";

import { canEditDocument } from "./collaboration/model/protocol";
import { defaultRangeExtractor, useVirtualizer } from "@tanstack/react-virtual";
import dynamic from "next/dynamic";
import {
  Fragment,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ClipboardEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import type { ActiveBlockHandle } from "./editing/active-block-editor";
import {
  createDocument,
  getSelectionRange,
  type DocumentPosition,
  type DocumentSelection,
  type SampleSize,
} from "./model/document-model";
import { DocumentAppearanceControls, DocumentAppearanceTitle, DocumentCover, useDocumentAppearance } from "./view/document-appearance";
import { DocumentBlockTools, FloatingSelectionTools } from "./editing/document-block-tools";
import { documentKey, useNativeHistory } from "./editing/document-key";
import { readClipboard, writeClipboard, type RangeEdit } from "./model/document-clipboard";
import type { FoldChange } from "./model/document-history";
import { useDocumentFormatting } from "./editing/document-format-toolbar";
import { DocumentFindPanel, useDocumentFind } from "./view/document-find-panel";
import { getDocumentOutline, projectDocumentRows, revealDocumentRow, toggleOutlineFold, updateBodyFolds, type DocumentFolds, type DocumentSection } from "./model/document-outline";
import { copyAnchor, DocumentOutlinePanel, readFoldPreference, writeFoldPreference } from "./view/document-outline-panel";
import { DocumentRow } from "./view/document-row";
import { DocumentWindow } from "./view/document-window";
import { DocumentPresentation, DocumentPrintView } from "./view/document-presentation";
import { DocumentSession } from "./model/document-session";
import { DocumentInfoAction, DocumentViewControls, EditorPreviewControls, getFocusedFoldAnchor, getViewportAnchor, readPaperWidth, restoreViewportAnchor, writePaperWidth, type DocumentView, type SharedEditorSettings, type ViewportAnchor } from "./view/document-view-controls";
import { DocumentAction, DocumentActions, DocumentEditorHeader } from "./view/document-header";
import structureStyles from "./view/document-structure.module.css";
import styles from "./editor.module.css";
import { useDocumentBlocks } from "./editing/use-document-blocks";
import { expandQuoteSelection, positionFromPoint, selectedRowRange, useDocumentSelection } from "./editing/use-document-selection";

const ActiveBlockEditor = lazy(
  () => import("./editing/active-block-editor").then((module) => ({ default: module.ActiveBlockEditor })),
);
const EditorBaseline = dynamic(
  () => import("./editing/active-block-editor").then((module) => module.EditorBaseline),
  { ssr: false },
);

type Mode = "window" | "full";
export default function EditorLab({ mode, size, shared }: { mode: Mode; size?: SampleSize; shared?: SharedEditorSettings }) {
  const appearance = useDocumentAppearance(size);
  const [session] = useState(() => shared?.session ?? new DocumentSession(size
    ? createDocument(size) : [{ id: "block-1", text: "", kind: "paragraph" }]));
  const blocks = useSyncExternalStore(session.subscribe, session.getBlocks, session.getBlocks);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);
  const [selection, setSelection] = useState<DocumentSelection | null>(null);
  const [status, setStatus] = useState("");
  const [preference, setView] = useState<DocumentView>({ mode: "edit", width: "default" });
  const canEdit = !shared || canEditDocument(shared.role);
  const view = useMemo<DocumentView>(() => canEdit ? preference : { ...preference, mode: "read" }, [canEdit, preference]);
  const viewKey = shared?.id ?? size;
  const foldKey = viewKey && "x2x:document-folds:" + viewKey;
  const storedFolds = useRef(new Set<string>());
  const [folds, setFolds] = useState<DocumentFolds>(() => ({ body: new Set(), outline: new Set() }));
  const collapsed = folds.body;
  const toggleOutline = useCallback((id: string) => setFolds((current) => toggleOutlineFold(current, id)), []);
  const applyFoldChange = useCallback(({ ids, folded }: FoldChange) => {
    const update = (sections: Set<string>) => {
      for (const id of ids) {
        if (folded) sections.add(id);
        else sections.delete(id);
      }
      return sections;
    };
    update(storedFolds.current);
    if (foldKey) writeFoldPreference(foldKey, storedFolds.current);
    setFolds((current) => updateBodyFolds(current, update(new Set(current.body))));
  }, [foldKey]);
  const viewport = useRef<HTMLDivElement>(null);
  const activeEditor = useRef<ActiveBlockHandle>(null);
  const initialFocus = useRef<{ offset: number; scrollIntoView: boolean; columnX?: number }>({ offset: 0, scrollIntoView: false });
  const pendingJump = useRef<ViewportAnchor | null>(null);
  const windowed = mode === "window";
  const editable = windowed && view.mode === "edit";
  const linkBlockId = activeId ?? selection?.focus.blockId;
  const blockIndexes = useMemo(() => new Map(blocks.map((block, index) => [block.id, index])), [blocks]);
  const outline = useMemo(() => getDocumentOutline(blocks), [blocks]);
  const rows = useMemo(
    () => projectDocumentRows(blocks.length, outline.sections, collapsed),
    [blocks.length, collapsed, outline],
  );
  const activeIndex = activeId ? blockIndexes.get(activeId) : undefined;
  const activeRow = activeIndex === undefined ? undefined : rows.positions.get(activeIndex);
  const activeFragment = activeId ? session.fragmentFor(activeId) : undefined;
  const selectionRange = useMemo(
    () => selection ? getSelectionRange(blocks, selection) : null,
    [blocks, selection],
  );
  const hasSelection = Boolean(selectionRange && (
    selectionRange.startIndex !== selectionRange.endIndex ||
    selectionRange.startOffset !== selectionRange.endOffset
  ));

  // eslint-disable-next-line react-hooks/incompatible-library -- The viewport owns live measurement state.
  const virtualizer = useVirtualizer({
    enabled: windowed,
    count: rows.indexes.length,
    getScrollElement: () => viewport.current,
    // Retain measured offscreen heights as estimates across resizes. Mounted rows remeasure.
    getItemKey: (index) => blocks[rows.indexes[index]].id,
    estimateSize: (index) => Math.max(50, 32 + Math.ceil(blocks[rows.indexes[index]].text.length / 35) * 28),
    overscan: 5,
    rangeExtractor: (range) => {
      const indexes = defaultRangeExtractor(range);
      const anchor = pendingJump.current;
      const focused = anchor?.keepMounted ? blockIndexes.get(anchor.blockId) : undefined;
      const focusedRow = focused === undefined ? undefined : rows.positions.get(focused);
      for (const row of [activeRow, focusedRow]) if (row !== undefined && !indexes.includes(row)) indexes.push(row);
      return indexes.sort((first, second) => first - second);
    },
  });
  const visible = virtualizer.getVirtualItems();
  const jumpTo = useCallback((index: number, withinRow?: number) => {
    if (!windowed) {
      viewport.current?.querySelector(".tiptap")?.children[index]?.scrollIntoView({ block: "start" });
      return;
    }
    const row = rows.positions.get(index);
    if (row !== undefined) {
      const start = withinRow ? virtualizer.getOffsetForIndex(row, "start") : null;
      if (start) virtualizer.scrollToOffset(start[0] + withinRow!);
      else virtualizer.scrollToIndex(row, { align: "start" });
    } else if (blocks[index]) {
      pendingJump.current = { blockId: blocks[index].id, withinRow };
      setFolds((current) => updateBodyFolds(current, revealDocumentRow(index, outline.sections, current.body)));
    }
  }, [blocks, outline, rows, virtualizer, windowed]);
  const jumpToHash = useEffectEvent(() => {
    const index = blockIndexes.get(window.location.hash.slice(1));
    if (index !== undefined) jumpTo(index);
  });
  const restoreView = useEffectEvent(() => {
    if (windowed && viewKey) {
      const width = readPaperWidth(viewKey);
      if (width !== "default") setView((current) => ({ ...current, width }));
    }
    storedFolds.current = windowed && foldKey ? readFoldPreference(foldKey) : new Set();
    if (!storedFolds.current.size) {
      jumpToHash();
      return;
    }
    const id = window.location.hash.slice(1);
    const index = blockIndexes.get(id);
    if (index !== undefined) pendingJump.current = { blockId: id };
    const saved = new Set(storedFolds.current);
    setFolds((current) => updateBodyFolds(current, index === undefined ? saved : revealDocumentRow(index, outline.sections, saved)));
  });

  useEffect(() => {
    function handleHashChange() { jumpToHash(); }
    restoreView();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useLayoutEffect(() => {
    const target = pendingJump.current;
    if (!target) return;
    pendingJump.current = null;
    const index = blockIndexes.get(target.blockId);
    if (index === undefined) return;
    const row = rows.positions.get(index);
    if (!restoreViewportAnchor(target, row, viewport.current, virtualizer)) jumpTo(index);
  }, [blockIndexes, jumpTo, rows, view, virtualizer]);

  const isComposing = useCallback(() => Boolean(viewport.current?.querySelector('[data-composing="true"]')), []);

  function changeView(next: DocumentView) {
    if ((!canEdit && next.mode === "edit") || (next.mode === view.mode && next.width === view.width) || isComposing()) return;
    pendingJump.current = getViewportAnchor(viewport.current);
    if (next.mode !== view.mode) blockTools.reset();
    if (next.mode === "read" && activeId) {
      session.endTyping();
      setActiveId(null);
    }
    if (viewKey && next.width !== view.width) writePaperWidth(viewKey, next.width);
    setView(next);
  }

  const toggleSection = useCallback((section: DocumentSection) => {
    if (isComposing()) return;
    const opening = collapsed.has(section.id);
    const isInside = (index: number) => section.index < index && index < section.end;
    if (!opening && activeIndex !== undefined && isInside(activeIndex)) {
      session.endTyping();
      setActiveId(null);
      setSelection(null);
    }
    const focused = getFocusedFoldAnchor(viewport.current, section.id);
    const firstRow = virtualizer.range?.startIndex ?? 0;
    const readingIndex = rows.indexes[firstRow];
    if (focused) pendingJump.current = focused;
    else if (readingIndex > section.index) {
      const row = virtualizer.getVirtualItems().find((item) => item.index === firstRow);
      pendingJump.current = !opening && isInside(readingIndex)
        ? { blockId: section.id }
        : { blockId: blocks[readingIndex].id, withinRow: row && (virtualizer.scrollOffset ?? 0) - row.start };
    }
    if (editable) session.fold(section.id, !opening);
    applyFoldChange({ ids: [section.id], folded: !opening });
  }, [activeIndex, applyFoldChange, blocks, collapsed, editable, isComposing, rows, session, virtualizer]);

  const attachEditor = useCallback((editor: ActiveBlockHandle | null) => {
    activeEditor.current = editor;
    const { offset, scrollIntoView, columnX } = initialFocus.current;
    editor?.focusAt(offset, scrollIntoView, columnX);
  }, []);

  const clearCursor = useEffectEvent(() => shared?.onCursor?.(null));
  useEffect(() => { if (!editable || activeRow === undefined) clearCursor(); }, [activeRow, editable]);

  const standalone = !shared;
  useEffect(() => () => { if (standalone) session.destroy(); }, [session, standalone]);
  function activate(position: DocumentPosition, scrollIntoView = false, columnX?: number) {
    if (!editable || isComposing()) return;
    session.prepare();
    if (collapsed.size) {
      const current = session.getBlocks();
      const index = current === blocks ? blockIndexes.get(position.blockId) : current.findIndex((block) => block.id === position.blockId);
      const sections = current === blocks ? outline.sections : getDocumentOutline(current).sections;
      const next = index === undefined || index < 0 ? collapsed : revealDocumentRow(index, sections, collapsed);
      if (next !== collapsed) {
        pendingJump.current = { blockId: position.blockId };
        setFolds((current) => updateBodyFolds(current, next));
      }
    }
    if (position.blockId !== activeId) session.endTyping();
    session.setLocation({ position, editing: true });
    initialFocus.current = { offset: position.offset, scrollIntoView, columnX };
    setSelection({ anchor: position, focus: position });
    if (position.blockId === activeId) activeEditor.current?.focusAt(position.offset, scrollIntoView, columnX);
    setActiveId(position.blockId);
  }

  function selectRange(nextSelection: DocumentSelection) {
    if (isComposing()) return;
    if (activeId) session.endTyping();
    if (document.activeElement !== viewport.current) viewport.current?.focus({ preventScroll: true });
    setActiveId(null);
    setSelection(nextSelection);
  }

  function activeSelection() {
    const caret = activeEditor.current?.selection();
    if (!activeId || !caret) return null;
    return { anchor: { blockId: activeId, offset: caret.anchor }, focus: { blockId: activeId, offset: caret.focus } };
  }

  function restoreFormatSelection(range: DocumentSelection) {
    if (activeEditor.current && activeId === range.anchor.blockId && activeId === range.focus.blockId) {
      activeEditor.current.selectAt(range.anchor.offset, range.focus.offset);
      setSelection(range);
    } else selectRange(range);
  }
  const formatting = useDocumentFormatting(blocks, editable ? selection : null, hasSelection,
    (range, command) => {
      if (isComposing()) return false;
      const changed = "mark" in command
        ? session.formatRange(range, command.mark, command.value, Boolean(activeId))
        : session.formatParagraphs(range, command, Boolean(activeId));
      if (changed) restoreFormatSelection(range);
      return changed;
    }, restoreFormatSelection, activeSelection);
  const blockTools = useDocumentBlocks({
    blocks, session, outline: outline.sections, branches: outline.branches, folded: collapsed, viewport, activeId, selection, editable, composing, isComposing,
    readCaret: () => activeEditor.current?.selection() ?? null,
    select: selectRange, restoreSelection: restoreFormatSelection, activate, applyFoldChange, status: setStatus,
    focusBlock(position) {
      selectRange({ anchor: position, focus: position });
      pendingJump.current = { blockId: position.blockId };
    },
  });
  const selectionHandlers = useDocumentSelection((range) => selectRange(expandQuoteSelection(range, blocks, blockIndexes)), isComposing);
  function handleRowClick(event: MouseEvent<HTMLDivElement>) {
    if ((event.target as Element).closest("button")) return;
    blockTools.reset();
    if (editable && !event.metaKey && !event.ctrlKey && (event.target as Element).closest("a")) event.preventDefault();
    const position = positionFromPoint(event.currentTarget, event.clientX, event.clientY);
    if (event.shiftKey && selection) {
      const caret = activeEditor.current?.selection();
      const anchor = activeId && caret ? { blockId: activeId, offset: caret.anchor } : selection.anchor;
      selectRange({ anchor, focus: position });
    } else if (!editable) {
      selectRange({ anchor: position, focus: position });
    } else if (!(event.target as Element).closest(".tiptap") && blocks[Number(event.currentTarget.dataset.blockIndex)]?.structure?.firstChild?.type.name !== "horizontalRule") {
      activate(position);
    }
  }

  function replaceRange(range: DocumentSelection, operation: RangeEdit) {
    const result = session.replaceRange(range, operation, { editing: Boolean(activeId) });
    if (!result) return;
    if (result.editing) activate(result.position, true);
    else {
      pendingJump.current = { blockId: result.position.blockId };
      setSelection(null);
    }
    setStatus(operation === "delete" ? activeId ? "已合并段落" : "已删除选区" : "");
  }

  function changeHistory(redo: boolean) {
    blockTools.closeForHistory();
    const location = session.undo(redo);
    if (!location) return;
    if (location.foldChange) applyFoldChange(location.foldChange);
    if (location.selection) {
      if (location.restoreActiveSelection) restoreFormatSelection(location.selection);
      else selectRange(location.selection);
      pendingJump.current = { blockId: location.position.blockId };
    } else if (location.editing && session.fragmentFor(location.position.blockId)) {
      activate(location.position, true);
    } else {
      viewport.current?.focus({ preventScroll: true });
      setActiveId(null);
      setSelection(null);
      pendingJump.current = { blockId: location.position.blockId };
    }
    setStatus(redo ? "已重做" : "已撤销");
  }

  useNativeHistory(viewport, windowed, editable, isComposing, changeHistory);

  function handleKeys(event: KeyboardEvent<HTMLDivElement>) {
    documentKey(event, {
      windowed, editable, blocks, activeId, activeIndex, selection, selectionRange, hasSelection, blockIndexes,
      firstVisibleIndex: rows.indexes[virtualizer.range?.startIndex ?? 0],
      viewport, readEditor: () => activeEditor.current, isComposing,
      blockShortcut: blockTools.keydown, formatShortcut: (event) => formatting.shortcut(event, blockTools.reset),
      selectRange, changeHistory, resetBlockTools: blockTools.reset, activate, replaceRange, jumpTo,
    });
  }

  function handleClipboard(event: ClipboardEvent<HTMLDivElement>) {
    if (shared?.copyAllowed === false && event.type !== "paste") { event.preventDefault(); return; }
    if (!windowed || isComposing() || !event.clipboardData || blockTools.clipboard(event)) return;
    const copy = event.type === "copy";
    if ((copy && activeId) || (!copy && !editable)) return;
    if (activeIndex !== undefined && blocks[activeIndex]?.structure && activeSelection()) {
      // ProseMirror keeps native clipboard edits inside the current list item or column.
      session.endTyping();
      queueMicrotask(() => session.endTyping());
      return;
    }
    const range = activeId ? activeSelection() : selection;
    if (!range) return;
    const paste = event.type === "paste";
    const current = session.getBlocks();
    const operation = paste ? readClipboard(event.clipboardData) : "delete";
    if (!paste && !writeClipboard(event.clipboardData, current, range, session.contentFor, outline.sections)) return;
    event.preventDefault();
    event.stopPropagation();
    if (copy) {
      setStatus("已复制选区");
    } else if (operation) {
      const result = session.replaceRange(range, operation, { editing: Boolean(activeId), clipboard: true });
      if (result) {
        activate(result.position, true);
        setStatus(paste ? "已粘贴" : "已剪切选区");
      }
    }
  }

  const find = useDocumentFind({
    enabled: windowed,
    blocks,
    viewport,
    onLocate(match) {
      if (isComposing()) return;
      if (activeId) session.endTyping();
      setActiveId(null);
      setSelection(null);
      if (!viewport.current?.contains(document.getElementById(match.blockId))) jumpTo(match.blockIndex);
    },
    onReplace(matches, value) {
      const count = !editable || isComposing() ? 0 : session.replaceMatches(matches, value);
      if (count) {
        setActiveId(null);
        setSelection(null);
      }
      return { count, blocks: session.getBlocks() };
    },
  });

  const HeaderActions = shared ? DocumentActions : Fragment;
  return (
    <main className={styles.lab} lang="zh-CN" data-block-count={blocks.length} data-sample-size={size}
      data-print={shared && (shared.printAllowed === false ? "disabled" : "allowed")} onCopyCapture={(event) => {
        if (shared?.copyAllowed === false && (event.target as Element).closest("[data-scroll-viewport], [data-presentation-viewport]")) event.preventDefault();
      }}>
      {shared?.watermark && <div aria-hidden="true" className={styles.watermark}>{shared.watermark}</div>}
      {shared && shared.printAllowed !== false && <DocumentPrintView title={shared.title} blocks={blocks} sections={outline.sections} />}
      <DocumentEditorHeader status={windowed ? status : undefined}
        shared={shared && { title: shared.title, rename: canEdit ? shared.rename : undefined, avatars: shared.avatars }}
        title={!shared && <DocumentAppearanceTitle value={appearance.appearance} />}
        cover={!shared && <DocumentCover value={appearance.appearance} />}
        preview={!shared && <EditorPreviewControls blocks={blocks} mounted={windowed ? visible.length : blocks.length}
          showInfo={appearance.appearance.showInfo} size={size} mode={mode} onJump={jumpTo}
          simulate={editable ? () => activeEditor.current?.simulatePeerEdit() : undefined} canSimulate={Boolean(activeId)} />}>
        {windowed && (
          <HeaderActions>
            {shared?.controls}
            {shared?.documentActions}
            {shared && <DocumentInfoAction blocks={blocks} />}
            {shared?.discussion?.(selection, (range) => {
              const index = blockIndexes.get(range.focus.blockId);
              if (index !== undefined) jumpTo(index);
              restoreFormatSelection(range);
            }, ({ blockId, withinRow }) => jumpTo(blockIndexes.get(blockId) ?? -1, withinRow), (position) => activate(position, true))}
            <DocumentViewControls view={view} onChange={changeView} canEdit={canEdit} />
            <DocumentAction><button type="button" disabled={!linkBlockId} onClick={() => {
              if (linkBlockId) void copyAnchor(new URL("#" + linkBlockId, window.location.href).href, setStatus, "块");
            }}>复制块链接</button></DocumentAction>
            {editable && !shared && <DocumentAppearanceControls settings={appearance} />}
            <DocumentPresentation blocks={blocks} size={size} documentKey={shared?.id} isComposing={isComposing} comments={shared?.presentationComments} />
            <DocumentAction><button type="button" aria-haspopup="dialog" aria-expanded={find.open}
              aria-controls={find.open ? find.id : undefined} onClick={() => find.openPanel(editable ? "replace" : "find")}>
              {editable ? "查找替换" : "查找"}
            </button></DocumentAction>
          </HeaderActions>
        )}
      </DocumentEditorHeader>
      {find.open && <DocumentFindPanel find={find} editable={editable} />}
      <div className={styles.workspace} data-outline={windowed}>
        {windowed && (
          <DocumentOutlinePanel roots={outline.roots} collapsed={folds.outline} onToggle={toggleOutline} onJump={jumpTo} onStatus={setStatus} />
        )}
        <div ref={viewport} id="document-body" data-scroll-viewport="" className={styles.viewport}
          tabIndex={0} role="region" aria-label="文档正文" onKeyDownCapture={handleKeys}
          onCopy={handleClipboard} onCutCapture={handleClipboard} onPasteCapture={handleClipboard} onInputCapture={blockTools.startInput}
          onPointerDownCapture={(event) => { if (!(event.target as Element).closest("button")) blockTools.reset(); }}
          onPointerMoveCapture={blockTools.pointerMove} onPointerUpCapture={blockTools.pointerEnd}
          onPointerCancelCapture={blockTools.pointerEnd}
          {...(windowed ? selectionHandlers : {})}
          onLostPointerCapture={(event) => {
            blockTools.pointerEnd(event);
            if (windowed) selectionHandlers.onLostPointerCapture(event);
          }}>
          <div className={styles.paper + " " + structureStyles.content} data-page-width={view.width}>
            {windowed ? (
              <DocumentWindow blocks={blocks} branches={outline.branches} height={virtualizer.getTotalSize()} rows={visible.map((item) => {
                  const documentIndex = rows.indexes[item.index];
                  const block = blocks[documentIndex];
                  const active = editable && block.id === activeId ? activeFragment : undefined;
                  return { block, content: (
                    <DocumentRow item={item} block={block} documentIndex={documentIndex} tools={blockTools}
                      editable={editable} onClick={handleRowClick} measure={virtualizer.measureElement}
                      section={outline.sections.get(block.id)} branch={outline.branches.get(block.id)}
                      collapsed={collapsed.has(block.id)} onToggle={toggleSection}
                      selection={selectedRowRange(hasSelection ? selectionRange : null, documentIndex, block.text.length)}
                      matches={find.byBlock.get(block.id)}
                      currentMatch={find.activeMatch?.blockId === block.id ? find.activeMatch : undefined}
                      showEmptyHint={editable && !shared && !size && !block.text && !block.structure}
                      session={session} peers={shared?.collaborators} activeEditor={active ? activeEditor : undefined}
                      renderEditor={active ? (preview) => (
                        <Suspense fallback={preview}>
                          <ActiveBlockEditor key={block.id} ref={attachEditor} blockId={block.id} fragment={active}
                            preview={preview} composing={composing} onCompositionChange={setComposing}
                            onBlur={() => shared?.onCursor?.(null)} onCursor={(anchor, offset, composing, slash) => {
                              const position = { blockId: block.id, offset };
                              blockTools.observeSlash(block.id, slash);
                              session.setLocation({ position, editing: true });
                              if (!composing) shared?.onCursor?.(position);
                              setSelection((current) => anchor === offset && current?.anchor.offset === current?.focus.offset
                                ? current : { anchor: { blockId: block.id, offset: anchor }, focus: position });
                            }} />
                        </Suspense>
                      ) : undefined} />
                  ) };
                })} />
            ) : (
              <EditorBaseline blocks={blocks} />
            )}
          </div>
        </div>
      </div>
      {editable && <DocumentBlockTools tools={blockTools} viewport={viewport} count={blocks.length} copyAllowed={shared?.copyAllowed}
        onCopyLink={(id) => void copyAnchor(new URL("#" + id, window.location.href).href, setStatus, "块")} />}
      {windowed && canEdit && <FloatingSelectionTools selection={blockTools.showFloating ? selection : null} viewport={viewport}
        format={formatting} tools={blockTools} restoreSelection={restoreFormatSelection}
        onEdit={editable ? undefined : () => { changeView({ ...view, mode: "edit" }); viewport.current?.focus(); }} />}
    </main>
  );
}
