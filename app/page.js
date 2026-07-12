'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowRight, CheckCircle2, MapPin, RefreshCw, Search, ShieldCheck, Store, TrendingDown } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { WebSiteJsonLd } from '../components/seo/JsonLd';
import { Container } from '../packages/ui/src/components/container';
import { Divider } from '../packages/ui/src/components/divider';
import { EmptyState } from '../packages/ui/src/components/empty-state';
import { Section } from '../packages/ui/src/components/section';

const Hero = dynamic(() => import('../components/home/Hero'), { ssr: false });
const SupermarketCarousel = dynamic(() => import('../components/home/StoreCarousel').then((module) => ({ default: module.SupermarketCarousel })), { ssr: false });
const PharmacyCarousel = dynamic(() => import('../components/home/StoreCarousel').then((module) => ({ default: module.PharmacyCarousel })), { ssr: false });
const CategoryGrid = dynamic(() => import('../components/home/CategoryGrid'), { ssr: false });
const ProductGrid = dynamic(() => import('../components/product/ProductGrid'), { ssr: false });

const cityLinks = [
  { name: 'Cali', slug: 'cali', detail: 'Valle del Cauca' },
  { name: 'Bogotá', slug: 'bogota', detail: 'Cundinamarca' },
  { name: 'Medellín', slug: 'medellin', detail: 'Antioquia' },
  { name: 'Barranquilla', slug: 'barranquilla', detail: 'Atlántico' },
  { name: 'Cartagena', slug: 'cartagena', detail: 'Bolívar' },
  { name: 'Bucaramanga', slug: 'bucaramanga', detail: 'Santander' },
];

const trustItems = [
  { icon: ShieldCheck, title: 'Fotos verificadas', text: 'Se priorizan imágenes publicadas por los comercios.' },
  { icon: RefreshCw, title: 'Precios con fecha', text: 'Cada precio guarda captura e historial para detectar cambios.' },
  { icon: TrendingDown, title: 'Comparación útil', text: 'Ordenamos por menor precio y comercios disponibles.' },
];

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
    storesCount: new Set(listings.map((item) => item.store_id)).size,
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
      title="Catálogo en actualización"
      description="Estamos consultando los comercios. Intenta de nuevo en unos minutos o busca un producto puntual."
    />
  );
}

export default function Home() {
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
    <div className="min-h-screen bg-zinc-950">
      <WebSiteJsonLd />
      <Header />
      <Hero />

      <Container className="space-y-8 pb-10 pt-8">
        {degraded && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Estamos mostrando productos de respaldo en vivo mientras la base principal termina de responder.
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {trustItems.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
              <Icon className="mb-3 h-5 w-5 text-emerald-400" />
              <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
              <p className="mt-1 text-xs leading-5 text-zinc-500">{text}</p>
            </div>
          ))}
        </div>

        <Section
          title="Productos para comparar ahora"
          subtitle="Referencias con imagen comercial y precio publicado"
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

        <Divider />

        <Section title="Elige tu ciudad" subtitle="Compara según la cobertura disponible por ubicación">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cityLinks.map((city) => (
              <Link
                key={city.slug}
                href={`/buscar?city=${encodeURIComponent(city.name)}`}
                className="group flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 transition-all hover:border-emerald-500/30 hover:bg-zinc-900"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                    <MapPin size={18} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-zinc-100">{city.name}</span>
                    <span className="block text-xs text-zinc-500">{city.detail}</span>
                  </span>
                </span>
                <ArrowRight size={16} className="text-zinc-600 transition-colors group-hover:text-emerald-400" />
              </Link>
            ))}
          </div>
        </Section>

        <Section title="Supermercados" subtitle="Cadenas nacionales y regionales incluidas en el catálogo">
          <SupermarketCarousel />
        </Section>

        <Section title="Farmacias" subtitle="Precios de droguerías y farmacias con cobertura nacional">
          <PharmacyCarousel />
        </Section>

        <Divider />

        <Section title="Categorías principales" subtitle="Accede rápido a productos de compra frecuente">
          <CategoryGrid />
        </Section>

        <div className="grid gap-4 rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-emerald-400">
              <CheckCircle2 size={14} />
              Comparador operativo
            </p>
            <h2 className="mt-2 text-xl font-bold text-zinc-100">Busca un producto y revisa el comercio más barato.</h2>
            <p className="mt-1 text-sm leading-6 text-zinc-500">
              La lógica ya prioriza fotos reales, precios verificables y cobertura por ciudad. El siguiente salto es aumentar scrapers por comercio para profundizar inventario.
            </p>
          </div>
          <Link href="/buscar" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-colors hover:bg-emerald-500">
            <Search size={16} />
            Buscar productos
          </Link>
        </div>
      </Container>
      <Footer />
    </div>
  );
}
