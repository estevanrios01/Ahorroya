'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, ShoppingCart, Pill, Milk, Beef, Home, Wine, Baby, Dog } from 'lucide-react';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import PageControls from '../../../components/layout/PageControls';
import ProductCardPremium from '../../../components/product/ProductCardPremium';
import { Badge } from '../../../packages/ui/src/components/badge';
import { Container } from '../../../packages/ui/src/components/container';
import { ProductCardSkeleton } from '../../../packages/ui/src/components/skeleton';

const iconMap = { ShoppingCart, Pill, Milk, Beef, Home, Wine, Baby, Dog };

export default function CategoryClient({ category, initialProducts, initialTotal = 0, degraded = false }) {
  const [products, setProducts] = useState(initialProducts || []);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(() => !(initialProducts || []).length);
  const [hasMore, setHasMore] = useState(products.length < initialTotal);
  const loaderRef = useRef(null);

  useEffect(() => {
    if ((initialProducts || []).length > 0) return;
    let cancelled = false;

    async function loadFallbackProducts() {
      setLoading(true);
      try {
        const response = await fetch(`/api/products?limit=24&q=${encodeURIComponent(category.name)}`);
        const json = await response.json();
        if (!cancelled && json.success) {
          setProducts(json.data || []);
          setTotal(json.pagination?.total || json.data?.length || 0);
          setHasMore(false);
        }
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadFallbackProducts();
    return () => {
      cancelled = true;
    };
  }, [category.name, initialProducts]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/categories/products?slug=${category.slug}&page=${nextPage}&limit=24`);
      const json = await res.json();
      if (json.success && json.data?.length > 0) {
        setProducts((prev) => [...prev, ...json.data]);
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
  const displayProducts = (products.length > 0 ? products : initialProducts).map((item) => {
    if (!item.store_products?.length) return item;
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
  });

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header />
      <main>
        <Container className="py-6 pb-16 sm:py-8">
        <PageControls backHref="/categorias" forwardHref={`/buscar?q=${encodeURIComponent(category.name)}`} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
          <div className="mb-4 flex items-center gap-3 sm:gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-emerald-600/30 bg-emerald-600/20 sm:h-14 sm:w-14">
              <Icon size={24} className="text-emerald-400" />
            </div>
            <div>
              <nav className="mb-1 flex items-center gap-1.5 text-xs text-zinc-600">
                <Link href="/" className="transition-colors hover:text-zinc-400">Inicio</Link>
                <span>/</span>
                <span className="text-zinc-400">Categorias</span>
              </nav>
              <h1 className="text-xl font-bold text-zinc-100 sm:text-2xl lg:text-3xl">{category.name}</h1>
              {category.description && <p className="mt-0.5 text-sm text-zinc-500">{category.description}</p>}
            </div>
          </div>
          <Badge variant="default" size="md">{total || displayProducts.length} productos</Badge>
        </motion.div>

        {degraded && (
          <div className="mb-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Mostrando productos relacionados mientras actualizamos esta categoria.
          </div>
        )}

        {(displayProducts.length > 0 || loading) && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {displayProducts.map((p, i) => (
              <motion.div key={p.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (i % 24) * 0.02 }}>
                <ProductCardPremium product={p} eager={i < 4} />
              </motion.div>
            ))}
            {loading && Array.from({ length: displayProducts.length ? 4 : 8 }).map((_, i) => <ProductCardSkeleton key={`sk-${i}`} />)}
          </div>
        )}

        {displayProducts.length === 0 && !loading && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 py-16 text-center text-zinc-500">
            <Search size={42} className="mx-auto mb-3 text-zinc-600" />
            <p className="text-base font-medium text-zinc-300">Categoria en actualizacion</p>
            <p className="mt-1 text-sm">Busca un producto puntual para compararlo entre comercios disponibles.</p>
            <Link href="/buscar" className="mt-5 inline-flex rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500">
              Buscar productos
            </Link>
          </div>
        )}

        {hasMore && <div ref={loaderRef} className="mt-4 h-12" />}
        </Container>
      </main>
      <Footer />
    </div>
  );
}
