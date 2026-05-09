import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-slate-900 pt-24 text-white">
      <div className="space-y-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          TradeZiller<span className="text-teal-400">Pro</span>
        </h1>
        <p className="text-slate-400 text-lg">
          Constrcution Management Software
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/directory"
            className="inline-block rounded-lg bg-teal-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-teal-400"
          >
            Directory
          </Link>
          <Link
            href="/project-overview"
            className="inline-block rounded-lg bg-teal-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-teal-400"
          >
            Project
          </Link>
          <Link
            href="/budget"
            className="inline-block rounded-lg bg-teal-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-teal-400"
          >
            Budget
          </Link>
          <Link
            href="/project"
            className="inline-block rounded-lg bg-teal-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-teal-400"
          >
            Drawing
          </Link>
        </div>
      </div>
    </main>
  );
}
