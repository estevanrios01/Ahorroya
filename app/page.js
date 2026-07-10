'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { Section } from '../packages/ui/src/components/section';
import { Container } from '../packages/ui/src/components/container';
import { Divider } from '../packages/ui/src/components/divider';
import { ProductCardSkeleton } from '../packages/ui/src/components/skeleton';
import { WebSiteJsonLd } from '../components/seo/JsonLd';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Smartphone, TrendingUp, ShoppingBag, Shield, Zap } from 'lucide-react';

const Hero = dynamic(() => import('../components/home/Hero'), { ssr: false });
const SupermarketCarousel = dynamic(() => import('../components/home/StoreCarousel').then(m => ({ default: m.SupermarketCarousel })), { ssr: false });
const PharmacyCarousel = dynamic(() => import('../components/home/StoreCarousel').then(m => ({ default: m.PharmacyCarousel })), { ssr: false });
const CategoryGrid = dynamic(() => import('../components/home/CategoryGrid'), { ssr: false });
const ProductGrid = dynamic(() => import('../components/product/ProductGrid'), { ssr: false });

const FEATURED = [
  { id: 1, name: 'Arroz Diana Premium 1kg', brand: 'Diana', price: 3800, oldPrice: 4500, storesCount: 6, slug: 'arroz-diana-premium', presentation: 'Bolsa 1kg', isCheapest: true },
  { id: 2, name: 'Leche Entera Colanta 1L', brand: 'Colanta', price: 2600, oldPrice: 3200, storesCount: 4, slug: 'leche-entera-colanta', presentation: 'Caja 1 litro', priceDown: true },
  { id: 3, name: 'Aceite Vegetal Gourmet 900ml', brand: 'Gourmet', price: 12500, oldPrice: 14800, storesCount: 3, slug: 'aceite-gourmet-900ml', presentation: 'Botella 900ml' },
  { id: 4, name: 'Acetaminofén MK 500mg x30', brand: 'MK', price: 2850, oldPrice: 3600, storesCount: 4, slug: 'acetaminofen-mk-500mg', presentation: 'Tabletas x30', isNew: true },
  { id: 5, name: 'Pan Bimbo Artesano 500g', brand: 'Bimbo', price: 4800, oldPrice: 6100, storesCount: 3, slug: 'pan-bimbo-artesano', presentation: 'Paquete 500g', priceDown: true },
  { id: 6, name: 'Jabón Líquido Rey 500ml', brand: 'Rey', price: 4800, oldPrice: 5900, storesCount: 3, slug: 'jabon-liquido-rey', presentation: 'Botella 500ml' },
  { id: 7, name: 'Huevos Santa Reyes x30', brand: 'Santa Reyes', price: 13800, oldPrice: 16800, storesCount: 3, slug: 'huevos-santa-reyes-x30', presentation: 'Caja x30' },
  { id: 8, name: 'Café Sello Rojo 500g', brand: 'Sello Rojo', price: 8500, oldPrice: 10200, storesCount: 4, slug: 'cafe-sello-rojo-500g', presentation: 'Paquete 500g', isCheapest: true },
  { id: 9, name: 'Ibuprofeno MK 400mg x20', brand: 'MK', price: 5200, oldPrice: 6200, storesCount: 3, slug: 'ibuprofeno-mk-400mg', presentation: 'Tabletas x20' },
  { id: 10, name: 'Detergente FAB 1kg', brand: 'FAB', price: 7800, oldPrice: 9500, storesCount: 3, slug: 'detergente-fab-1kg', presentation: 'Bolsa 1kg', isNew: true },
  { id: 11, name: 'Gaseosa Coca-Cola 2.5L', brand: 'Coca-Cola', price: 4800, oldPrice: 5500, storesCount: 5, slug: 'coca-cola-25l', presentation: 'Botella 2.5L' },
  { id: 12, name: 'Arroz Roa Fortificado 1kg', brand: 'Roa', price: 3400, storesCount: 3, slug: 'arroz-roa-fortificado', presentation: 'Bolsa 1kg' },
];

const TESTIMONIALS = [
  { name: 'María González', text: 'AhorroYa me ayuda a encontrar los mejores precios sin recorrer todas las tiendas. Ahorro casi 30% en mi mercado cada mes.', role: 'Usuario, Cali', stars: 5 },
  { name: 'Carlos Mendoza', text: 'Increíble poder comparar precios de supermercados y farmacias en un solo lugar. Muy útil para el presupuesto familiar.', role: 'Usuario, Bogotá', stars: 5 },
  { name: 'Ana Lucía Pérez', text: 'La función de lista de compras me permite planificar mis mercados y encontrar la ruta más económica. Muy recomendado.', role: 'Usuario, Medellín', stars: 5 },
];

const FEATURES = [
  { icon: TrendingUp, title: 'Mejores precios', desc: 'Comparamos precios en tiempo real para que siempre encuentres la mejor oferta.' },
  { icon: Zap, title: 'Actualización diaria', desc: 'Precios actualizados cada 24 horas con información verificada de cada comercio.' },
  { icon: Shield, title: 'Datos confiables', desc: 'Información verificada directamente de las cadenas de supermercados y farmacias.' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <WebSiteJsonLd />
      <Header />
      <Hero />

      <Container className="space-y-6 sm:space-y-8 pb-8">
        <Section
          title="Ofertas del día"
          subtitle="Productos con los mejores descuentos"
          action={<Link href="/buscar?q=ofertas" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium inline-flex items-center gap-1">Ver todas <ArrowRight size={14} /></Link>}
        >
          <ProductGrid products={FEATURED.slice(0, 4)} />
        </Section>

        <Section
          title="Productos destacados"
          subtitle="Los más buscados por nuestra comunidad"
          action={<Link href="/buscar" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium inline-flex items-center gap-1">Explorar <ArrowRight size={14} /></Link>}
        >
          <ProductGrid products={FEATURED.slice(4, 8)} />
        </Section>

        <Divider />

        <Section title="Supermercados" subtitle="Los mejores precios en las principales cadenas">
          <SupermarketCarousel />
        </Section>

        <Section title="Farmacias" subtitle="Medicamentos y cuidado personal al mejor precio">
          <PharmacyCarousel />
        </Section>

        <Divider />

        <Section title="Categorías" subtitle="Explora por categoría">
          <CategoryGrid />
        </Section>

        <Divider />

        <Section
          title="Mayor ahorro"
          subtitle="Productos con los descuentos más grandes"
        >
          <ProductGrid products={FEATURED.filter(p => p.oldPrice > p.price).slice(0, 4)} />
        </Section>

        {/* App Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600/20 via-emerald-700/10 to-zinc-900 border border-emerald-500/20 p-6 sm:p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-emerald-600/30 flex items-center justify-center">
                <Smartphone size={28} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-100">Descarga nuestra App</h3>
                <p className="text-sm text-zinc-400">Escanea códigos de barras y compara precios al instante</p>
              </div>
            </div>
            <div className="flex gap-3">
              <a href="#" className="px-5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-300 hover:border-zinc-700 transition-all flex items-center gap-2">
                <ShoppingBag size={16} /> App Store
              </a>
              <a href="#" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20">
                <Smartphone size={16} /> Google Play
              </a>
            </div>
          </div>
        </div>

        {/* Testimonios */}
        <Section title="Lo que dicen nuestros usuarios" subtitle="Más de 10,000 personas ahorran con AhorroYa">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 hover:border-zinc-700/60 transition-all"
              >
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, si) => (
                    <Star key={si} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="text-sm font-medium text-zinc-100">{t.name}</p>
                  <p className="text-xs text-zinc-500">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-4 sm:p-5 text-center"
            >
              <f.icon size={24} className="mx-auto text-emerald-400 mb-2" />
              <h3 className="text-sm font-semibold text-zinc-200 mb-1">{f.title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </Container>
      <Footer />
    </div>
  );
}
