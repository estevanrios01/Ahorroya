'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, TrendingUp, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-600/8 via-transparent to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center max-w-2xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3.5 py-1 mb-5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-medium text-emerald-400">Actualizado en tiempo real</span>
          </motion.div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-100 leading-tight tracking-tight">
            Encuentra el mejor precio<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-300">
              cerca de ti
            </span>
          </h1>

          <p className="mt-2.5 text-sm sm:text-base text-zinc-500 max-w-md mx-auto leading-relaxed">
            Compara precios en supermercados y farmacias de Colombia. Ahorra en cada compra.
          </p>

          <form onSubmit={handleSearch} className="mt-6 max-w-lg mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-zinc-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="¿Qué producto buscas?"
                className="w-full bg-zinc-900/90 border border-zinc-700/80 rounded-xl pl-11 pr-4 py-3 sm:py-3.5 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/15 transition-all text-sm sm:text-base shadow-xl shadow-black/10"
                aria-label="Buscar productos"
              />
            </div>
          </form>

          <div className="mt-5 flex items-center justify-center gap-4 sm:gap-6 text-xs text-zinc-500">
            <span className="flex items-center gap-1"><TrendingUp size={12} className="text-emerald-500" />12+ supermercados</span>
            <span className="flex items-center gap-1"><Zap size={12} className="text-emerald-500" />50K+ productos</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
