export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center justify-between">
          <div className="h-9 w-36 rounded-xl bg-zinc-900" />
          <div className="h-9 w-28 rounded-xl bg-zinc-900" />
        </div>
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-8">
          <div className="mb-5 h-4 w-48 rounded-full bg-emerald-500/20" />
          <div className="h-9 w-full max-w-2xl rounded-xl bg-zinc-800" />
          <div className="mt-3 h-4 w-full max-w-xl rounded-xl bg-zinc-800/80" />
          <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_180px_120px]">
            <div className="h-12 rounded-xl bg-zinc-950" />
            <div className="h-12 rounded-xl bg-zinc-950" />
            <div className="h-12 rounded-xl bg-emerald-700/60" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="aspect-[0.78] animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/70" />
          ))}
        </div>
      </div>
    </div>
  );
}
