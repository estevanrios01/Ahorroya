'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, Pill, Milk, Beef, Home, Wine } from 'lucide-react';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import ProductCardPremium from '../../../components/product/ProductCardPremium';
import { Badge } from '../../../packages/ui/src/components/badge';
import { Container } from '../../../packages/ui/src/components/container';

const iconMap = { ShoppingCart, Pill, Milk, Beef, Home, Wine };

export default function CategoryClient({ category, products }) {
  const Icon = iconMap[category.icon] || ShoppingCart;

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header />
      <Container className="py-8 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-14 w-14 rounded-2xl bg-emerald-600/20 border border-emerald-600/30 flex items-center justify-center">
              <Icon size={28} className="text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Inicio</Link>
                <span className="text-xs text-zinc-600">/</span>
                <span className="text-xs text-zinc-400">Categorías</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100">{category.name}</h1>
              <p className="text-zinc-500 mt-1">{category.description}</p>
            </div>
          </div>
          <Badge variant="default" size="md">{products.length} productos</Badge>
        </motion.div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <ProductCardPremium product={p} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-zinc-500 bg-zinc-900/30 rounded-2xl border border-zinc-800">
            <Icon size={48} className="mx-auto mb-3 text-zinc-600" />
            <p className="text-lg font-medium text-zinc-400">Próximamente</p>
            <p className="text-sm mt-1">Estamos agregando productos de esta categoría</p>
          </div>
        )}
      </Container>
      <Footer />
    </div>
  );
}
