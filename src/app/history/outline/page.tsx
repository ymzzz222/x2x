import Link from "next/link";
import { Markdown } from "@/app/history/_components/md";
import { getVolumes, readMd } from "@/app/history/_lib/fs";

const linkClass =
  "text-blue-400 underline decoration-blue-400/40 underline-offset-2 transition hover:text-blue-300";

export default function OutlinePage() {
  const content = readMd("outline", ["大纲"]);
  if (!content) return <p className="text-white/60">大纲文件未找到</p>;

  const volumes = getVolumes();

  return (
    <div>
      <Markdown content={content} />
      {volumes.length > 0 && (
        <div className="mt-10 border-t border-white/10 pt-8">
          <h2 className="mb-4 text-xl font-semibold text-white/90">快速导航</h2>
          <ul className="space-y-2">
            {volumes.map((v) => (
              <li key={v.outlineHref}>
                <Link href={v.outlineHref} className={linkClass}>
                  {v.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
