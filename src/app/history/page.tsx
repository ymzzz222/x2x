import Link from "next/link";
import { getVolumes, listMdInDir, sectionDir } from "@/app/history/_lib/fs";
import path from "path";

const linkClass = "text-sm text-white/50 transition hover:text-white/80";

export default function HistoryIndex() {
  const volumes = getVolumes();

  return (
    <div>
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-white">
            少年中国史
          </h1>
          <p className="text-lg text-white/60">10 卷，从上古到近现代，编年连贯</p>
        </div>
        <Link
          href="/history/outline"
          className="group inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-5 py-3 transition hover:border-white/20 hover:bg-white/10"
        >
          <span className="text-lg font-medium text-white/90 group-hover:text-white">
            全书大纲
          </span>
          <span className="text-sm text-white/40">→</span>
        </Link>
      </div>

      <div className="space-y-4">
        {volumes.map((vol) => {
          const volumeId = vol.outlineHref.split("/").pop()!;
          const articles = vol.contentHref
            ? listMdInDir(
                path.join(sectionDir("content"), volumeId),
                `/history/content/${volumeId}`
              )
            : [];

          return (
            <div
              key={vol.outlineHref}
              className="rounded-lg border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/15"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-lg font-semibold text-white/90">{vol.title}</h2>
                <div className="flex gap-2">
                  <Link
                    href={vol.outlineHref}
                    className="shrink-0 rounded-md bg-white/10 px-3 py-1.5 text-sm text-white/70 transition hover:bg-white/15 hover:text-white"
                  >
                    目录
                  </Link>
                  {vol.contentHref && (
                    <Link
                      href={vol.contentHref}
                      className="shrink-0 rounded-md bg-blue-500/20 px-3 py-1.5 text-sm text-blue-300 transition hover:bg-blue-500/30 hover:text-blue-200"
                    >
                      正文
                    </Link>
                  )}
                </div>
              </div>
              {articles.length > 0 && (
                <ul className="mt-3 space-y-1 border-t border-white/5 pt-3">
                  {articles.map((a) => (
                    <li key={a.href}>
                      <Link href={a.href} className={linkClass}>
                        {a.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
