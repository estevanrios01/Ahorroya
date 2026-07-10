'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error('[AhorroYa Error]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="text-7xl mb-6 inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-red-900/20 border border-red-900/30">
          <svg className="w-12 h-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-zinc-100 mb-3">Algo salió mal</h1>
        <p className="text-zinc-500 mb-8 max-w-sm mx-auto leading-relaxed">
          Ocurrió un error inesperado. Nuestro equipo ha sido notificado automáticamente.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-colors shadow-lg shadow-emerald-600/20"
          >
            Intentar de nuevo
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-medium rounded-xl transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="mt-6 text-xs text-zinc-600 hover:text-zinc-400 transition-colors underline"
        >
          {showDetails ? 'Ocultar detalles' : 'Ver detalles técnicos'}
        </button>
        {showDetails && error && (
          <pre className="mt-4 text-left text-xs text-zinc-600 bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 max-h-48 overflow-auto">
            {error.message || 'Error sin descripción'}
          </pre>
        )}
        <div className="mt-10 text-xs text-zinc-700">
          <Link href="/legal/contacto" className="hover:text-zinc-500 transition-colors">Reportar este error →</Link>
        </div>
      </div>
    </div>
  );
}
