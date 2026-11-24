import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { DocumentBlock } from "../model/document-model";
import type { DocumentBranch } from "../model/document-outline";
import styles from "../editor.module.css";

type Row = { block: DocumentBlock; content: ReactNode };
type Container = { key: string; quote?: string; parentId?: string };

function containsOffset(node: Node, offset: number) {
  return offset <= (node instanceof CharacterData ? node.length : node.childNodes.length);
}

function placeChildren(parent: HTMLElement, children: readonly HTMLElement[]) {
  const destination = parent as HTMLElement & { moveBefore?: (child: HTMLElement, before: ChildNode | null) => void };
  let before = parent.firstChild;
  for (const child of children) {
    if (child === before) before = before.nextSibling;
    else if (child.isConnected && typeof destination.moveBefore === "function") destination.moveBefore(child, before);
    else parent.insertBefore(child, before);
  }
}

export function DocumentWindow({ blocks, branches, rows, height }: {
  blocks: readonly DocumentBlock[];
  branches: ReadonlyMap<string, DocumentBranch>;
  rows: Row[];
  height: number;
}) {
  const root = useRef<HTMLDivElement>(null);
  const mountedHosts = useRef(new Map<string, HTMLElement>());
  const mountedGroups = useRef(new Map<string, HTMLElement>());
  const [targets, setTargets] = useState<ReadonlyMap<string, HTMLElement>>(() => new Map());
  const containers = useMemo(() => {
    const paths = new Map<string, readonly Container[]>();
    const branchIds = new Set([...branches.values()].flatMap(({ explicitParent }) => explicitParent ? [explicitParent] : []));
    let previous: string | undefined;
    let quoteStart = "";
    for (const { id, quoteGroup } of blocks) {
      if (quoteGroup !== previous) quoteStart = id;
      const parent = branches.get(id)?.explicitParent;
      const inherited = parent && branchIds.has(parent) ? paths.get(parent) ?? [] : [];
      const path = [...inherited];
      if (quoteGroup && !path.some(({ quote }) => quote === quoteGroup)) {
        path.push({ key: (path.at(-1)?.key ?? "") + "/quote:" + quoteStart, quote: quoteGroup });
      }
      if (branchIds.has(id)) path.push({ key: "branch:" + id, parentId: id });
      if (path.length) paths.set(id, path);
      previous = quoteGroup;
    }
    return paths;
  }, [blocks, branches]);

  useLayoutEffect(() => {
    const track = root.current;
    if (!track) return;
    const hosts = mountedHosts.current;
    const groups = mountedGroups.current;
    const visible = new Set<string>();
    const visibleGroups = new Set<string>();
    const children = new Map<HTMLElement, HTMLElement[]>();
    function push(parent: HTMLElement, child: HTMLElement) {
      const list = children.get(parent);
      if (list) list.push(child);
      else children.set(parent, [child]);
    }
    let changed = false;
    for (const { block } of rows) {
      visible.add(block.id);
      let host = hosts.get(block.id);
      if (!host) {
        host = document.createElement("div");
        hosts.set(block.id, host);
        changed = true;
      }
      let parent = track as HTMLElement;
      for (const { key, quote, parentId } of containers.get(block.id) ?? []) {
        let group = groups.get(key);
        if (!group) {
          group = document.createElement(quote ? "blockquote" : "div");
          group.className = quote ? styles.quoteWindow : styles.branchWindow;
          if (parentId) group.dataset.blockBranch = parentId;
          groups.set(key, group);
        }
        if (quote) group.dataset.quoteGroup = quote;
        if (!visibleGroups.has(key)) push(parent, group);
        visibleGroups.add(key);
        parent = group;
      }
      push(parent, host);
    }

    const focused = document.activeElement;
    const range = focused instanceof HTMLElement && focused.isContentEditable ? document.getSelection() : null;
    const { anchorNode, anchorOffset, focusNode, focusOffset } = range ?? {};
    for (const [parent, nodes] of children) placeChildren(parent, nodes);
    for (const [id, host] of hosts) {
      if (visible.has(id)) continue;
      host.remove();
      hosts.delete(id);
      changed = true;
    }
    for (const [key, group] of groups) {
      if (visibleGroups.has(key)) continue;
      group.remove();
      groups.delete(key);
    }
    if (focused instanceof HTMLElement && focused !== document.activeElement && track.contains(focused)) {
      focused.focus({ preventScroll: true });
    }
    if (range && anchorNode && focusNode && anchorOffset !== undefined && focusOffset !== undefined &&
      track.contains(anchorNode) && track.contains(focusNode) &&
      containsOffset(anchorNode, anchorOffset) && containsOffset(focusNode, focusOffset) &&
      (range.anchorNode !== anchorNode || range.focusNode !== focusNode ||
       range.anchorOffset !== anchorOffset || range.focusOffset !== focusOffset)) {
      range.setBaseAndExtent(anchorNode, anchorOffset, focusNode, focusOffset);
    }
    // Attach new targets before React mounts editors that read layout and set focus.
    if (changed) setTargets(new Map(hosts));
  }, [containers, rows]);

  return <div ref={root} className={styles.window} style={{ height }}>
    {rows.map(({ block, content }) => {
      const target = targets.get(block.id);
      return target ? createPortal(content, target, block.id) : null;
    })}
  </div>;
}
