'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Clock, Phone, Store, Package, Tag, ChevronRight } from 'lucide-react';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import ProductCardPremium from '../../../components/product/ProductCardPremium';
import { Badge } from '../../../packages/ui/src/components/badge';
import { Container } from '../../../packages/ui/src/components/container';

export default function StoreClient({ store, products }) {
  const formatPrice = (v) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v);

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header />
      <div className={`h-32 sm:h-48 ${store.color} opacity-20`} />
      <Container className="relative -mt-16 sm:-mt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6 mb-8">
          <div className={`h-20 w-20 sm:h-28 sm:w-28 rounded-2xl ${store.color} flex items-center justify-center shadow-2xl border-4 border-zinc-950`}>
            <span className="text-white font-bold text-2xl sm:text-3xl uppercase">{store.name.slice(0, 2)}</span>
          </div>
          <div className="flex-1">
            <Badge variant={store.type === 'farmacia' ? 'info' : 'success'} size="sm" className="mb-2">
              {store.type === 'farmacia' ? 'Farmacia' : 'Supermercado'}
            </Badge>
            <h1 className="text-2xl sm:text-4xl font-bold text-zinc-100">{store.name}</h1>
            <p className="text-zinc-500 mt-1 max-w-xl">{store.description}</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { icon: Package, label: 'Productos', value: products.length },
            { icon: MapPin, label: 'Sucursales', value: store.branches },
            { icon: Clock, label: 'Horario', value: store.schedule },
            { icon: Store, label: 'Servicios', value: store.services?.length || 0 },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 text-center">
              <stat.icon size={20} className="mx-auto text-zinc-500 mb-2" />
              <div className="text-lg font-bold text-zinc-100">{stat.value}</div>
              <div className="text-xs text-zinc-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {store.services && (
          <div className="flex flex-wrap gap-2 mb-8">
            {store.services.map((s, i) => (
              <Badge key={i} variant="default" size="md">{s}</Badge>
            ))}
          </div>
        )}

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-zinc-100">Productos en {store.name}</h2>
            <span className="text-sm text-zinc-500">{products.length} productos</span>
          </div>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p, i) => (
                <ProductCardPremium key={p.id} product={{
                  ...p,
                  price: p.storePrice?.price || p.bestPrice,
                  oldPrice: p.storePrice?.oldPrice,
                  storesCount: 1,
                  image: p.image,
                }} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-500 bg-zinc-900/30 rounded-2xl border border-zinc-800">
              <Package size={40} className="mx-auto mb-3 text-zinc-600" />
              <p>Próximamente más productos</p>
            </div>
          )}
        </section>
      </Container>
      <Footer />
    </div>
  );
}
