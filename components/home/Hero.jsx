'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, MapPin, TrendingDown, Store, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const popular = ['Arroz', 'Aceite', 'Leche', 'Huevos', 'Café', 'Detergente', 'Acetaminofén'];
const cities = ['Cali', 'Bogotá', 'Medellín', 'Barranquilla'];

export default function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');

  function handleSearch(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (city) params.set('city', city);
    router.push(`/buscar${params.toString() ? `?${params.toString()}` : ''}`);
  }

  return (
    <section className="relative overflow-hidden border-b border-zinc-900 bg-zinc-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.16),transparent_42%)]" />

      <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="max-w-3xl"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Comparador nacional de supermercados y farmacias
          </div>

          <h1 className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-zinc-50 sm:text-5xl lg:text-6xl">
            Compara precios reales antes de comprar.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
            Busca un producto, filtra por ciudad y revisa en qué comercio aparece más barato. AhorroYa prioriza precios con origen verificable, fecha de captura e imagen publicada por el comercio.
          </p>

          <form onSubmit={handleSearch} className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-2 shadow-2xl shadow-black/20">
            <div className="grid gap-2 md:grid-cols-[1fr_180px_auto]">
              <label className="relative block">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar arroz, leche, aceite, pañales..."
                  className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950 pl-10 pr-3 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-500 focus:border-emerald-500/60"
                  aria-label="Buscar producto"
                />
              </label>

              <label className="relative block">
                <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <select
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className="h-12 w-full appearance-none rounded-xl border border-zinc-800 bg-zinc-950 pl-10 pr-3 text-sm text-zinc-100 outline-none transition-colors focus:border-emerald-500/60"
                  aria-label="Seleccionar ciudad"
                >
                  <option value="">Todas</option>
                  {cities.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>

              <button className="h-12 rounded-xl bg-emerald-600 px-6 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-colors hover:bg-emerald-500">
                Comparar
              </button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {popular.map((item) => (
              <Link
                key={item}
                href={`/buscar?q=${encodeURIComponent(item)}`}
                className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-emerald-500/30 hover:text-zinc-100"
              >
                {item}
              </Link>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.35 }}
          className="grid content-start gap-3 sm:grid-cols-3 lg:grid-cols-1"
        >
          {[
            { icon: Store, label: 'Cobertura', value: '55 comercios', detail: 'Supermercados y farmacias indexados' },
            { icon: TrendingDown, label: 'Catálogo', value: '200K+ productos', detail: 'Referencias activas en la base nacional' },
            { icon: ShieldCheck, label: 'Calidad', value: 'Fotos reales', detail: 'Se ocultan fotos genéricas o no verificables' },
          ].map(({ icon: Icon, label, value, detail }) => (
            <div key={label} className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <Icon size={20} />
              </div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</p>
              <p className="mt-1 text-xl font-bold text-zinc-100">{value}</p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">{detail}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
