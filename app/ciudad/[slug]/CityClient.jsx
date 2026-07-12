'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Store, Package, ShoppingBag, ChevronRight } from 'lucide-react';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import { Badge } from '../../../packages/ui/src/components/badge';
import { Container } from '../../../packages/ui/src/components/container';

function toSlug(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function CityClient({ city }) {
  const productCount = city.productCount;
  const storeCount = city.storeCount || (Array.isArray(city.stores) ? city.stores.length : 0);
  const departmentSlug = city.departmentSlug || toSlug(city.department);
  const stores = city.stores || [];

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header />
      <Container className="py-8 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 rounded-2xl bg-emerald-600/20 border border-emerald-600/30 flex items-center justify-center">
              <MapPin size={28} className="text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Inicio</Link>
                <span className="text-xs text-zinc-600">/</span>
                <span className="text-xs text-zinc-400">Ciudades</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100">{city.name}</h1>
              <p className="text-zinc-500 mt-1 max-w-xl">{city.description || `Compara precios disponibles en ${city.name}.`}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default" size="md"><Store size={12} className="mr-1" />{storeCount} comercios</Badge>
            <Badge variant="default" size="md"><Package size={12} className="mr-1" />{typeof productCount === 'number' ? `${productCount.toLocaleString('es-CO')} productos` : 'Precios en vivo'}</Badge>
            <Badge variant="success" size="md">{city.department}</Badge>
          </div>
        </motion.div>

        <section className="mb-10">
          <h2 className="text-lg font-semibold text-zinc-200 mb-4">Comercios disponibles en {city.name}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stores.map((store, i) => (
              <motion.div key={store.slug} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Link href={`/${store.category === 'Farmacia' ? 'farmacia' : 'supermercado'}/${store.slug}`}
                  className="flex items-center justify-between bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 hover:bg-zinc-900 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                      <ShoppingBag size={18} className="text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-200 group-hover:text-emerald-400 transition-colors">{store.name}</p>
                      <p className="text-xs text-zinc-500 capitalize">{store.category}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                </Link>
              </motion.div>
            ))}
          </div>
          {stores.length === 0 && <p className="text-sm text-zinc-500">No hay comercios activos registrados para esta ciudad.</p>}
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-200">Departamento</h2>
          </div>
          <Link href={`/departamento/${departmentSlug}`}
            className="flex items-center justify-between bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 hover:bg-zinc-900 transition-all group max-w-sm">
            <div>
              <p className="text-sm font-medium text-zinc-200 group-hover:text-emerald-400 transition-colors">{city.department}</p>
              <p className="text-xs text-zinc-500">Ver más ciudades del departamento</p>
            </div>
            <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
          </Link>
        </section>
      </Container>
      <Footer />
    </div>
  );
}
