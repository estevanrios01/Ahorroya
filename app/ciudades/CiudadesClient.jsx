'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CiudadesClient({ ciudades }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return ciudades;
    const q = query.toLowerCase().trim();
    return ciudades.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.department.toLowerCase().includes(q)
    );
  }, [query, ciudades]);

  return (
    <>
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar ciudad o departamento..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-all"
          aria-label="Buscar ciudad"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs"
            aria-label="Limpiar búsqueda"
          >
            Limpiar
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <MapPin size={40} className="mx-auto text-zinc-700 mb-3" />
          <p className="text-zinc-500">No encontramos &ldquo;{query}&rdquo;</p>
          <button onClick={() => setQuery('')} className="text-emerald-500 hover:text-emerald-400 text-sm mt-2">Ver todas las ciudades</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c, i) => (
            <motion.div
              key={c.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
            >
              <Link
                href={`/ciudad/${c.slug}`}
                className="block bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 hover:border-emerald-500/30 transition-all group h-full"
              >
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-lg font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors">{c.name}</h2>
                  <MapPin size={16} className="text-emerald-500 flex-shrink-0 mt-1" />
                </div>
                <p className="text-sm text-zinc-500 mb-3">{c.department}</p>
                <div className="flex flex-wrap gap-2">
                  {c.supermarketCount > 0 && <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-full">{c.supermarketCount} supermercados</span>}
                  {c.pharmacyCount > 0 && <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-full">{c.pharmacyCount} farmacias</span>}
                  <span className="text-xs bg-emerald-900/30 text-emerald-400 px-2 py-1 rounded-full">
                    {(c.productCount || 0).toLocaleString('es-CO')} productos
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      <p className="text-xs text-zinc-600 mt-8 text-center">
        {ciudades.length} ciudades • {filtered.length} {filtered.length === 1 ? 'coincide' : 'coinciden'} con tu búsqueda
      </p>
    </>
  );
}
