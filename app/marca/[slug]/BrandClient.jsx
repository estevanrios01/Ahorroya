'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, ShoppingBag, Globe } from 'lucide-react';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import ProductCardPremium from '../../../components/product/ProductCardPremium';
import { Badge } from '../../../packages/ui/src/components/badge';
import { Container } from '../../../packages/ui/src/components/container';

export default function BrandClient({ brand, products }) {
  const groupedCategories = products.reduce((acc, p) => {
    const cat = p.category || 'Otros';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header />
      <Container className="py-8 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <ShoppingBag size={28} className="text-zinc-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Inicio</Link>
                <span className="text-xs text-zinc-600">/</span>
                <Link href="/marcas" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Marcas</Link>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100">{brand.name}</h1>
              <p className="text-zinc-500 mt-1 max-w-xl">{brand.description}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default" size="md"><Package size={12} className="mr-1" />{products.length} productos</Badge>
            <Badge variant="default" size="md"><Globe size={12} className="mr-1" />{brand.country}</Badge>
          </div>
        </motion.div>

        {brand.categories && (
          <div className="flex flex-wrap gap-2 mb-8">
            {brand.categories.map((cat, i) => (
              <Badge key={i} variant="success" size="md">{cat}</Badge>
            ))}
          </div>
        )}

        {products.length > 0 ? (
          Object.entries(groupedCategories).map(([category, categoryProducts]) => (
            <section key={category} className="mb-10">
              <h2 className="text-lg font-semibold text-zinc-200 mb-4">{category}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {categoryProducts.map((p, i) => (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <ProductCardPremium product={p} />
                  </motion.div>
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="text-center py-16 text-zinc-500 bg-zinc-900/30 rounded-2xl border border-zinc-800">
            <Package size={48} className="mx-auto mb-3 text-zinc-600" />
            <p className="text-lg font-medium text-zinc-400">Próximamente</p>
            <p className="text-sm mt-1">Estamos agregando productos de {brand.name}</p>
          </div>
        )}
      </Container>
      <Footer />
    </div>
  );
}
