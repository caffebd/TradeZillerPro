import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          TradeZiller<span className="text-teal-400">Pro</span>
        </h1>
        <p className="text-slate-400 text-lg">
          Construction drawing markup &amp; estimating
        </p>
        <Link
          href="/project"
          className="inline-block bg-teal-500 hover:bg-teal-400 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
        >
          Open Demo Drawing
        </Link>
      </div>
    </main>
  );
}
