'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { Section } from '../packages/ui/src/components/section';
import { Container } from '../packages/ui/src/components/container';
import { Divider } from '../packages/ui/src/components/divider';
import { ProductCardSkeleton } from '../packages/ui/src/components/skeleton';
import { WebSiteJsonLd } from '../components/seo/JsonLd';
import { motion } from 'framer-motion';

const Hero = dynamic(() => import('../components/home/Hero'), { ssr: false });
const SupermarketCarousel = dynamic(() => import('../components/home/StoreCarousel').then(m => ({ default: m.SupermarketCarousel })), { ssr: false });
const PharmacyCarousel = dynamic(() => import('../components/home/StoreCarousel').then(m => ({ default: m.PharmacyCarousel })), { ssr: false });
const CategoryGrid = dynamic(() => import('../components/home/CategoryGrid'), { ssr: false });
const ProductGrid = dynamic(() => import('../components/product/ProductGrid'), { ssr: false });

const FEATURED = [
  { id: 1, name: 'Arroz Diana Premium 1kg', brand: 'Diana', price: 3800, oldPrice: 4500, storesCount: 6, slug: 'arroz-diana-premium', presentation: 'Bolsa 1kg' },
  { id: 2, name: 'Leche Entera Colanta 1L', brand: 'Colanta', price: 2600, oldPrice: 3200, storesCount: 4, slug: 'leche-entera-colanta', presentation: 'Caja 1 litro' },
  { id: 3, name: 'Aceite Vegetal Gourmet 900ml', brand: 'Gourmet', price: 12500, oldPrice: 14800, storesCount: 3, slug: 'aceite-gourmet-900ml', presentation: 'Botella 900ml' },
  { id: 4, name: 'Acetaminofén MK 500mg x30', brand: 'MK', price: 2850, oldPrice: 3600, storesCount: 4, slug: 'acetaminofen-mk-500mg', presentation: 'Tabletas x30' },
  { id: 5, name: 'Pan Bimbo Artesano 500g', brand: 'Bimbo', price: 4800, oldPrice: 6100, storesCount: 3, slug: 'pan-bimbo-artesano', presentation: 'Paquete 500g' },
  { id: 6, name: 'Jabón Líquido Rey 500ml', brand: 'Rey', price: 4800, oldPrice: 5900, storesCount: 3, slug: 'jabon-liquido-rey', presentation: 'Botella 500ml' },
  { id: 7, name: 'Huevos Santa Reyes x30', brand: 'Santa Reyes', price: 13800, oldPrice: 16800, storesCount: 3, slug: 'huevos-santa-reyes-x30', presentation: 'Caja x30' },
  { id: 8, name: 'Café Sello Rojo 500g', brand: 'Sello Rojo', price: 8500, oldPrice: 10200, storesCount: 4, slug: 'cafe-sello-rojo-500g', presentation: 'Paquete 500g' },
  { id: 9, name: 'Ibuprofeno MK 400mg x20', brand: 'MK', price: 5200, oldPrice: 6200, storesCount: 3, slug: 'ibuprofeno-mk-400mg', presentation: 'Tabletas x20' },
  { id: 10, name: 'Detergente FAB 1kg', brand: 'FAB', price: 7800, oldPrice: 9500, storesCount: 3, slug: 'detergente-fab-1kg', presentation: 'Bolsa 1kg' },
  { id: 11, name: 'Gaseosa Coca-Cola 2.5L', brand: 'Coca-Cola', price: 4800, oldPrice: 5500, storesCount: 5, slug: 'coca-cola-25l', presentation: 'Botella 2.5L' },
  { id: 12, name: 'Arroz Roa Fortificado 1kg', brand: 'Roa', price: 3400, storesCount: 3, slug: 'arroz-roa-fortificado', presentation: 'Bolsa 1kg' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <WebSiteJsonLd />
      <Header />
      <Hero />

      <Container className="space-y-6 sm:space-y-8 pb-16">
        <Section title="Supermercados" subtitle="Los mejores precios en las principales cadenas">
          <SupermarketCarousel />
        </Section>

        <Section title="Farmacias" subtitle="Medicamentos y cuidado personal al mejor precio">
          <PharmacyCarousel />
        </Section>

        <Divider />

        <Section
          title="Ofertas del día"
          subtitle="Productos con los mejores descuentos"
          action={<Link href="/buscar?q=ofertas" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium">Ver todas →</Link>}
        >
          <ProductGrid products={FEATURED.slice(0, 4)} />
        </Section>

        <Divider />

        <Section
          title="Productos que bajaron de precio"
          subtitle="Grandes ahorros para ti"
          action={<Link href="/buscar?q=descuentos" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium">Ver más →</Link>}
        >
          <ProductGrid products={FEATURED.slice(4, 8)} />
        </Section>

        <Divider />

        <Section title="Categorías" subtitle="Explora por categoría">
          <CategoryGrid />
        </Section>

        <Divider />

        <Section
          title="Productos populares"
          subtitle="Lo más buscado por nuestra comunidad"
        >
          <ProductGrid products={FEATURED.slice(8, 12)} />
        </Section>
      </Container>

      <Footer />
    </div>
  );
}
