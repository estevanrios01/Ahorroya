'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const fallbackStores = [
  { name: 'Éxito', slug: 'exito', category: 'Supermercado' },
  { name: 'Olímpica', slug: 'olimpica', category: 'Supermercado' },
  { name: 'Jumbo', slug: 'jumbo', category: 'Supermercado' },
  { name: 'Carulla', slug: 'carulla', category: 'Supermercado' },
  { name: 'Ara', slug: 'ara', category: 'Supermercado' },
  { name: 'D1', slug: 'd1', category: 'Supermercado' },
  { name: 'Makro', slug: 'makro', category: 'Supermercado' },
  { name: 'Metro', slug: 'metro', category: 'Supermercado' },
  { name: 'Farmatodo', slug: 'farmatodo', category: 'Farmacia' },
  { name: 'Cruz Verde', slug: 'cruz-verde', category: 'Farmacia' },
  { name: 'La Rebaja', slug: 'larebaja', category: 'Farmacia' },
  { name: 'Locatel', slug: 'locatel', category: 'Farmacia' },
  { name: 'Pasteur', slug: 'pasteur', category: 'Farmacia' },
  { name: 'Colsubsidio', slug: 'colsubsidio', category: 'Farmacia' },
];

const colorMap = {
  exito: 'from-blue-600 to-yellow-500',
  olimpica: 'from-red-600 to-yellow-500',
  jumbo: 'from-red-600 to-orange-500',
  carulla: 'from-emerald-600 to-teal-500',
  ara: 'from-red-600 to-yellow-500',
  d1: 'from-red-600 to-red-800',
  makro: 'from-blue-700 to-yellow-500',
  metro: 'from-green-700 to-yellow-500',
  farmatodo: 'from-green-500 to-emerald-700',
  'cruz-verde': 'from-emerald-600 to-green-800',
  larebaja: 'from-red-600 to-red-800',
  locatel: 'from-rose-600 to-red-700',
  pasteur: 'from-blue-600 to-indigo-700',
  colsubsidio: 'from-yellow-500 to-orange-600',
};

function initials(name) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function hrefFor(store, type) {
  const route = type || (store.category === 'Farmacia' || store.category === 'Drogueria' || store.category === 'Droguería' ? 'farmacia' : 'supermercado');
  return `/${route}/${store.slug}`;
}

function StoreCard({ store, type, index }) {
  const gradient = colorMap[store.slug] || 'from-zinc-600 to-zinc-800';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.015 }}
    >
      <Link
        href={hrefFor(store, type)}
        className="group flex min-h-[132px] flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 transition-all hover:border-emerald-500/30 hover:bg-zinc-900"
      >
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-lg shadow-black/20`}>
          <span className="text-sm font-black tracking-wide text-white">{initials(store.name)}</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-100 line-clamp-2">{store.name}</p>
          <p className="mt-1 text-xs text-zinc-500">{store.category === 'Farmacia' ? 'Farmacia' : 'Supermercado'}</p>
        </div>
      </Link>
    </motion.div>
  );
}

function StoreGrid({ stores, categories, type, limit }) {
  // Stores now come from the server-rendered parent (app/page.js already
  // fetches db.stores.list() once, in parallel with the product list) instead
  // of each carousel fetching /api/stores client-side with cache: 'no-store'
  // after hydration. That used to show the same hardcoded 14-store fallback
  // to every visitor first, then swap it out after a round trip -- a visible
  // flash, an extra network hop on every page load, and a fully uncached
  // request for data that barely changes, on a page that needs to hold up
  // under a traffic spike.
  const source = Array.isArray(stores) && stores.length > 0 ? stores : fallbackStores;

  const visible = useMemo(() => (
    source
      .filter((store) => categories.includes(store.category))
      .slice(0, limit)
  ), [source, categories, limit]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {visible.map((store, index) => (
        <StoreCard key={`${store.slug}-${store.category}`} store={store} type={type} index={index} />
      ))}
    </div>
  );
}

const SUPERMARKET_CATEGORIES = ['Supermercado'];
const PHARMACY_CATEGORIES = ['Farmacia', 'Drogueria', 'Droguería'];

export function SupermarketCarousel({ stores }) {
  return <StoreGrid stores={stores} categories={SUPERMARKET_CATEGORIES} type="supermercado" limit={12} />;
}

export function PharmacyCarousel({ stores }) {
  return <StoreGrid stores={stores} categories={PHARMACY_CATEGORIES} type="farmacia" limit={8} />;
}
