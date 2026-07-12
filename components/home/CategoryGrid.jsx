'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Baby, Beef, Dog, Home, Milk, Pill, ShoppingCart, Sparkles, Wine } from 'lucide-react';

const categories = [
  { name: 'Mercado', icon: ShoppingCart, slug: 'mercado', desc: 'Despensa, granos y básicos', color: 'from-emerald-600 to-green-800' },
  { name: 'Farmacia', icon: Pill, slug: 'farmacia', desc: 'Medicamentos y cuidado personal', color: 'from-rose-600 to-red-800' },
  { name: 'Lácteos', icon: Milk, slug: 'lacteos', desc: 'Leches, quesos y yogures', color: 'from-blue-600 to-sky-800' },
  { name: 'Carnes', icon: Beef, slug: 'carnes', desc: 'Pollo, res, cerdo y huevos', color: 'from-red-600 to-orange-800' },
  { name: 'Aseo', icon: Home, slug: 'aseo', desc: 'Hogar, limpieza y lavandería', color: 'from-teal-600 to-cyan-800' },
  { name: 'Bebés', icon: Baby, slug: 'bebes', desc: 'Pañales, fórmulas y cuidado', color: 'from-pink-600 to-fuchsia-800' },
  { name: 'Mascotas', icon: Dog, slug: 'mascotas', desc: 'Alimentos y accesorios', color: 'from-amber-600 to-yellow-800' },
  { name: 'Bebidas', icon: Wine, slug: 'bebidas', desc: 'Gaseosas, aguas y jugos', color: 'from-violet-600 to-purple-800' },
];

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((category, index) => {
        const Icon = category.icon;
        return (
          <motion.div
            key={category.slug}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.025, duration: 0.25 }}
          >
            <Link
              href={`/categoria/${category.slug}`}
              className={`group relative block min-h-[150px] overflow-hidden rounded-2xl bg-gradient-to-br ${category.color} p-5 shadow-lg shadow-black/15 transition-transform hover:-translate-y-1`}
            >
              <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/10" />
              <Sparkles className="absolute right-4 top-4 h-5 w-5 text-white/20" />
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                  <Icon size={21} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{category.name}</h3>
                  <p className="mt-1 text-xs leading-5 text-white/75">{category.desc}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
