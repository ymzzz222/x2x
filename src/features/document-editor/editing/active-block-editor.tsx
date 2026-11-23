"use client";

import { ySyncPlugin } from "@tiptap/y-tiptap";
import { EditorContent, Extension, useEditor, type Editor, type JSONContent } from "@tiptap/react";
import { useEffect, useImperativeHandle, useMemo, useRef, useState, type Ref } from "react";
import * as Y from "yjs";
import { documentExtensions, offsetAt, positionAtOffset } from "../model/document-editor-schema";
import type { DocumentBlock } from "../model/document-model";
import { getParagraphFragment } from "../model/document-session";

export const PEER_INSERTION = "〔协作者〕";

const COMPOSITION_SETTLE_DELAY = 32;
const editorProps = {
  attributes: { role: "textbox", "aria-label": "文档正文编辑区", "aria-multiline": "true" },
};

type Edge = "left" | "right" | "up" | "down";
type FocusRequest = { offset: number; scrollIntoView: boolean; columnX?: number };

export type ActiveBlockHandle = {
  simulatePeerEdit: () => void;
  selectAt: (anchor: number, head: number) => void;
  focusAt: (offset: number, scrollIntoView?: boolean, columnX?: number) => void;
  coordsAt: (offset: number) => { left: number; top: number; bottom: number } | null;
  selection: () => { anchor: number; focus: number; anchorPos: number; headPos: number } | null;
  edge: (direction: Edge) => { columnX?: number } | null;
};

type ActiveBlockProps = {
  blockId: string;
  fragment: Y.XmlFragment;
  onCursor: (anchor: number, focus: number, composing: boolean) => void;
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
  editor.commands.focus(start, { scrollIntoView });
}

export function ActiveBlockEditor({ blockId, fragment, onCursor, onBlur, ref }: ActiveBlockProps) {
  const local = fragment.doc!;
  const peerRef = useRef<Y.Doc | null>(null);
  const [composing, setComposing] = useState(false);
  const [converged, setConverged] = useState(true);
  const compositionPending = useRef(false);
  const remoteUpdates = useRef<Uint8Array[]>([]);
  const settleTimer = useRef<number | null>(null);
  const pendingFocus = useRef<FocusRequest | null>(null);
  const extensions = useMemo(() => [
    ...documentExtensions(false),
    Extension.create({
      name: "sharedDocumentSync",
      addProseMirrorPlugins: () => [ySyncPlugin(fragment)],
    }),
  ], [fragment]);

  function reportSelection(editor: Editor) {
    const { anchor, head } = editor.state.selection;
    onCursor(offsetAt(editor.state.doc, anchor), offsetAt(editor.state.doc, head), compositionPending.current || editor.view.composing);
  }

  const editor = useEditor({
    extensions,
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
    };
  }, [local]);

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
    setComposing(true);
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
      setComposing(false);
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
    extensions: documentExtensions(true),
    content,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: { attributes: { "aria-label": "整篇文档" } },
  });

  return <EditorContent data-full-document="" editor={editor} />;
}
