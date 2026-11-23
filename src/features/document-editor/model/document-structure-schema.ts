import { Extension, Node, mergeAttributes } from "@tiptap/core";
import { bulletStyle } from "./document-structure";

export const DocumentCallout = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,
  parseHTML: () => [{ tag: "aside[data-callout]" }],
  renderHTML: ({ HTMLAttributes }) => ["aside", mergeAttributes(HTMLAttributes, { "data-callout": "" }), 0],
});

export const DocumentColumns = Node.create({
  name: "columns",
  group: "block",
  content: "column column",
  isolating: true,
  parseHTML: () => [{ tag: "div[data-columns]" }],
  renderHTML: ({ HTMLAttributes }) => ["div", mergeAttributes(HTMLAttributes, { "data-columns": "" }), 0],
});

export const DocumentColumn = Node.create({
  name: "column",
  content: "block+",
  isolating: true,
  parseHTML: () => [{ tag: "div[data-column]" }],
  renderHTML: ({ HTMLAttributes }) => ["div", mergeAttributes(HTMLAttributes, { "data-column": "" }), 0],
});

export const DocumentBulletStyle = Extension.create({
  name: "documentBulletStyle",
  addGlobalAttributes() {
    return [{
      types: ["orderedList"],
      attributes: {
        numberMode: {
          default: null,
          parseHTML: (element) => element.getAttribute("data-number-mode") === "continue" ? "continue" : null,
          renderHTML: ({ numberMode, type }) => ({
            ...(numberMode === "continue" ? { "data-number-mode": "continue" } : {}),
            ...(type ? { "data-list-type": type } : {}),
          }),
        },
      },
    }, {
      types: ["bulletList"],
      attributes: {
        marker: {
          default: null,
          parseHTML: (element) => bulletStyle(element.style.listStyleType),
          renderHTML: ({ marker }) => bulletStyle(marker) ? { style: "list-style-type:" + marker } : {},
        },
      },
    }];
  },
});
