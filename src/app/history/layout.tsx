import Link from "next/link";

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen bg-neutral-950 text-white scheme-dark">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <nav className="mb-8 flex items-center gap-4 text-sm text-white/50">
          <Link
            href="/"
            className="transition hover:text-white/80"
          >
            Home
          </Link>
          <span>/</span>
          <Link
            href="/history"
            className="transition hover:text-white/80"
          >
            History
          </Link>
        </nav>
        {children}
      </div>
    </main>
  );
}
