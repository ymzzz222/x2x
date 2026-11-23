import type { Node } from "@tiptap/pm/model";
import { Fragment, useLayoutEffect, useRef, type ReactNode } from "react";
import type { InlineMarks } from "../model/document-format";
import { headingPresentation, type DocumentBlock, type DocumentMatch } from "../model/document-model";
import { offsetAt } from "../model/document-editor-schema";
import { bulletStyle, visibleText } from "../model/document-structure";
import { paragraphLayout, paragraphStyle } from "../model/document-paragraph";

function formatText(mark: InlineMarks, text: string): ReactNode {
  let result: ReactNode = text;
  if (mark.code) result = <code>{result}</code>;
  if (mark.bold) result = <strong>{result}</strong>;
  if (mark.italic) result = <em>{result}</em>;
  if (mark.underline) result = <u>{result}</u>;
  if (mark.strike) result = <s>{result}</s>;
  if (typeof mark.textColor === "string") result = <span data-color={mark.textColor} style={{ color: mark.textColor }}>{result}</span>;
  if (typeof mark.backgroundColor === "string") result = <span data-background-color={mark.backgroundColor} style={{ backgroundColor: mark.backgroundColor }}>{result}</span>;
  if (typeof mark.link === "string") result = <a href={mark.link} target="_blank" rel="noopener noreferrer">{result}</a>;
  return result;
}

export function PreviewText({ block, selection, matches, current }: {
  block: DocumentBlock;
  selection: [number, number] | null;
  matches?: readonly DocumentMatch[];
  current?: DocumentMatch;
}) {
  const { tag: Element, attributes } = block.kind === "heading" ? headingPresentation(block.level ?? 1) : { tag: "p" as const };
  const currentMark = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (!current || !currentMark.current) return;
    const element = currentMark.current;
    const frame = requestAnimationFrame(() => element.scrollIntoView({ block: "nearest", inline: "nearest" }));
    return () => cancelAnimationFrame(frame);
  }, [current]);

  const style = paragraphStyle(block.layout);
  let runIndex = 0;
  const runs = block.inline;

  function renderRange(from: number, to: number) {
    if (!runs || from >= to) return block.text.slice(from, to);
    const parts: ReactNode[] = [];
    while (from < to && runIndex < runs.length) {
      const run = runs[runIndex];
      if (run.from >= to) break;
      if (run.to <= from) {
        runIndex++;
        continue;
      }
      if (from < run.from) parts.push(block.text.slice(from, run.from));
      const start = Math.max(from, run.from);
      const end = Math.min(to, run.to);
      parts.push(<Fragment key={start}>{formatText(run.marks, block.text.slice(start, end))}</Fragment>);
      from = end;
    }
    if (from < to) parts.push(block.text.slice(from, to));
    return parts;
  }

  function decorated(from: number, to: number) {
    if (from === to) return "\u00a0";
    if (selection && selection[0] < selection[1]) {
      const left = Math.max(from, selection[0]);
      const right = Math.min(to, selection[1]);
      if (left < right) return <>
        {renderRange(from, left)}
        <mark data-document-selection="">{renderRange(left, right)}</mark>
        {renderRange(right, to)}
      </>;
      return renderRange(from, to);
    }

    const output: ReactNode[] = [];
    let start = from;
    for (const match of matches ?? []) {
      const left = Math.max(from, match.from);
      const right = Math.min(to, match.to);
      if (left >= right) continue;
      const active = match === current;
      output.push(renderRange(start, left));
      output.push(<mark key={left} ref={active && left === match.from ? currentMark : undefined}
        data-find-match="" data-find-current={active ? "" : undefined}>{renderRange(left, right)}</mark>);
      start = right;
    }
    output.push(renderRange(start, to));
    return output;
  }

  function renderPreview(from: number, to: number) {
    // Match ProseMirror's trailing break so the last blank line also has height in the preview.
    return <>{decorated(from, to)}{from < to && block.text[to - 1] === "\n" && <br aria-hidden="true" />}</>;
  }

  function renderStructure(root: Node, node: Node, start: number): ReactNode {
    const name = node.type.name;
    if (node.isTextblock) {
      const { tag: Element, attributes } = name === "heading"
        ? headingPresentation(node.attrs.level) : { tag: name === "codeBlock" ? "pre" as const : "p" as const };
      const from = offsetAt(root, start + 1);
      const to = from + visibleText(node).length;
      return <Element key={start} data-block-text="" data-text-offset={from} {...attributes}
        style={paragraphStyle(paragraphLayout(node.attrs))}>{renderPreview(from, to)}</Element>;
    }

    const children: ReactNode[] = [];
    node.forEach((child, offset) => children.push(renderStructure(root, child, start + 1 + offset)));
    if (name === "orderedList") return <ol key={start} start={node.attrs.start} type={node.attrs.type ?? undefined} data-list-type={node.attrs.type ?? undefined}>{children}</ol>;
    if (name === "bulletList") return <ul key={start} style={{ listStyleType: bulletStyle(node.attrs.marker) ?? undefined }}>{children}</ul>;
    if (name === "listItem") return <li key={start}>{children}</li>;
    if (name === "blockquote") return <blockquote key={start}>{children}</blockquote>;
    if (name === "callout") return <aside key={start} data-callout="">{children}</aside>;
    if (name === "columns") return <div key={start} data-columns="">{children}</div>;
    if (name === "column") return <div key={start} data-column="">{children}</div>;
    if (name === "horizontalRule") return <hr key={start} />;
    return children;
  }

  if (block.structure) return renderStructure(block.structure, block.structure, -1);
  return <Element data-block-text="" style={style} {...attributes}>{renderPreview(0, block.text.length)}</Element>;
}
