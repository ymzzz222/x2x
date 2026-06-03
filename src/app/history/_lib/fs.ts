import fs from "fs";
import path from "path";
import { resolveMarkdownLinks } from "./links";

export type Section = "outline" | "content";

const HISTORY = path.join(process.cwd(), "src/app/history");

/** Next.js 有时传入 URL 编码的 slug，需解码后再拼路径 */
export function normalizeSlug(slug: string[]): string[] {
  return slug
    .flatMap((segment) => {
      try {
        return decodeURIComponent(segment).split("/");
      } catch {
        return segment.split("/");
      }
    })
    .filter(Boolean);
}

function isRouteSegment(name: string): boolean {
  return name.startsWith("_") || name.startsWith("[");
}

export function sectionDir(section: Section): string {
  return path.join(HISTORY, section);
}

export function getTitle(content: string, fallback: string): string {
  return content.match(/^#\s+(.+)$/m)?.[1] ?? fallback.replace(/\.md$/, "");
}

export function resolveMdPath(section: Section, slug: string[]): string | null {
  const dir = sectionDir(section);
  const exact = path.join(dir, ...slug) + ".md";
  if (fs.existsSync(exact)) return exact;
  const readme = path.join(dir, ...slug, "README.md");
  if (fs.existsSync(readme)) return readme;
  return null;
}

function currentPath(section: Section, slug: string[], filePath: string): string[] {
  return filePath.endsWith("README.md")
    ? [section, ...slug, "README"]
    : [section, ...slug];
}

export function readMd(section: Section, slug: string[]): string | null {
  const filePath = resolveMdPath(section, slug);
  if (!filePath) return null;
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(sectionDir(section)))) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  return resolveMarkdownLinks(raw, currentPath(section, slug, filePath));
}

export function listMdInDir(
  dir: string,
  hrefPrefix: string
): { title: string; href: string }[] {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .map((f) => {
      const content = fs.readFileSync(path.join(dir, f), "utf-8");
      return {
        title: getTitle(content, f),
        href: `${hrefPrefix}/${f.replace(/\.md$/, "")}`,
      };
    });
}

export interface Volume {
  title: string;
  outlineHref: string;
  contentHref: string | null;
}

export function getVolumes(): Volume[] {
  const outlineDir = sectionDir("outline");
  if (!fs.existsSync(outlineDir)) return [];

  return fs
    .readdirSync(outlineDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name.startsWith("v"))
    .map((e) => {
      const readme = path.join(outlineDir, e.name, "README.md");
      const title = fs.existsSync(readme)
        ? getTitle(fs.readFileSync(readme, "utf-8"), e.name)
        : e.name;
      const hasContent = fs.existsSync(path.join(HISTORY, "content", e.name));
      return {
        title,
        outlineHref: `/history/outline/${e.name}`,
        contentHref: hasContent ? `/history/content/${e.name}` : null,
      };
    });
}

export function staticParams(section: Section): { slug: string[] }[] {
  const params: { slug: string[] }[] = [];
  const skipRoot = section === "outline" ? "大纲.md" : null;

  function scan(dir: string, prefix: string[] = []) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory() && !isRouteSegment(entry.name)) {
        params.push({ slug: [...prefix, entry.name] });
        scan(path.join(dir, entry.name), [...prefix, entry.name]);
      } else if (
        entry.name.endsWith(".md") &&
        entry.name !== "README.md" &&
        entry.name !== skipRoot
      ) {
        params.push({ slug: [...prefix, entry.name.replace(/\.md$/, "")] });
      }
    }
  }

  scan(sectionDir(section));
  return params;
}
