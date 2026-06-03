import fs from "fs";
import path from "path";

const HISTORY_DIR = path.join(process.cwd(), "src/app/history");

export const FOLDER_MAP: Record<string, string> = {
  总纲: "outline",
  正文: "content",
  "v01-远古": "v01-ancient",
  "v02-夏商周": "v02-xiashangzhou",
  "v03-秦汉": "v03-qinhan",
  "v04-两汉": "v04-lianghan",
  "v05-三国": "v05-sanguo",
  "v06-隋唐": "v06-suitang",
  "v07-宋辽金": "v07-songliaojin",
  "v08-大元": "v08-dayuan",
  "v09-大明": "v09-daming",
  "v10-清近现代": "v10-qing",
};

function mapParts(parts: string[]): string[] {
  return parts.map((p) => FOLDER_MAP[p] || p);
}

function resolveRelative(href: string, currentPath: string[]): string[] {
  const baseParts = currentPath.slice(0, -1);
  const resolved = [...baseParts];
  for (const part of href.replace(/\.md$/, "").split("/")) {
    if (part === "..") resolved.pop();
    else if (part !== ".") resolved.push(part);
  }
  return mapParts(resolved);
}

function toRoute(parts: string[]): string {
  const last = parts[parts.length - 1];
  if (last === "大纲" && parts.length === 2 && parts[0] === "outline") {
    return "/history/outline";
  }
  if (last === "README") {
    return `/history/${parts.slice(0, -1).join("/")}`;
  }
  return `/history/${parts.join("/")}`;
}

export function convertMarkdownLink(href: string, currentPath: string[]): string {
  if (!href.endsWith(".md")) return href;
  return toRoute(resolveRelative(href, currentPath));
}

export function resolveMarkdownLinks(content: string, currentPath: string[]): string {
  const section = currentPath[0];
  return content.replace(/\[([^\]]*)\]\(([^)]+)\)/g, (match, text, href) => {
    if (!href.endsWith(".md")) return match;

    const mapped = resolveRelative(href, currentPath);
    const filePath = path.join(HISTORY_DIR, ...mapped) + ".md";
    if (fs.existsSync(filePath)) {
      return `[${text}](${convertMarkdownLink(href, currentPath)})`;
    }

    const other = section === "outline" ? "content" : "outline";
    const otherParts = [other, ...mapped.slice(1)];
    if (fs.existsSync(path.join(HISTORY_DIR, ...otherParts) + ".md")) {
      return `[${text}](${toRoute(otherParts)})`;
    }

    return `[${text}](${convertMarkdownLink(href, currentPath)})`;
  });
}
