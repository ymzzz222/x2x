import fs from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "./md";
import {
  type Section,
  sectionDir,
  readMd,
  listMdInDir,
  normalizeSlug,
} from "../_lib/fs";

const linkClass =
  "text-blue-400 underline decoration-blue-400/40 underline-offset-2 transition hover:text-blue-300";

interface Props {
  section: Section;
  slug: string[];
  /** content 卷目录：访问目录 URL 时列出子 md */
  listDir?: boolean;
}

export function MdPage({ section, slug: rawSlug, listDir }: Props) {
  const slug = normalizeSlug(rawSlug);
  const dir = sectionDir(section);
  const resolved = path.resolve(path.join(dir, ...slug));
  if (!resolved.startsWith(path.resolve(dir))) notFound();

  const content = readMd(section, slug);
  if (content) return <Markdown content={content} />;

  if (listDir) {
    const dirPath = path.join(dir, ...slug);
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      const files = listMdInDir(dirPath, `/history/${section}/${slug.join("/")}`);
      if (files.length > 0) {
        return (
          <div>
            <h1 className="mb-6 text-3xl font-bold text-white">正文目录</h1>
            <ul className="space-y-3">
              {files.map((f) => (
                <li key={f.href}>
                  <Link href={f.href} className={linkClass}>
                    {f.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      }
    }
  }

  notFound();
}
