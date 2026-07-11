'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const colors = [
  'bg-blue-600',
  'bg-red-600',
  'bg-green-600',
  'bg-orange-600',
  'bg-yellow-600',
  'bg-teal-600',
  'bg-blue-800',
  'bg-purple-600',
  'bg-emerald-600',
  'bg-rose-600',
];

function colorFor(slug = '') {
  const index = [...slug].reduce((total, char) => total + char.charCodeAt(0), 0);
  return colors[index % colors.length];
}

function StoreCard({ name, slug, type, category }) {
  const hrefType = type || (category === 'Farmacia' ? 'farmacia' : 'supermercado');

  return (
    <Link href={`/${hrefType}/${slug}`}>
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col items-center gap-3 p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer group"
      >
        <div className={`h-14 w-14 sm:h-16 sm:w-16 rounded-2xl ${colorFor(slug)} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
          <span className="text-white font-bold text-sm sm:text-base uppercase tracking-wider">
            {name.slice(0, 2)}
          </span>
        </div>
        <span className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100 transition-colors text-center line-clamp-2">
          {name}
        </span>
      </motion.div>
    </Link>
  );
}

function StoreGrid({ category, type, limit }) {
  const [stores, setStores] = useState([]);

  useEffect(() => {
    let active = true;
    fetch('/api/stores', { cache: 'no-store' })
      .then((response) => response.json())
      .then((payload) => {
        if (!active) return;
        setStores(payload.data || []);
      })
      .catch(() => {
        if (active) setStores([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const visible = useMemo(() => (
    stores
      .filter((store) => category.includes(store.category))
      .slice(0, limit)
  ), [stores, category, limit]);

  if (visible.length === 0) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {Array.from({ length: Math.min(limit, 10) }).map((_, index) => (
          <div key={index} className="h-32 rounded-2xl bg-zinc-900/70 border border-zinc-800 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-10 gap-3">
      {visible.map((store) => (
        <StoreCard key={store.slug} {...store} type={type} />
      ))}
    </div>
  );
}

export function SupermarketCarousel() {
  return <StoreGrid category={['Supermercado']} type="supermercado" limit={20} />;
}

export function PharmacyCarousel() {
  return <StoreGrid category={['Farmacia', 'Drogueria', 'Droguería']} type="farmacia" limit={12} />;
}
