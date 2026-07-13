'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PageControls({ backHref = '/', forwardHref, className = '' }) {
  const router = useRouter();

  function goBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push(backHref);
  }

  const backLabel = backHref === '/' ? 'Inicio' : 'Seccion';

  return (
    <div className={`mb-5 flex flex-wrap items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={goBack}
        className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-100"
      >
        <ArrowLeft size={14} />
        Atras
      </button>
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-100"
      >
        <Home size={14} />
        {backLabel}
      </Link>
      {forwardHref && (
        <Link
          href={forwardHref}
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300 transition-colors hover:border-emerald-500/40 hover:text-emerald-200"
        >
          Siguiente
          <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}
