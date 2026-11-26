import { documentSchema } from "../../../src/features/document-editor/model/document-editor-schema";
import { getSchema } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { prosemirrorToYXmlFragment } from "@tiptap/y-tiptap";
import { listWindows, visibleText, type BlockKind } from "../../../src/features/document-editor/model/document-structure";
import { getDocumentOutline, projectDocumentRows, revealDocumentRow } from "../../../src/features/document-editor/model/document-outline";
import { describe, expect, it } from "vitest";
import * as Y from "yjs";
import { DocumentSession } from "../../../src/features/document-editor/model/document-session";
import { DocumentHistory } from "../../../src/features/document-editor/model/document-history";
import { projectCompatibleBlocks } from "../../../src/features/document-editor/model/document-projection";
import {
  createDocument,
  deleteSelectedText,
  findDocumentMatches,
  getSelectedText,
  getSelectionRange,
  headingLevels,
  selectDocument,
  type DocumentBlock,
  type DocumentSelection,
} from "../../../src/features/document-editor/model/document-model";

const blocks: DocumentBlock[] = [
  { id: "block-1", text: "甲乙丙", kind: "heading" },
  { id: "block-2", text: "中间段", kind: "paragraph" },
  { id: "block-3", text: "丁🙂戊己", kind: "paragraph" },
  { id: "block-4", text: "结尾段", kind: "paragraph" },
];

describe("local fold history", () => {
  it("remains private and preserves chronology when a remote change invalidates the newest content undo", () => {
    const document = new Y.Doc();
    const peer = new Y.Doc();
    const content = document.getMap<string>("content");
    const origin = Symbol("Author edit");
    const history = new DocumentHistory(new Y.UndoManager(content, { trackedOrigins: new Set([origin]) }), origin);
    const location = { position: { blockId: "chapter", offset: 0 }, editing: true };
    const local = (key: string) => history.edit(location, location, () => document.transact(() => content.set(key, "Author"), origin));
    try {
      local("stable");
      const before = Y.encodeStateVector(document);
      history.fold("chapter", true);
      expect(Y.encodeStateVector(document)).toEqual(before);
      local("removed");
      Y.applyUpdate(peer, Y.encodeStateAsUpdate(document));
      const revision = Y.encodeStateVector(peer);
      peer.getMap("content").delete("removed");
      Y.applyUpdate(document, Y.encodeStateAsUpdate(peer, revision));

      expect(history.undo(false)?.foldChange).toEqual({ ids: ["chapter"], folded: false });
      expect(content.toJSON()).toEqual({ stable: "Author" });
      expect(history.undo(false)?.position).toEqual(location.position);
      expect(content.toJSON()).toEqual({});
      expect(history.undo(true)?.position).toEqual(location.position);
      expect(history.undo(true)?.foldChange).toEqual({ ids: ["chapter"], folded: true });
      expect(content.toJSON()).toEqual({ stable: "Author" });
    } finally {
      history.destroy();
      document.destroy();
      peer.destroy();
    }
  });
});

describe("grouped structural history", () => {
  it("uses the original selection for undo and the latest selection for redo without joining an unrelated edit", () => {
    const document = new Y.Doc();
    const content = document.getMap<string>("content");
    const origin = Symbol("Structure");
    const history = new DocumentHistory(new Y.UndoManager(content, { trackedOrigins: new Set([origin]) }), null);
    const location = (offset: number) => ({ position: { blockId: "a", offset }, editing: false });
    const apply = (key: string, value: string) => () => document.transact(() => content.set(key, value), origin);
    try {
      history.edit(location(0), location(1), apply("heading", "H1"), "same-selection");
      history.edit(location(1), location(2), apply("heading", "H9"), "same-selection");
      history.edit(location(3), location(4), apply("other", "text"));

      expect(history.undo(false)).toEqual(location(3));
      expect(content.toJSON()).toEqual({ heading: "H9" });
      expect(history.undo(false)).toEqual(location(0));
      expect(content.toJSON()).toEqual({});
      expect(history.undo(true)).toEqual(location(2));
      expect(content.toJSON()).toEqual({ heading: "H9" });
    } finally {
      history.destroy();
      document.destroy();
    }
  });

  it("keeps callout children, numbering, and row identity together in a replicated undoable conversion", () => {
    const schema = documentSchema();
    const paragraph = (text: string) => schema.nodes.paragraph.create(null, schema.text(text));
    const ordered = schema.nodes.orderedList.create({ start: 7 }, ["second", "third"].map((text) =>
      schema.nodes.listItem.create(null, paragraph(text))));
    const session = new DocumentSession([
      { id: "first", text: "first", kind: "paragraph" },
      { id: "list", text: "second\nthird", kind: "paragraph", structure: schema.topNodeType.create(null, ordered) },
      { id: "guard", text: "guard", kind: "paragraph" },
    ], true);
    const reader = DocumentSession.fromUpdates([session.encodeSnapshot()]);
    const disconnect = session.onLocalUpdate((update) => reader.applySharedUpdates([update]));
    function assertGroup() {
      const saved = reader.getBlocks();
      expect(saved.map(({ text }) => text)).toEqual(["first", "second", "third", "guard"]);
      expect(saved.map(({ id }) => id).filter((id) => ["first", "list", "guard"].includes(id))).toEqual(["first", "list", "guard"]);
      expect(saved[0].calloutGroup).toBeTruthy();
      expect(saved.map(({ calloutGroup }) => calloutGroup)).toEqual([saved[0].calloutGroup, saved[0].calloutGroup, saved[0].calloutGroup, undefined]);
      expect(saved.slice(1, 3).map(({ structure }) => structure?.firstChild?.attrs.start)).toEqual([1, 2]);
    }
    try {
      session.editBlockType({ anchor: { blockId: "first", offset: 1 }, focus: { blockId: "list", offset: 10 } }, { type: "callout" });
      assertGroup();
      session.undo(false);
      expect(reader.getBlocks().map(({ calloutGroup }) => calloutGroup)).toEqual([undefined, undefined, undefined]);
      expect(reader.getBlocks()[1].structure?.firstChild?.attrs.start).toBe(7);
      session.undo(true);
      assertGroup();
    } finally {
      disconnect();
      reader.destroy();
      session.destroy();
    }
  });
});

describe("single block type toggles", () => {
  const targets: BlockKind[] = [
    { type: "heading", level: 1 },
    { type: "heading", level: 9 },
    { type: "orderedList" },
    { type: "bulletList" },
    { type: "blockquote" },
  ];

  it.each(targets)("toggles $type while keeping authored content and its anchor", (target) => {
    const session = new DocumentSession(blocks);
    const position = { blockId: "block-3", offset: blocks[2].text.length };
    const selection = { anchor: position, focus: position };
    try {
      session.prepare();
      const paragraph = session.fragmentFor(position.blockId)!.get(0) as Y.XmlElement;
      (paragraph.get(0) as Y.XmlText).format(0, 1, { bold: {} });
      const original = session.getBlocks();
      session.editBlockType(selection, target);
      const source = session.getBlocks();
      expect(source).not.toEqual(original);

      expect(session.editBlockType(selection, target, { toggleSameType: true })).toMatchObject({ position });
      const converted = session.getBlocks();
      if (target.type === "heading") {
        const content = converted.map((block) => {
          const copy = { ...block };
          delete copy.parentId;
          return copy;
        });
        expect(content).toEqual(original);
        expect(getDocumentOutline(converted).branches.get("block-4")?.parentId).toBe(position.blockId);
      } else expect(converted).toEqual(original);
      expect(session.undo(false)).toMatchObject({ selection });
      expect(session.getBlocks()).toEqual(source);
      expect(session.undo(true)).toMatchObject({ position });
      expect(session.getBlocks()).toEqual(converted);
    } finally {
      session.destroy();
    }
  });
});

describe("long document fixture", () => {
  it.each([100000, 300000, 500000] as const)(
    "generates %i Unicode code points with addressable, varied blocks",
    (size) => {
      const document = createDocument(size);
      const pointCount = document.reduce((total, block) => total + Array.from(block.text).length, 0);

      expect(pointCount).toBe(size);
      expect(new Set(document.map((block) => block.id)).size).toBe(document.length);
      expect(document.slice(0, 10).every((block) => block.kind === "paragraph" && block.text)).toBe(true);
      expect(new Set(document.flatMap((block) => block.level ? [block.level] : []))).toEqual(new Set(headingLevels));
      expect(document.some((block) => block.text.length >= 6000)).toBe(true);
      expect(document.every((block) => block.text.isWellFormed())).toBe(true);
      expect(createDocument(size)).toEqual(document);
    },
  );
});

describe("shared heading numbers", () => {
  it("preserves numbering through legacy text writes and detaches it from a replaced heading", () => {
    const session = new DocumentSession([{ id: "chapter", kind: "heading", level: 1, text: "原文" }]);
    const legacy = new Y.Doc();
    const schema = getSchema([StarterKit.configure({ trailingNode: false })]);
    const position = { blockId: "chapter", offset: 2 };
    const range = { anchor: position, focus: position };
    const verifySnapshot = (text: string, start: number | undefined) => {
      const reader = DocumentSession.fromUpdates([Y.encodeStateAsUpdate(legacy)]);
      try {
        expect(reader.getBlocks()[0]).toMatchObject({ id: "chapter", text, kind: "heading" });
        expect(reader.getBlocks()[0].numberStart).toBe(start);
      } finally {
        reader.destroy();
      }
    };

    try {
      session.prepare();
      const original = session.fragmentFor("chapter")!.get(0);
      session.editBlockType(range, { type: "orderedList" });
      expect(session.getBlocks()[0].numberStart).toBe(0);
      expect(session.fragmentFor("chapter")!.get(0)).toBe(original);
      session.undo(false);
      expect(session.getBlocks()[0].numberStart).toBeUndefined();
      session.undo(true);
      expect(session.getBlocks()[0].numberStart).toBe(0);

      Y.applyUpdate(legacy, session.encodeSnapshot());
      const fragment = legacy.getMap<Y.XmlFragment>("paragraphs").get("chapter")!;
      const legacyWrite = (kind: "paragraph" | "heading", text: string) => {
        const content = schema.nodes[kind].create({ level: 1 }, schema.text(text));
        prosemirrorToYXmlFragment(schema.topNodeType.create(null, content), fragment);
      };
      legacyWrite("heading", "旧端修改");
      verifySnapshot("旧端修改", 0);
      legacyWrite("paragraph", "改成正文");
      legacyWrite("heading", "新建标题");
      verifySnapshot("新建标题", undefined);
    } finally {
      legacy.destroy();
      session.destroy();
    }
  });
});

describe("document selection", () => {
  const reverse: DocumentSelection = {
    anchor: { blockId: "block-3", offset: 3 },
    focus: { blockId: "block-1", offset: 1 },
  };

  it("copies a backwards range including paragraphs outside the viewport", () => {
    expect(getSelectedText(blocks, reverse)).toBe("乙丙\n中间段\n丁🙂");
  });

  it("joins the unselected edges and preserves block identity for anchors", () => {
    const updated = deleteSelectedText(blocks, reverse);

    expect(updated).toEqual([
      { id: "block-1", text: "甲戊己", kind: "heading" },
      blocks[3],
    ]);
    expect(updated[1]).toBe(blocks[3]);
    expect(blocks[0].text).toBe("甲乙丙");
  });

  it("selects all content and leaves one editable block when it is deleted", () => {
    const all = selectDocument(blocks);
    expect(getSelectedText(blocks, all)).toBe(blocks.map((block) => block.text).join("\n"));
    expect(deleteSelectedText(blocks, all)).toEqual([
      { ...blocks[0], text: "" },
    ]);
  });

  it("cuts across blocks without losing the surviving marks and undoes to the original range", () => {
    const source: DocumentBlock[] = [
      { id: "first", text: "Abcd", kind: "heading", level: 2 },
      { id: "middle", text: "隐藏的正文", kind: "paragraph" },
      { id: "last", text: "xyGH", kind: "paragraph" },
    ];
    const session = new DocumentSession(source);
    try {
      session.prepare();
      for (const [id, from, mark] of [["first", 0, "bold"], ["last", 2, "italic"]] as const) {
        const node = session.fragmentFor(id)!.get(0) as Y.XmlElement;
        (node.get(0) as Y.XmlText).format(from, 2, { [mark]: {} });
      }
      const initial = session.getBlocks();
      const selection = { anchor: { blockId: "last", offset: 2 }, focus: { blockId: "first", offset: 2 } };
      expect(session.replaceRange(selection, "delete", { editing: false, clipboard: true }))
        .toMatchObject({ position: { blockId: "first", offset: 2 }, editing: true });
      expect(session.getBlocks()).toEqual([{
        ...source[0], text: "AbGH",
        inline: [
          { from: 0, to: 2, marks: { bold: true } },
          { from: 2, to: 4, marks: { italic: true } },
        ],
      }]);
      const node = session.fragmentFor("first")!.get(0) as Y.XmlElement;
      expect((node.get(0) as Y.XmlText).toDelta()).toEqual([
        { insert: "Ab", attributes: { bold: {} } },
        { insert: "GH", attributes: { italic: {} } },
      ]);
      expect(session.undo(false)).toMatchObject({ selection });
      expect(session.getBlocks()).toEqual(initial);
      expect(session.undo(false)).toBeUndefined();
      expect(session.undo(true)).toMatchObject({ position: { blockId: "first", offset: 2 } });
      expect(session.getBlocks()[0].text).toBe("AbGH");
    } finally {
      session.destroy();
    }
  });

  it("ignores a stale anchor and preserves the same state for an empty edit", () => {
    const missing: DocumentSelection = {
      anchor: { blockId: "removed", offset: 0 },
      focus: { blockId: "block-1", offset: 0 },
    };
    expect(getSelectionRange(blocks, missing)).toBeNull();
    expect(deleteSelectedText(blocks, missing)).toBe(blocks);

    const caret = { blockId: "block-1", offset: 1 };
    expect(deleteSelectedText(blocks, { anchor: caret, focus: caret })).toBe(blocks);
  });

  it("keeps UTF-16 operations from leaving half an emoji in the document", () => {
    const selection: DocumentSelection = {
      anchor: { blockId: "block-3", offset: 2 },
      focus: { blockId: "block-3", offset: 3 },
    };
    expect(getSelectedText(blocks, selection)).toBe("🙂");
    expect(deleteSelectedText(blocks, selection)[2].text).toBe("丁戊己");
  });

  it("finds an offscreen match with the offsets used for editing", () => {
    expect(findDocumentMatches(blocks, "🙂戊")).toEqual([
      { blockId: "block-3", blockIndex: 2, from: 1, to: 4, text: "🙂戊" },
    ]);
    expect(findDocumentMatches(blocks, "不存在")).toEqual([]);
    expect(findDocumentMatches(blocks, "")).toEqual([]);
  });
});


describe("paragraph layout", () => {
  it("keeps paragraph attributes independent from text and heading structure in one history action", () => {
    const source: DocumentBlock[] = [
      { id: "first", kind: "paragraph", text: "甲乙" },
      { id: "heading", kind: "heading", level: 2, text: "标题" },
      { id: "next", kind: "paragraph", text: "丙丁" },
    ];
    const session = new DocumentSession(source);
    const range = { anchor: { blockId: "next", offset: 0 }, focus: { blockId: "first", offset: 1 } };
    try {
      expect(session.formatParagraphs(range, { textAlign: "center" }, false)).toBe(true);
      expect(session.getBlocks().map(({ layout }) => layout?.textAlign)).toEqual(["center", "center", undefined]);
      expect(session.formatParagraphs(range, { firstLineIndent: true }, false)).toBe(true);
      expect(session.getBlocks().map(({ layout }) => layout?.firstLineIndent)).toEqual([true, undefined, undefined]);
      expect(session.getBlocks().map(({ id, kind, text, level }) => ({ id, kind, text, ...(level ? { level } : {}) }))).toEqual(source);
      expect(session.formatParagraphs(range, { firstLineIndent: true }, false)).toBe(false);
      expect(session.undo(false)).toMatchObject({ selection: range });
      expect(session.getBlocks()[0].layout?.firstLineIndent).toBeUndefined();
      expect(session.getBlocks()[0].layout?.textAlign).toBe("center");
      expect(session.undo(false)).toMatchObject({ selection: range });
      expect(session.getBlocks()).toEqual(source);
      expect(session.undo(false)).toBeUndefined();
    } finally {
      session.destroy();
    }
  });
});

describe("document outline", () => {
  const content: DocumentBlock[] = [
    { id: "intro", text: "导言", kind: "paragraph" },
    { id: "parent", text: "一级标题", kind: "heading" },
    { id: "child", text: "二级标题", kind: "heading", level: 2 },
    { id: "deep", text: "三级标题", kind: "heading", level: 3 },
    { id: "paragraph", text: "深层正文", kind: "paragraph" },
    { id: "neighbor", text: "下一个二级标题", kind: "heading", level: 2 },
    { id: "next", text: "下一章", kind: "heading", level: 1 },
  ];

  it("uses heading levels to nest chapters and stop a chapter before its siblings", () => {
    const { roots, sections } = getDocumentOutline(content);
    expect(roots.map((section) => section.id)).toEqual(["parent", "next"]);
    expect(roots[0].children.map((section) => section.id)).toEqual(["child", "neighbor"]);
    expect(sections.get("child")?.children[0].id).toBe("deep");
    expect(sections.get("child")?.end).toBe(5);
    expect(sections.get("parent")?.end).toBe(6);
    expect(sections.get("next")?.end).toBe(content.length);
  });

  it("omits folded rows and reveals exactly the collapsed ancestors of a target", () => {
    const { sections } = getDocumentOutline(content);
    const folded = new Set(["parent", "child", "neighbor"]);
    const hidden = projectDocumentRows(content.length, sections, folded);
    expect(hidden.indexes).toEqual([0, 1, 6]);
    expect(hidden.positions.has(4)).toBe(false);
    expect(hidden.positions.get(6)).toBe(2);

    expect(revealDocumentRow(1, sections, folded)).toBe(folded);
    const revealed = revealDocumentRow(4, sections, folded);
    expect([...revealed]).toEqual(["neighbor"]);
    expect(projectDocumentRows(content.length, sections, revealed).indexes).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect([...folded]).toEqual(["parent", "child", "neighbor"]);
  });
});


describe("document find and replace", () => {
  it("finds literal, case-insensitive matches using UTF-16 offsets across all blocks", () => {
    const document: DocumentBlock[] = [
      { id: "a", text: "🙂Ab[a]+ AB[A]+", kind: "paragraph" },
      { id: "b", text: "ab[a]+", kind: "heading", level: 7 },
    ];
    expect(findDocumentMatches(document, "ab[a]+")).toEqual([
      { blockId: "a", blockIndex: 0, from: 2, to: 8, text: "Ab[a]+" },
      { blockId: "a", blockIndex: 0, from: 9, to: 15, text: "AB[A]+" },
      { blockId: "b", blockIndex: 1, from: 0, to: 6, text: "ab[a]+" },
    ]);
    expect(findDocumentMatches(document, "")).toEqual([]);
  });

  it("replaces only matching ranges, preserves inline runs and undoes the entire batch", () => {
    const document: DocumentBlock[] = [
      { id: "heading", text: "first Alpha Alpha link", kind: "heading", level: 9 },
      { id: "last", text: "Alpha remains", kind: "paragraph" },
    ];
    const session = new DocumentSession(document);
    try {
      session.prepare();
      const heading = session.fragmentFor("heading")!.get(0) as Y.XmlElement;
      const text = heading.get(0) as Y.XmlText;
      text.format(6, 5, { bold: {} });
      text.format(18, 4, { link: { href: "https://example.com/" } });
      const initialRuns = text.toDelta();
      const initial = session.getBlocks();
      const matches = findDocumentMatches(session.getBlocks(), "alpha");

      expect(session.replaceMatches(matches, "$&")).toBe(3);
      expect(session.getBlocks()).toEqual([
        { ...document[0], text: "first $& $& link", inline: [
          { from: 6, to: 8, marks: { bold: true } },
          { from: 12, to: 16, marks: { link: "https://example.com/" } },
        ] },
        { ...document[1], text: "$& remains" },
      ]);
      expect(text.toDelta()).toEqual([
        { insert: "first " },
        { insert: "$&", attributes: { bold: {} } },
        { insert: " $& " },
        { insert: "link", attributes: { link: { href: "https://example.com/" } } },
      ]);
      expect(session.undo(false)).toMatchObject({ position: { blockId: "heading", offset: 6 } });
      expect(session.getBlocks()).toEqual(initial);
      expect(text.toDelta()).toEqual(initialRuns);
      expect(session.undo(false)).toBeUndefined();
      expect(session.undo(true)).toBeDefined();
      expect(session.getBlocks()[1].text).toBe("$& remains");
    } finally {
      session.destroy();
    }
  });
});


describe("structured blocks", () => {
  it("preserves readable blocks and identifies unsupported nodes in newer snapshots and updates", () => {
    const source = new DocumentSession([{ id: "heading", kind: "heading", level: 2, text: "已支持的章节" }]);
    const snapshot = source.encodeSnapshot();
    source.destroy();
    const newer = new Y.Doc();
    try {
      Y.applyUpdate(newer, snapshot);
      const before = Y.encodeStateVector(newer);
      const fragment = new Y.XmlFragment();
      newer.getMap<Y.XmlFragment>("paragraphs").set("future", fragment);
      fragment.insert(0, [new Y.XmlElement("futureBlock")]);
      newer.getArray("order").push([{ id: "future", kind: "futureBlock" }]);

      const projected = projectCompatibleBlocks([snapshot, Y.encodeStateAsUpdate(newer, before)]);
      expect(projected).toMatchObject([
        { id: "heading", kind: "heading", level: 2, text: "已支持的章节" },
        { id: "future", kind: "paragraph", text: "此内容需要新版编辑器查看" },
      ]);
    } finally {
      newer.destroy();
    }
  });

  it("bounds pasted lists without losing item text or breaking later starting numbers", () => {
    const schema = documentSchema();
    const items = Array.from({ length: 70 }, (_, index) => schema.nodes.listItem.create(null,
      schema.nodes.paragraph.create(null, schema.text("item " + index))));
    const source = schema.nodes.orderedList.create({ start: 8 }, items);
    const windows = listWindows(source);
    expect(windows.map((list) => list.childCount)).toEqual([32, 32, 6]);
    expect(windows.map((list) => list.attrs.start)).toEqual([8, 40, 72]);
    expect(windows.map((list) => visibleText(list)).join("\n")).toBe(visibleText(source));
  });
});
