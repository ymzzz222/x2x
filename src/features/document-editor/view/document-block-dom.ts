import { Extension } from "@tiptap/core";
import type { Node as PMNode } from "@tiptap/pm/model";
import { Plugin } from "@tiptap/pm/state";
import { Decoration, DecorationSet, type NodeViewConstructor } from "@tiptap/pm/view";
import type { CSSProperties } from "react";
import { headingLevels, type HeadingLevel } from "../model/document-model";
import { paragraphLayout, paragraphStyle } from "../model/document-paragraph";
import { bulletStyle, defaultOrderedListType, isList } from "../model/document-structure";

export function blockDOM(type: string, attrs: Record<string, unknown>) {
  switch (type) {
    case "paragraph":
      return { className: "ym-block-paragraph", "data-block-type": "paragraph", role: "paragraph" } as const;
    case "heading": {
      const level = headingLevels.includes(attrs.level as HeadingLevel) ? Number(attrs.level) : 1;
      return {
        className: "ym-block-heading", "data-block-type": "heading",
        "data-heading-level": level, role: "heading", "aria-level": level + 1,
      } as const;
    }
    case "orderedList":
      return {
        className: "ym-block-list", "data-block-type": "ordered-list", role: "list",
        "data-list-start": listStart(attrs.start),
        "data-list-type": typeof attrs.type === "string" ? attrs.type : undefined,
      } as const;
    case "bulletList":
      return {
        className: "ym-block-list", "data-block-type": "bullet-list", role: "list",
        "data-bullet-marker": bulletStyle(attrs.marker) ?? undefined,
      } as const;
    case "listItem":
      return { className: "ym-block-list-item", "data-block-type": "list-item", role: "listitem" } as const;
    case "blockquote":
      return { className: "ym-block-quote", "data-block-type": "quote", role: "blockquote" } as const;
    default:
      return {};
  }
}

function listStart(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) ? value : 1;
}

export function listCounterStyle(start: unknown): CSSProperties {
  return { "--ym-list-reset": listStart(start) - 1 } as CSSProperties;
}

const blockView: NodeViewConstructor = (node, view) => {
  const dom = view.dom.ownerDocument.createElement("div");
  const type = node.type;
  let rendered: typeof node | undefined;

  function update(next: typeof node) {
    if (next.type !== type) return false;
    if (rendered?.sameMarkup(next)) return true;
    rendered = next;
    const { className, ...attributes } = blockDOM(type.name, next.attrs);
    if (className) dom.classList.add(className);
    for (const [name, value] of Object.entries(attributes)) {
      if (value === undefined) dom.removeAttribute(name);
      else dom.setAttribute(name, String(value));
    }

    if (type.name === "paragraph" || type.name === "heading") {
      const style = paragraphStyle(paragraphLayout(next.attrs));
      dom.style.textAlign = style?.textAlign ?? "";
      dom.style.textIndent = style?.textIndent ?? "";
    } else if (type.name === "orderedList") {
      dom.style.setProperty("--ym-list-reset", String(listStart(next.attrs.start) - 1));
    }
    return true;
  }

  update(node);
  return {
    dom,
    contentDOM: dom,
    update,
    ignoreMutation: (mutation) => mutation.type === "attributes" && mutation.target === dom,
  };
};

function orderedListMarkers(doc: PMNode) {
  const markers: Decoration[] = [];
  function visit(node: PMNode, position: number, listDepth: number) {
    if (node.type.name === "orderedList" && !node.attrs.type) {
      markers.push(Decoration.node(position, position + node.nodeSize,
        { "data-list-depth-style": defaultOrderedListType(listDepth) }));
    }
    const depth = listDepth + Number(isList(node));
    node.forEach((child, offset) => visit(child, position + 1 + offset, depth));
  }
  visit(doc, -1, 0);
  return DecorationSet.create(doc, markers);
}

// NodeViews affect the live editor. The schema's DOM serializer still supplies clipboard HTML.
export const DocumentBlockViews = Extension.create({
  name: "documentBlockViews",
  addProseMirrorPlugins() {
    const layout: Plugin<DecorationSet> = new Plugin({
      state: {
        init: (_config, state) => orderedListMarkers(state.doc),
        apply: (transaction, markers) => transaction.docChanged ? orderedListMarkers(transaction.doc) : markers,
      },
      props: {
        decorations: (state) => layout.getState(state),
        nodeViews: {
          paragraph: blockView, heading: blockView, orderedList: blockView,
          bulletList: blockView, listItem: blockView, blockquote: blockView,
        },
      },
    });
    return [layout];
  },
});
