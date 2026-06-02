import Grainient from "@/components/grainient";
import Link from "next/link";

export default function About() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#130f1b] px-6 py-20 text-white">
      <Grainient
        color1="#a6c8ff"
        color2="#3b5bff"
        color3="#9bb8d8"
        grainAnimated
      />
      <div className="absolute inset-0 bg-black/15" />
      <section className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center gap-6 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.4em] text-white/70">
          About
        </p>
        <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
          About x2x
        </h1>
        <p className="max-w-2xl text-base leading-8 text-white/80 sm:text-lg">
          局域网文件共享，类似于“AirDrop”功能。只要在任何时间、任何地点都有局域网存在，就可以立即建立远程交付环境。
        </p>
        <Link
          href="/"
          className="mt-4 rounded-full border border-white/30 px-6 py-2 text-sm text-white/80 transition hover:bg-white/10"
        >
          Back to Home
        </Link>
      </section>
    </main>
  );
}
