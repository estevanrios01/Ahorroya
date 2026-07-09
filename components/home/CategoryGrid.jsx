'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, Pill, Milk, Beef, Home, Baby, Dog, Wine } from 'lucide-react';

const categories = [
  { name: 'Mercado', icon: ShoppingCart, slug: 'mercado', color: 'from-emerald-600 to-emerald-800' },
  { name: 'Farmacia', icon: Pill, slug: 'farmacia', color: 'from-rose-600 to-rose-800' },
  { name: 'Lácteos', icon: Milk, slug: 'lacteos', color: 'from-blue-600 to-blue-800' },
  { name: 'Carnes', icon: Beef, slug: 'carnes', color: 'from-red-600 to-red-800' },
  { name: 'Aseo', icon: Home, slug: 'aseo', color: 'from-teal-600 to-teal-800' },
  { name: 'Bebés', icon: Baby, slug: 'bebes', color: 'from-pink-600 to-pink-800' },
  { name: 'Mascotas', icon: Dog, slug: 'mascotas', color: 'from-amber-600 to-amber-800' },
  { name: 'Bebidas', icon: Wine, slug: 'bebidas', color: 'from-purple-600 to-purple-800' },
];

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
      {categories.map((cat, i) => {
        const Icon = cat.icon;
        return (
          <motion.div
            key={cat.slug}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
          >
            <Link
              href={`/categoria/${cat.slug}`}
              className="group block relative overflow-hidden rounded-2xl p-5 sm:p-6 bg-gradient-to-br ${cat.color} min-h-[140px] sm:min-h-[160px]"
            >
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              <div className="relative z-10 flex flex-col items-start justify-between h-full">
                <div className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                  <Icon size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:translate-x-1 transition-transform">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-white/70 mt-0.5">Ver productos →</p>
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
