'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-zinc-100 mb-2">Algo salió mal</h1>
        <p className="text-zinc-500 mb-8">Ocurrió un error inesperado. Intenta de nuevo.</p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
