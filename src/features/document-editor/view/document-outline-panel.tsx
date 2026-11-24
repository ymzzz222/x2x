import { memo, useEffect, useId, useRef, useState, type MouseEvent } from "react";
import type { DocumentSection } from "../model/document-outline";
import styles from "../editor.module.css";

type OutlineProps = {
  roots: DocumentSection[];
  collapsed: ReadonlySet<string>;
  onToggle: (id: string) => void;
  onJump: (index: number) => void;
  onStatus: (message: string) => void;
};

export const DocumentOutlinePanel = memo(function DocumentOutlinePanel({ roots, collapsed, onToggle, onJump, onStatus }: OutlineProps) {
  const id = useId();
  const nav = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const element = nav.current;

    function copyLink(event: Event) {
      if ((event as Event & { command?: string }).command !== "--copy-link") return;
      if (event.target instanceof HTMLAnchorElement) void copyAnchor(event.target.href, onStatus, "章节");
    }

    element?.addEventListener("command", copyLink, true);
    return () => element?.removeEventListener("command", copyLink, true);
  }, [onStatus]);

  function followAnchor(event: MouseEvent<HTMLAnchorElement>, section: DocumentSection) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const hash = event.currentTarget.hash;
    if (window.location.hash !== hash) window.history.pushState(window.history.state, "", hash);
    onJump(section.index);
  }

  function renderSections(sections: DocumentSection[]) {
    return sections.map((section) => {
      const folded = collapsed.has(section.id);
      const prefix = section.numbering ? section.numbering.label + " " : "";
      const title = prefix + (section.text || "未命名标题");
      const target = id + "-link-" + section.id;
      const childrenId = id + "-children-" + section.id;
      const hash = "#" + section.id;
      return (
        <li key={section.id}>
          <div className={styles.outlineRow}>
            {section.children.length > 0 && (
              <button type="button" className={styles.fold} aria-label={title + " 子目录"}
                aria-expanded={!folded} aria-controls={childrenId}
                onClick={() => onToggle(section.id)} />
            )}
            <a id={target} href={hash} className={styles.outlineLink} title={title}
              onClick={(event) => followAnchor(event, section)}>
              {title}
            </a>
            <button type="button" className={styles.copyLink} aria-label={"复制章节链接：" + title}
              {...{ command: "--copy-link", commandfor: target }}
              onClick={() => {
                if (!("CommandEvent" in window)) void copyAnchor(new URL(hash, window.location.href).href, onStatus, "章节");
              }}>
              复制
            </button>
          </div>
          {section.children.length > 0 && (
            <ul id={childrenId} className={styles.outlineChildren} hidden={folded}>
              {!folded && renderSections(section.children)}
            </ul>
          )}
        </li>
      );
    });
  }

  return (
    <aside className={styles.outline}>
      <p className={styles.outlineTitle}>文档目录</p>
      <button type="button" className={styles.outlineToggle} aria-expanded={open}
        aria-controls={id} onClick={() => setOpen(!open)}>
        文档目录
      </button>
      <nav ref={nav} id={id} aria-label="文档目录" data-open={open}>
        <a className={styles.skipOutline} href="#document-body">跳到正文</a>
        {roots.length ? <ul>{renderSections(roots)}</ul> : <p className={styles.outlineEmpty}>暂无标题</p>}
      </nav>
    </aside>
  );
});

export async function copyAnchor(url: string, onStatus: (message: string) => void, type: "章节" | "块") {
  try {
    await navigator.clipboard.writeText(url);
    onStatus("已复制" + type + "链接");
  } catch {
    onStatus("复制链接失败，请检查剪贴板权限");
  }
}


export function readFoldPreference(key: string): Set<string> {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return new Set(Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : []);
  } catch {
    return new Set();
  }
}

export function writeFoldPreference(key: string, ids: ReadonlySet<string>) {
  try {
    window.localStorage.setItem(key, JSON.stringify([...ids]));
  } catch {
    // A browser with storage disabled can still fold sections for the current page.
  }
}
