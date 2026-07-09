'use client';

import { useState, useMemo, useCallback } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Hero from '../components/home/Hero';
import { SupermarketCarousel, PharmacyCarousel } from '../components/home/StoreCarousel';
import CategoryGrid from '../components/home/CategoryGrid';
import ProductGrid from '../components/product/ProductGrid';
import ListaCompras from '../components/ui/ListaCompras';
import { Section } from '../packages/ui/src/components/section';
import { Container } from '../packages/ui/src/components/container';
import { Divider } from '../packages/ui/src/components/divider';
import { HomeSkeleton } from '../packages/ui/src/components/skeleton';
import { motion } from 'framer-motion';

const featuredProducts = [
  { id: 1, name: 'Arroz Diana Premium 1kg', brand: 'Diana', price: 3800, oldPrice: 4500, storesCount: 8, slug: 'arroz-diana-premium', presentation: 'Bolsa 1kg' },
  { id: 2, name: 'Aceite Vegetal Gourmet 900ml', brand: 'Gourmet', price: 12500, oldPrice: 14800, storesCount: 6, slug: 'aceite-gourmet-900ml', presentation: 'Botella 900ml' },
  { id: 3, name: 'Leche Entera Colanta 1L', brand: 'Colanta', price: 2800, oldPrice: 3200, storesCount: 10, slug: 'leche-colanta-1l', presentation: 'Caja 1 litro' },
  { id: 4, name: 'Acetaminofén MK 500mg x30', brand: 'MK', price: 2850, oldPrice: 3600, storesCount: 12, slug: 'acetaminofen-mk-500mg', presentation: 'Tabletas x30' },
  { id: 5, name: 'Pan Bimbo Artesano 500g', brand: 'Bimbo', price: 5200, oldPrice: 6100, storesCount: 9, slug: 'pan-bimbo-artesano', presentation: 'Paquete 500g' },
  { id: 6, name: 'Jabón Líquido Rey 500ml', brand: 'Rey', price: 4800, oldPrice: 5900, storesCount: 7, slug: 'jabon-liquido-rey', presentation: 'Botella 500ml' },
  { id: 7, name: 'Huevos Santa Reyes x30', brand: 'Santa Reyes', price: 14200, oldPrice: 16800, storesCount: 11, slug: 'huevos-santa-reyes-x30', presentation: 'Caja x30 unidades' },
  { id: 8, name: 'Café Sello Rojo 500g', brand: 'Sello Rojo', price: 8900, oldPrice: 10200, storesCount: 14, slug: 'cafe-sello-rojo-500g', presentation: 'Paquete 500g' },
];

export default function Home() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950">
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
          action={
            <a href="/ofertas" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
              Ver todas →
            </a>
          }
        >
          <ProductGrid products={featuredProducts} loading={loading} />
        </Section>

        <Divider />

        <Section
          title="Productos que bajaron de precio"
          subtitle="Grandes ahorros para ti"
        >
          <ProductGrid products={featuredProducts.slice(2, 6)} />
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
          <ProductGrid products={featuredProducts.slice(4, 8)} />
        </Section>
      </Container>

      <Footer />
      <ListaCompras />
    </div>
  );
}
