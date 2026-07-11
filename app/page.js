'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { Section } from '../packages/ui/src/components/section';
import { Container } from '../packages/ui/src/components/container';
import { Divider } from '../packages/ui/src/components/divider';
import { EmptyState } from '../packages/ui/src/components/empty-state';
import { WebSiteJsonLd } from '../components/seo/JsonLd';
import { motion } from 'framer-motion';
import { ArrowRight, Smartphone, TrendingUp, ShoppingBag, Shield, Zap } from 'lucide-react';

const Hero = dynamic(() => import('../components/home/Hero'), { ssr: false });
const SupermarketCarousel = dynamic(() => import('../components/home/StoreCarousel').then((m) => ({ default: m.SupermarketCarousel })), { ssr: false });
const PharmacyCarousel = dynamic(() => import('../components/home/StoreCarousel').then((m) => ({ default: m.PharmacyCarousel })), { ssr: false });
const CategoryGrid = dynamic(() => import('../components/home/CategoryGrid'), { ssr: false });
const ProductGrid = dynamic(() => import('../components/product/ProductGrid'), { ssr: false });

const FEATURES = [
  { icon: TrendingUp, title: 'Mejores precios', desc: 'Comparamos precios publicados para que encuentres la mejor oferta disponible.' },
  { icon: Zap, title: 'Actualizacion continua', desc: 'Los scrapers y reportes actualizan el catalogo cuando la base de datos esta operativa.' },
  { icon: Shield, title: 'Datos verificables', desc: 'Cada precio debe conservar origen, fecha de captura e historial.' },
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

function ProductSectionBody({ loading, products, emptyTitle, emptyDescription }) {
  if (loading || products.length > 0) {
    return <ProductGrid products={products} loading={loading} />;
  }

  return (
    <EmptyState
      variant="products"
      title={emptyTitle}
      description={emptyDescription}
    />
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        const response = await fetch('/api/products?city=Cali&limit=12', { cache: 'no-store' });
        const payload = await response.json();
        if (active) {
          setProducts((payload.data || []).map(toProductCard));
        }
      } catch {
        if (active) setProducts([]);
      } finally {
        if (active) setLoadingProducts(false);
      }
    }

    loadProducts();
    return () => {
      active = false;
    };
  }, []);

  const discountedProducts = products.filter((product) => product.oldPrice && product.price);

  return (
    <div className="min-h-screen bg-zinc-950">
      <WebSiteJsonLd />
      <Header />
      <Hero />

      <Container className="space-y-6 sm:space-y-8 pb-8">
        <Section
          title="Ofertas del dia"
          subtitle="Productos con descuentos reales publicados por comercios"
          action={<Link href="/buscar?q=ofertas" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium inline-flex items-center gap-1">Ver todas <ArrowRight size={14} /></Link>}
        >
          <ProductSectionBody
            loading={loadingProducts}
            products={discountedProducts.slice(0, 4)}
            emptyTitle="Sin ofertas disponibles"
            emptyDescription="Cuando los comercios reporten descuentos reales, apareceran aqui."
          />
        </Section>

        <Section
          title="Productos destacados"
          subtitle="Catalogo publicado desde Supabase"
          action={<Link href="/buscar" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium inline-flex items-center gap-1">Explorar <ArrowRight size={14} /></Link>}
        >
          <ProductSectionBody
            loading={loadingProducts}
            products={products.slice(0, 8)}
            emptyTitle="Catalogo pendiente"
            emptyDescription="Supabase aun no tiene productos publicados para mostrar en esta seccion."
          />
        </Section>

        <Divider />

        <Section title="Supermercados" subtitle="Comercios disponibles en el catalogo">
          <SupermarketCarousel />
        </Section>

        <Section title="Farmacias" subtitle="Farmacias disponibles en el catalogo">
          <PharmacyCarousel />
        </Section>

        <Divider />

        <Section title="Categorias" subtitle="Explora por categoria">
          <CategoryGrid />
        </Section>

        <Divider />

        <Section
          title="Mayor ahorro"
          subtitle="Calculado desde precios actuales y anteriores"
        >
          <ProductSectionBody
            loading={loadingProducts}
            products={discountedProducts.slice(0, 4)}
            emptyTitle="Sin ahorros calculados"
            emptyDescription="Necesitamos precios reales y precios anteriores para calcular el ahorro."
          />
        </Section>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600/20 via-emerald-700/10 to-zinc-900 border border-emerald-500/20 p-6 sm:p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-emerald-600/30 flex items-center justify-center">
                <Smartphone size={28} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-100">App movil en preparacion</h3>
                <p className="text-sm text-zinc-400">El escaner y la lista de compras se activaran cuando la base real este poblada.</p>
              </div>
            </div>
            <Link href="/buscar" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20">
              <ShoppingBag size={16} /> Explorar catalogo
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-4 sm:p-5 text-center"
            >
              <feature.icon size={24} className="mx-auto text-emerald-400 mb-2" />
              <h3 className="text-sm font-semibold text-zinc-200 mb-1">{feature.title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </Container>
      <Footer />
    </div>
  );
}
