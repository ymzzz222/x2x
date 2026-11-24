"use client";

import { ySyncPlugin, yXmlFragmentToProseMirrorRootNode } from "@tiptap/y-tiptap";
import { EditorContent, Extension, useEditor, type Editor, type JSONContent } from "@tiptap/react";
import { useEffect, useImperativeHandle, useMemo, useRef, useState, type Ref } from "react";
import * as Y from "yjs";
import { normalizePastedText } from "../model/document-clipboard";
import { documentExtensions, documentSchema, offsetAt, positionAtOffset } from "../model/document-editor-schema";
import type { DocumentBlock } from "../model/document-model";
import { getParagraphFragment } from "../model/document-session";
import { DocumentBlockViews } from "../view/document-block-dom";

export const PEER_INSERTION = "〔协作者〕";

const COMPOSITION_SETTLE_DELAY = 32;
const editorProps = {
  attributes: { role: "textbox", "aria-label": "文档正文编辑区", "aria-multiline": "true" },
  transformPastedText: normalizePastedText,
};

type Edge = "left" | "right" | "up" | "down";
type FocusRequest = { offset: number; scrollIntoView: boolean; columnX?: number };
export type SlashInput = { from: number; to: number; offset: number; query: string; insideQuote: boolean };

export type ActiveBlockHandle = {
  simulatePeerEdit: () => void;
  selectAt: (anchor: number, head: number) => void;
  selectParagraph: () => boolean;
  focusAt: (offset: number, scrollIntoView?: boolean, columnX?: number) => void;
  coordsAt: (offset: number) => { left: number; top: number; bottom: number } | null;
  selection: () => { anchor: number; focus: number; anchorPos: number; headPos: number } | null;
  edge: (direction: Edge) => { columnX?: number } | null;
};

type ActiveBlockProps = {
  blockId: string;
  fragment: Y.XmlFragment;
  composing: boolean;
  onCompositionChange: (composing: boolean) => void;
  onCursor: (anchor: number, focus: number, composing: boolean, slash: SlashInput | null) => void;
  onBlur?: () => void;
  ref?: Ref<ActiveBlockHandle>;
};

function focusEditorAt(editor: Editor, { offset, scrollIntoView, columnX }: FocusRequest) {
  let start = positionAtOffset(editor.state.doc, offset);
  if (columnX !== undefined) {
    const { top, bottom } = editor.view.coordsAtPos(start);
    const hit = editor.view.posAtCoords({ left: columnX, top: (top + bottom) / 2 });
    if (hit) start = hit.pos;
  }
  if (!editor.view.hasFocus()) {
    editor.commands.focus(start, { scrollIntoView });
    return;
  }
  // Focusing again on the next frame can overwrite a new native selection.
  const selection = editor.state.selection;
  if (!selection.empty || selection.head !== start) editor.commands.setTextSelection(start);
  if (scrollIntoView) editor.commands.scrollIntoView();
}

export function ActiveBlockEditor({ blockId, fragment, composing, onCompositionChange, onCursor, onBlur, ref }: ActiveBlockProps) {
  const local = fragment.doc!;
  const peerRef = useRef<Y.Doc | null>(null);
  const [converged, setConverged] = useState(true);
  const compositionPending = useRef(false);
  const remoteUpdates = useRef<Uint8Array[]>([]);
  const settleTimer = useRef<number | null>(null);
  const pendingFocus = useRef<FocusRequest | null>(null);
  const initialContent = useMemo(() => yXmlFragmentToProseMirrorRootNode(fragment, documentSchema()).toJSON(), [fragment]);
  const extensions = useMemo(() => [
    ...documentExtensions(false),
    DocumentBlockViews,
    Extension.create({
      name: "sharedDocumentSync",
      addProseMirrorPlugins: () => [ySyncPlugin(fragment)],
    }),
  ], [fragment]);

  function reportSelection(editor: Editor) {
    const { anchor, head, empty, $head } = editor.state.selection;
    const activeComposition = compositionPending.current || editor.view.composing;
    const offset = offsetAt(editor.state.doc, head);
    const query = !activeComposition && empty && $head.parent.type.name === "paragraph"
      ? /^\/([^\n/]{0,35})$/.exec($head.parent.textBetween(0, $head.parentOffset, "\n", "\n"))
      : null;
    let insideQuote = false;
    if (query) {
      for (let depth = $head.depth - 1; depth > 0; depth--) {
        if ($head.node(depth).type.name === "blockquote") insideQuote = true;
      }
    }
    onCursor(offsetAt(editor.state.doc, anchor), offset, activeComposition,
      query ? { from: $head.start(), to: head, offset, query: query[1], insideQuote } : null);
  }

  const editor = useEditor({
    extensions,
    content: initialContent,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps,
    onSelectionUpdate: ({ editor }) => {
      if (editor.view.hasFocus()) reportSelection(editor);
    },
    onFocus: ({ editor }) => reportSelection(editor),
    onBlur: () => onBlur?.(),
  }, [fragment]);

  useEffect(() => {
    function forwardLocal(update: Uint8Array, origin: unknown) {
      const peer = peerRef.current;
      if (peer && origin !== peer) Y.applyUpdate(peer, update, local);
    }

    local.on("update", forwardLocal);
    return () => {
      local.off("update", forwardLocal);
      peerRef.current?.destroy();
      peerRef.current = null;
      if (settleTimer.current !== null) window.clearTimeout(settleTimer.current);
      if (compositionPending.current) {
        compositionPending.current = false;
        onCompositionChange(false);
      }
    };
  }, [local, onCompositionChange]);

  useEffect(() => {
    if (!editor || pendingFocus.current === null) return;
    const request = pendingFocus.current;
    pendingFocus.current = null;
    focusEditorAt(editor, request);
  }, [editor]);

  useImperativeHandle(ref, () => ({
    selectAt(anchor, head) {
      if (!editor || compositionPending.current || editor.view.composing) return;
      const doc = editor.state.doc;
      editor.commands.setTextSelection({ from: positionAtOffset(doc, anchor), to: positionAtOffset(doc, head) });
      editor.view.focus();
    },
    selectParagraph() {
      if (!editor || compositionPending.current || editor.view.composing || !editor.view.hasFocus()) return false;
      const { $head, from, to } = editor.state.selection;
      if (!$head.parent.isTextblock) return false;
      const start = $head.start();
      const end = $head.end();
      if (start === end || (from === start && to === end)) return false;
      return editor.commands.setTextSelection({ from: start, to: end });
    },
    focusAt(offset, scrollIntoView = false, columnX) {
      const request = { offset, scrollIntoView, columnX };
      if (editor?.view.dom.isConnected) focusEditorAt(editor, request);
      else pendingFocus.current = request;
    },
    coordsAt(offset) {
      if (!editor || editor.isDestroyed || !editor.view.dom.isConnected) return null;
      return editor.view.coordsAtPos(positionAtOffset(editor.state.doc, offset));
    },
    selection() {
      if (!editor || compositionPending.current || editor.view.composing || !editor.view.hasFocus()) return null;
      const { view } = editor;
      const native = view.dom.ownerDocument.getSelection();
      // Arrow keys can move the browser caret before ProseMirror handles selectionchange.
      if (native?.anchorNode && native.focusNode &&
        view.dom.contains(native.anchorNode) && view.dom.contains(native.focusNode)) {
        const anchorPos = view.posAtDOM(native.anchorNode, native.anchorOffset);
        const headPos = view.posAtDOM(native.focusNode, native.focusOffset);
        return { anchor: offsetAt(editor.state.doc, anchorPos), focus: offsetAt(editor.state.doc, headPos), anchorPos, headPos };
      }
      const { anchor, head } = editor.state.selection;
      return { anchor: offsetAt(editor.state.doc, anchor), focus: offsetAt(editor.state.doc, head), anchorPos: anchor, headPos: head };
    },
    edge(direction) {
      if (!editor || compositionPending.current || editor.view.composing || !editor.view.hasFocus()) return null;
      const { head, $head } = editor.state.selection;
      const backward = direction === "left" || direction === "up";
      const outerIndex = backward ? 0 : editor.state.doc.childCount - 1;
      if ($head.index(0) !== outerIndex || !editor.view.endOfTextblock(direction)) return null;
      return direction === "up" || direction === "down" ? { columnX: editor.view.coordsAtPos(head).left } : {};
    },
    simulatePeerEdit() {
      let peer = peerRef.current;
      if (!peer) {
        peer = new Y.Doc();
        peerRef.current = peer;
        Y.applyUpdate(peer, Y.encodeStateAsUpdate(local), local);
        const simulatedPeer = peer;
        peer.on("update", (update: Uint8Array, origin: unknown) => {
          if (origin === local) return;
          if (compositionPending.current) {
            remoteUpdates.current.push(update);
            setConverged(false);
          } else {
            Y.applyUpdate(local, update, simulatedPeer);
            setConverged(fragment.toString() === getParagraphFragment(simulatedPeer, blockId)?.toString());
          }
        });
      }
      const body = getParagraphFragment(peer, blockId);
      if (!body) return;
      const index = editor?.state.selection.$head.index(0) ?? 0;
      const paragraph = body.get(Math.min(index, body.length - 1));
      if (!(paragraph instanceof Y.XmlElement)) return;

      peer.transact(() => {
        const text = paragraph.toArray().findLast((child) => child instanceof Y.XmlText);
        if (text instanceof Y.XmlText) {
          text.insert(text.length, PEER_INSERTION);
        } else {
          const newText = new Y.XmlText();
          paragraph.insert(paragraph.length, [newText]);
          newText.insert(0, PEER_INSERTION);
        }
      });
    },
  }), [blockId, editor, fragment, local]);

  function beginComposition() {
    if (settleTimer.current !== null) window.clearTimeout(settleTimer.current);
    settleTimer.current = null;
    compositionPending.current = true;
    onCompositionChange(true);
  }

  function finishComposition() {
    function settle() {
      if (editor?.view.composing) {
        settleTimer.current = window.setTimeout(settle, COMPOSITION_SETTLE_DELAY);
        return;
      }
      settleTimer.current = null;
      compositionPending.current = false;
      const updates = remoteUpdates.current;
      remoteUpdates.current = [];
      if (updates.length) {
        Y.applyUpdate(local, Y.mergeUpdates(updates), peerRef.current);
      }
      const peer = peerRef.current;
      setConverged(!peer || fragment.toString() === getParagraphFragment(peer, blockId)?.toString());
      onCompositionChange(false);
      // The last selection transaction can run while composition is still pending.
      if (editor && !editor.isDestroyed && editor.view.hasFocus()) reportSelection(editor);
    }

    // Let the editor read the browser's final composition mutation before applying peer writes.
    if (settleTimer.current !== null) window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(settle, COMPOSITION_SETTLE_DELAY);
  }

  return (
    <div
      data-editor-active="true"
      data-composing={composing}
      data-peer-converged={converged}
      onCompositionStartCapture={beginComposition}
      onCompositionEndCapture={finishComposition}
    >
      <EditorContent editor={editor} />
    </div>
  );
}

export function EditorBaseline({ blocks }: { blocks: DocumentBlock[] }) {
  const content = useMemo<JSONContent>(
    () => ({
      type: "doc",
      content: blocks.map((block) => ({
        type: block.kind,
        attrs: block.kind === "heading" ? { level: block.level ?? 1 } : undefined,
        content: [{ type: "text", text: block.text }],
      })),
    }),
    [blocks],
  );

  const editor = useEditor({
    extensions: [...documentExtensions(true), DocumentBlockViews],
    content,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: { attributes: { "aria-label": "整篇文档" } },
  });

  return <EditorContent data-full-document="" editor={editor} />;
}
