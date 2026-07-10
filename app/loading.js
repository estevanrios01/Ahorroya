export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-5">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 border-2 border-emerald-500/30 rounded-full" />
          <div className="absolute inset-0 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-zinc-500 text-sm">Cargando</p>
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
