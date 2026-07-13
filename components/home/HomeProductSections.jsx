'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductGrid from '../product/ProductGrid';
import { EmptyState } from '../../packages/ui/src/components/empty-state';
import { Section } from '../../packages/ui/src/components/section';

function toProductCard(product) {
  const listings = (product.store_products || []).filter((item) => item.available !== false && item.price != null);
  const ordered = [...listings].sort((a, b) => Number(a.price) - Number(b.price));
  const best = ordered[0];
  const originalPrice = best?.original_price ? Number(best.original_price) : null;

  return {
    id: product.id,
    name: product.name,
    brand: product.brands?.name || '',
    price: best ? Number(best.price) : null,
    oldPrice: originalPrice && best && originalPrice > Number(best.price) ? originalPrice : null,
    storesCount: new Set(listings.map((item) => item.store_id || item.stores?.slug)).size,
    bestStore: best?.stores?.name || '',
    store_products: listings,
    slug: product.slug,
    presentation: product.unit || product.short_name || '',
    image: product.image,
    isCheapest: ordered.length > 1,
  };
}

function ProductSectionBody({ loading, products }) {
  if (loading || products.length > 0) {
    return <ProductGrid products={products} loading={loading} />;
  }

  return (
    <EmptyState
      variant="products"
      title="Sin productos verificables por ahora"
      description="No mostramos productos sin precio e imagen confiable. Busca un producto puntual para consultar fuentes vivas disponibles."
    />
  );
}

export default function HomeProductSections() {
  const [products, setProducts] = useState([]);
  const [degraded, setDegraded] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        const response = await fetch('/api/products?limit=16', { cache: 'no-store' });
        const payload = await response.json();
        if (active) {
          setProducts((payload.data || []).map(toProductCard).filter((product) => product.image));
          setDegraded(Boolean(payload.degraded));
        }
      } catch {
        if (active) {
          setProducts([]);
          setDegraded(true);
        }
      } finally {
        if (active) setLoadingProducts(false);
      }
    }

    loadProducts();
    return () => {
      active = false;
    };
  }, []);

  const discountedProducts = useMemo(
    () => products.filter((product) => product.oldPrice && product.price).slice(0, 8),
    [products]
  );

  return (
    <>
      {degraded && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Mostrando precios desde fuentes vivas mientras la base principal vuelve a estar disponible.
        </div>
      )}

      <Section
        title="Productos para comparar ahora"
        subtitle="Referencias con imagen comercial, precio publicado y comercio de menor precio"
        action={<Link href="/buscar" className="inline-flex items-center gap-1 text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300">Explorar <ArrowRight size={14} /></Link>}
      >
        <ProductSectionBody loading={loadingProducts} products={products.slice(0, 8)} />
      </Section>

      {discountedProducts.length > 0 && (
        <Section
          title="Bajaron de precio"
          subtitle="Productos con descuento detectado frente al precio anterior"
          action={<Link href="/buscar?q=ofertas" className="inline-flex items-center gap-1 text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300">Ver ofertas <ArrowRight size={14} /></Link>}
        >
          <ProductSectionBody loading={loadingProducts} products={discountedProducts} />
        </Section>
      )}
    </>
  );
}
