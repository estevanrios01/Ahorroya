'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Store, Package, ChevronRight } from 'lucide-react';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import { Badge } from '../../../packages/ui/src/components/badge';
import { Container } from '../../../packages/ui/src/components/container';

export default function DepartmentClient({ department }) {
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
                <span className="text-xs text-zinc-400">Departamentos</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100">{department.name}</h1>
              <p className="text-zinc-500 mt-1 max-w-xl">{department.description}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default" size="md"><Store size={12} className="mr-1" />{department.stores} comercios</Badge>
            <Badge variant="default" size="md"><Package size={12} className="mr-1" />{department.products.toLocaleString('es-CO')} productos</Badge>
          </div>
        </motion.div>

        <section>
          <h2 className="text-lg font-semibold text-zinc-200 mb-4">Ciudades en {department.name}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {department.cities.map((cityName, i) => {
              const slug = cityName
                .toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
              return (
                <motion.div key={cityName} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link href={`/ciudad/${slug}`}
                    className="flex items-center justify-between bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 hover:bg-zinc-900 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                        <MapPin size={18} className="text-zinc-400" />
                      </div>
                      <p className="text-sm font-medium text-zinc-200 group-hover:text-emerald-400 transition-colors">{cityName}</p>
                    </div>
                    <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      </Container>
      <Footer />
    </div>
  );
}
