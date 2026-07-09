'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const supermarkets = [
  { name: 'Éxito', slug: 'exito', color: 'bg-blue-600' },
  { name: 'D1', slug: 'd1', color: 'bg-red-600' },
  { name: 'Ara', slug: 'ara', color: 'bg-green-600' },
  { name: 'Jumbo', slug: 'jumbo', color: 'bg-orange-600' },
  { name: 'Olímpica', slug: 'olimpica', color: 'bg-yellow-600' },
  { name: 'Carulla', slug: 'carulla', color: 'bg-teal-600' },
  { name: 'Makro', slug: 'makro', color: 'bg-blue-800' },
  { name: 'Alkosto', slug: 'alkosto', color: 'bg-red-700' },
  { name: 'Metro', slug: 'metro', color: 'bg-sky-600' },
  { name: 'Surtimayorista', slug: 'surtimayorista', color: 'bg-purple-600' },
];

const pharmacies = [
  { name: 'Farmatodo', slug: 'farmatodo', color: 'bg-green-500' },
  { name: 'Cruz Verde', slug: 'cruz-verde', color: 'bg-emerald-600' },
  { name: 'La Rebaja', slug: 'la-rebaja', color: 'bg-red-500' },
  { name: 'Pasteur', slug: 'pasteur', color: 'bg-blue-500' },
  { name: 'Colsubsidio', slug: 'colsubsidio', color: 'bg-yellow-500' },
  { name: 'Locatel', slug: 'locatel', color: 'bg-rose-600' },
];

function StoreCard({ name, slug, color, type }) {
  return (
    <Link href={`/${type}/${slug}`}>
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col items-center gap-3 p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer group"
      >
        <div className={`h-14 w-14 sm:h-16 sm:w-16 rounded-2xl ${color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
          <span className="text-white font-bold text-sm sm:text-base uppercase tracking-wider">
            {name.slice(0, 2)}
          </span>
        </div>
        <span className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100 transition-colors text-center">
          {name}
        </span>
      </motion.div>
    </Link>
  );
}

export function SupermarketCarousel() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-10 gap-3">
      {supermarkets.map((store) => (
        <StoreCard key={store.slug} {...store} type="supermercado" />
      ))}
    </div>
  );
}

export function PharmacyCarousel() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
      {pharmacies.map((store) => (
        <StoreCard key={store.slug} {...store} type="farmacia" />
      ))}
    </div>
  );
}
