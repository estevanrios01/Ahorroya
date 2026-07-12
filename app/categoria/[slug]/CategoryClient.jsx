'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, ShoppingCart, Pill, Milk, Beef, Home, Wine, Baby, Dog } from 'lucide-react';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import ProductCardPremium from '../../../components/product/ProductCardPremium';
import { Badge } from '../../../packages/ui/src/components/badge';
import { Container } from '../../../packages/ui/src/components/container';
import { ProductCardSkeleton } from '../../../packages/ui/src/components/skeleton';

const iconMap = { ShoppingCart, Pill, Milk, Beef, Home, Wine, Baby, Dog };

export default function CategoryClient({ category, initialProducts, initialTotal = 0, degraded = false }) {
  const [products, setProducts] = useState(initialProducts || []);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(products.length < initialTotal);
  const loaderRef = useRef(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/categories/products?slug=${category.slug}&page=${nextPage}&limit=24`);
      const json = await res.json();
      if (json.success && json.data?.length > 0) {
        setProducts(prev => [...prev, ...json.data]);
        setPage(nextPage);
        setHasMore(products.length + json.data.length < initialTotal);
      } else {
        setHasMore(false);
      }
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, category.slug, initialTotal, products.length]);

  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) loadMore();
      },
      { rootMargin: '300px' }
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  const Icon = iconMap[category.icon] || ShoppingCart;
  const displayProducts = products.length > 0 ? products : initialProducts;

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header />
      <Container className="py-6 sm:py-8 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-emerald-600/20 border border-emerald-600/30 flex items-center justify-center flex-shrink-0">
              <Icon size={24} className="text-emerald-400" />
            </div>
            <div>
              <nav className="flex items-center gap-1.5 text-xs text-zinc-600 mb-1">
                <Link href="/" className="hover:text-zinc-400 transition-colors">Inicio</Link>
                <span>/</span>
                <span className="text-zinc-400">Categorías</span>
              </nav>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-zinc-100">{category.name}</h1>
              {category.description && <p className="text-sm text-zinc-500 mt-0.5">{category.description}</p>}
            </div>
          </div>
          <Badge variant="default" size="md">{total || displayProducts.length} productos</Badge>
        </motion.div>

        {degraded && (
          <div className="mb-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Mostrando productos relacionados mientras actualizamos esta categoría.
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {displayProducts.map((p, i) => (
            <motion.div key={p.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (i % 24) * 0.02 }}>
              <ProductCardPremium product={p} />
            </motion.div>
          ))}
          {loading && Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={`sk-${i}`} />)}
        </div>

        {displayProducts.length === 0 && (
          <div className="text-center py-16 text-zinc-500 bg-zinc-900/30 rounded-2xl border border-zinc-800">
            <Search size={42} className="mx-auto mb-3 text-zinc-600" />
            <p className="text-base font-medium text-zinc-300">Categoría en actualización</p>
            <p className="text-sm mt-1">Busca un producto puntual para compararlo entre comercios disponibles.</p>
            <Link href="/buscar" className="mt-5 inline-flex rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500">
              Buscar productos
            </Link>
          </div>
        )}

        {hasMore && <div ref={loaderRef} className="h-12 mt-4" />}
      </Container>
      <Footer />
    </div>
  );
}
