'use client';

import Link from 'next/link';
import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Store, Package, Search, ShieldCheck } from 'lucide-react';
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

export default function StoreClient({ store, products: initialProducts, totalProducts = 0, loadMore, degraded = false }) {
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState(() => initialProducts || []);
  const [totalCount, setTotalCount] = useState(totalProducts);
  const [loading, setLoading] = useState(() => !(initialProducts || []).length);
  const hasMore = totalCount > 0 && allProducts.length < totalCount;
  const loaderRef = useRef(null);

  useEffect(() => {
    if ((initialProducts || []).length > 0) return;
    let cancelled = false;
    async function loadFallbackProducts() {
      setLoading(true);
      try {
        const response = await fetch(`/api/products?limit=24&store=${encodeURIComponent(store.slug)}`);
        const json = await response.json();
        if (!cancelled && json.success) {
          setAllProducts(json.data || []);
          setTotalCount(json.pagination?.total || json.data?.length || 0);
        }
      } catch {
        if (!cancelled) setAllProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadFallbackProducts();
    return () => {
      cancelled = true;
    };
  }, [initialProducts, store.slug]);

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
  const displayed = allProducts.map((item) => {
    if (item.store_products?.length) {
      const availablePrices = item.store_products
        .filter((entry) => entry.available !== false && entry.price != null)
        .sort((left, right) => Number(left.price) - Number(right.price));
      const best = availablePrices[0];
      return {
        ...item,
        brand: item.brand || item.brands?.name || '',
        price: best ? Number(best.price) : null,
        oldPrice: best?.original_price ? Number(best.original_price) : null,
        storesCount: new Set(availablePrices.map((entry) => entry.store_id || entry.stores?.slug)).size,
        presentation: item.presentation || item.unit || item.short_name || '',
      };
    }
    if (!item.master_products) return item;
    return {
      ...item.master_products,
      storePrice: {
        price: item.price,
        oldPrice: item.original_price,
      },
      bestPrice: item.price,
      storesCount: 1,
    };
  });

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
            <p className="text-sm text-zinc-500 mt-1 max-w-xl">
              {store.description || `Compara productos publicados por ${store.name}, revisa precios disponibles y encuentra alternativas por ciudad.`}
            </p>
          </div>
        </motion.div>

        {degraded && displayed.length > 0 && (
          <div className="mb-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Mostrando productos publicados por {store.name} desde una fuente en vivo mientras la base principal termina de actualizarse.
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6 sm:mb-8">
          {[
            { icon: Package, label: 'Productos', value: totalCount || displayed.length },
            { icon: MapPin, label: 'Sucursales', value: store.branches || '-' },
            { icon: ShieldCheck, label: 'Datos', value: 'Verificables' },
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
            <span className="text-sm text-zinc-500">{totalCount || displayed.length} productos</span>
          </div>
          {displayed.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {displayed.map((p, i) => (
              <ProductCardPremium key={p.id} product={{
                ...p,
                price: p.price || p.storePrice?.price || p.bestPrice,
                oldPrice: p.oldPrice || p.storePrice?.oldPrice,
                storesCount: p.storesCount || 1,
                image: p.image,
              }} />
              ))}
              {loading && Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={`sk-${i}`} />)}
            </div>
          ) : loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={`loading-${i}`} />)}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 p-8 text-center">
              <Search size={34} className="mx-auto mb-3 text-zinc-600" />
              <h3 className="text-base font-semibold text-zinc-200">Catálogo en actualización</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
                No hay productos verificables de {store.name} en este momento. Para mantener la comparación correcta, no mezclamos productos de otros comercios en esta página.
              </p>
              <Link href="/buscar" className="mt-5 inline-flex rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500">
                Buscar productos
              </Link>
            </div>
          )}
          {hasMore && <div ref={loaderRef} className="h-10" />}
        </section>
      </Container>
      <Footer />
    </div>
  );
}
