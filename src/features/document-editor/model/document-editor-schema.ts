import { Extension, getSchema, Mark } from "@tiptap/core";
import Heading, { type Level } from "@tiptap/extension-heading";
import type { Node, Schema } from "@tiptap/pm/model";
import StarterKit from "@tiptap/starter-kit";
import { inlineColor } from "./document-format";
import { DocumentBulletStyle, DocumentCallout, DocumentColumn, DocumentColumns } from "./document-structure-schema";
import { visibleText } from "./document-structure";
import { firstLineIndentWidth, readParagraphAlignment } from "./document-paragraph";
import { headingLevels, headingPresentation, readHeadingNumberStart, type DocumentBlock, type HeadingLevel } from "./document-model";

// Tiptap's heading commands can store higher levels once their HTML representation is defined.
const DocumentHeading = Heading.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      numberStart: {
        default: null,
        parseHTML: (element) => readHeadingNumberStart(element.getAttribute("data-heading-number-start")) ?? null,
        renderHTML: ({ numberStart }) => numberStart === null ? {} : { "data-heading-number-start": numberStart },
      },
    };
  },
  parseHTML() {
    return [
      ...headingLevels.map((level) => ({ tag: `[data-heading-level="${level}"]`, attrs: { level } })),
      ...(this.parent?.() ?? []).filter((rule) => !("tag" in rule) || !/^h[7-9]$/.test(rule.tag)),
    ];
  },
  renderHTML({ node, HTMLAttributes }) {
    const level = node.attrs.level as HeadingLevel;
    const { tag, attributes } = headingPresentation(headingLevels.includes(level) ? level : 1);
    return [tag, { ...this.options.HTMLAttributes, ...HTMLAttributes, ...attributes }, 0];
  },
}).configure({ levels: [...headingLevels] as Level[] });

const colorMarks = ([
  ["textColor", "color"],
  ["backgroundColor", "background-color"],
] as const).map(([name, property]) => Mark.create({
  name,
  addAttributes() {
    return { color: { default: null, rendered: false } };
  },
  parseHTML() {
    return [{
      style: property,
      getAttrs: (value) => {
        const color = inlineColor(value);
        return color ? { color } : false;
      },
    }];
  },
  renderHTML({ mark }) {
    const color = inlineColor(mark.attrs.color);
    return ["span", color ? { ["data-" + property]: color, style: property + ":" + color } : {}, 0];
  },
}));

const paragraphAttributes = Extension.create({
  name: "paragraphLayout",
  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading"],
        attributes: {
          textAlign: {
            default: null,
            parseHTML: (element) => readParagraphAlignment(element.style.textAlign) ?? null,
            renderHTML: ({ textAlign }) => readParagraphAlignment(textAlign) ? { style: "text-align:" + textAlign } : {},
          },
        },
      },
      {
        types: ["paragraph"],
        attributes: {
          firstLineIndent: {
            default: null,
            parseHTML: (element) => element.style.textIndent === firstLineIndentWidth ? true : null,
            renderHTML: ({ firstLineIndent }) => firstLineIndent === true ? { style: "text-indent:" + firstLineIndentWidth } : {},
          },
        },
      },
    ];
  },
});

export function documentExtensions(undoRedo: boolean) {
  return [
    StarterKit.configure({ undoRedo: undoRedo ? {} : false, heading: false, trailingNode: false, link: { openOnClick: false, defaultProtocol: "https" } }),
    DocumentHeading,
    DocumentCallout, DocumentColumns, DocumentColumn, DocumentBulletStyle,
    paragraphAttributes,
    ...colorMarks,
  ];
}

let schema: Schema | undefined;

export function documentSchema() {
  return schema ??= getSchema(documentExtensions(false));
}

export function sampleContent(block: DocumentBlock) {
  const schema = documentSchema();
  const text = block.text ? schema.text(block.text) : undefined;
  const attributes = block.kind === "heading" ? { ...block.layout, level: block.level ?? 1, numberStart: block.numberStart ?? null } : block.layout;
  const node = schema.node(block.kind, attributes, text);
  return schema.topNodeType.create(null, node);
}

export function offsetAt(doc: Node, position: number) {
  return visibleText(doc, 0, position).length;
}

export function positionAtOffset(doc: Node, offset: number) {
  let start = 1;
  let end = doc.content.size - 1;
  if (doc.childCount === 1 && doc.firstChild?.firstChild?.isText && doc.firstChild.childCount === 1) {
    return Math.min(offset + 1, end);
  }
  while (start < end) {
    const middle = (start + end) >>> 1;
    if (offsetAt(doc, middle) < offset) start = middle + 1;
    else end = middle;
  }
  return start;
}
