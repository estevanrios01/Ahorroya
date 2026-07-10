'use client';

import Link from 'next/link';
import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Phone, Store, Package, ChevronRight } from 'lucide-react';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import ProductCardPremium from '../../../components/product/ProductCardPremium';
import { Badge } from '../../../packages/ui/src/components/badge';
import { Container } from '../../../packages/ui/src/components/container';
import { ProductCardSkeleton } from '../../../packages/ui/src/components/skeleton';

const PAGE_SIZE = 24;

const storeLogos = {
  'exito': { initials: 'EX', gradient: 'from-blue-600 to-blue-800' },
  'd1': { initials: 'D1', gradient: 'from-red-600 to-red-800' },
  'jumbo': { initials: 'JU', gradient: 'from-orange-600 to-orange-800' },
  'ara': { initials: 'AR', gradient: 'from-green-600 to-green-800' },
  'carulla': { initials: 'CA', gradient: 'from-teal-600 to-teal-800' },
  'olimpica': { initials: 'OL', gradient: 'from-yellow-600 to-yellow-700' },
  'cruz-verde': { initials: 'CV', gradient: 'from-emerald-600 to-emerald-800' },
  'farmatodo': { initials: 'FT', gradient: 'from-green-500 to-green-700' },
  'la-rebaja': { initials: 'LR', gradient: 'from-red-500 to-red-700' },
  'pasteur': { initials: 'PA', gradient: 'from-blue-500 to-blue-700' },
  'colsubsidio': { initials: 'CS', gradient: 'from-yellow-500 to-orange-600' },
  'locatel': { initials: 'LO', gradient: 'from-rose-600 to-rose-800' },
};

export default function StoreClient({ store, products: initialProducts, totalProducts = 0, loadMore }) {
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState(() => initialProducts || []);
  const [loading, setLoading] = useState(false);
  const hasMore = allProducts.length < totalProducts;
  const loaderRef = useRef(null);

  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && loadMore) {
          setLoading(true);
          try {
            const nextPage = page + 1;
            const more = await loadMore(nextPage);
            if (more && more.length > 0) {
              setAllProducts(prev => [...prev, ...more]);
              setPage(nextPage);
            }
          } catch {}
          setLoading(false);
        }
      },
      { rootMargin: '300px' }
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadMore, page]);

  const logo = storeLogos[store.slug] || { initials: store.name.slice(0, 2).toUpperCase(), gradient: 'from-zinc-600 to-zinc-800' };

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header />
      <div className={`h-24 sm:h-36 lg:h-48 bg-gradient-to-r ${logo.gradient} opacity-15`} />
      <Container className="relative -mt-12 sm:-mt-20 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className={`h-16 w-16 sm:h-24 sm:w-24 rounded-2xl bg-gradient-to-br ${logo.gradient} flex items-center justify-center shadow-2xl shadow-black/40 border-4 border-zinc-950 flex-shrink-0`}>
            <span className="text-white font-bold text-lg sm:text-2xl uppercase">{logo.initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <Badge variant={store.type === 'farmacia' ? 'info' : 'success'} size="sm" className="mb-1.5">
              {store.type === 'farmacia' ? 'Farmacia' : 'Supermercado'}
            </Badge>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-zinc-100">{store.name}</h1>
            {store.description && <p className="text-sm text-zinc-500 mt-1 max-w-xl">{store.description}</p>}
          </div>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6 sm:mb-8">
          {[
            { icon: Package, label: 'Productos', value: totalProducts || displayed.length },
            { icon: MapPin, label: 'Sucursales', value: store.branches || '-' },
            { icon: Clock, label: 'Horario', value: store.schedule || 'Consultar' },
            { icon: Store, label: 'Tipo', value: store.type === 'farmacia' ? 'Farmacia' : 'Supermercado' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 sm:p-4 text-center">
              <stat.icon size={18} className="mx-auto text-zinc-500 mb-1.5" />
              <div className="text-base sm:text-lg font-bold text-zinc-100">{stat.value}</div>
              <div className="text-xs text-zinc-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <section>
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-100">Productos en {store.name}</h2>
            <span className="text-sm text-zinc-500">{totalProducts || displayed.length} productos</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {displayed.map((p, i) => (
              <ProductCardPremium key={p.id} product={{
                ...p,
                price: p.storePrice?.price || p.bestPrice,
                oldPrice: p.storePrice?.oldPrice,
                storesCount: 1,
                image: p.image,
              }} />
            ))}
            {loading && Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={`sk-${i}`} />)}
          </div>
          {hasMore && <div ref={loaderRef} className="h-10" />}
        </section>
      </Container>
      <Footer />
    </div>
  );
}
