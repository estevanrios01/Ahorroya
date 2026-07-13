'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, ShoppingBag, Globe, ChevronRight } from 'lucide-react';
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
      <main>
      <Container className="py-6 sm:py-8 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg">
              <ShoppingBag size={24} className="text-white" />
            </div>
            <div>
              <nav className="flex items-center gap-1.5 text-xs text-zinc-600 mb-1">
                <Link href="/" className="hover:text-zinc-400 transition-colors">Inicio</Link>
                <span>/</span>
                <Link href="/marcas" className="hover:text-zinc-400 transition-colors">Marcas</Link>
              </nav>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-zinc-100">{brand.name}</h1>
              {brand.description && <p className="text-sm text-zinc-500 mt-0.5 max-w-xl">{brand.description}</p>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default" size="md"><Package size={12} className="mr-1" />{products.length} productos</Badge>
            {brand.country && <Badge variant="default" size="md"><Globe size={12} className="mr-1" />{brand.country}</Badge>}
          </div>
        </motion.div>

        {products.length > 0 ? (
          Object.entries(groupedCategories).map(([category, categoryProducts]) => (
            <section key={category} className="mb-8 sm:mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-zinc-200">{category}</h2>
                <span className="text-xs text-zinc-500">{categoryProducts.length} productos</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {categoryProducts.map((p, i) => (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (i % 24) * 0.02 }}>
                    <ProductCardPremium product={p} eager={i < 4} />
                  </motion.div>
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="text-center py-16 text-zinc-500 bg-zinc-900/30 rounded-2xl border border-zinc-800">
            <Package size={48} className="mx-auto mb-3 text-zinc-600" />
            <p className="text-base font-medium text-zinc-400">Sin productos verificables de {brand.name}</p>
            <p className="text-sm mt-1">No publicamos precios ni imagenes que no podamos asociar a un comercio.</p>
            <Link href={`/buscar?q=${encodeURIComponent(brand.name)}`} className="mt-5 inline-flex rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500">
              Buscar {brand.name}
            </Link>
          </div>
        )}
      </Container>
      </main>
      <Footer />
    </div>
  );
}
