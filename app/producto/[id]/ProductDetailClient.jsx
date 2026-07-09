'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, MapPin, TrendingDown, TrendingUp, Store, ShoppingBag, Heart, Share2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import { Badge, DiscountBadge } from '../../../packages/ui/src/components/badge';
import { Button } from '../../../packages/ui/src/components/button';
import { Section } from '../../../packages/ui/src/components/section';
import ProductGrid from '../../../components/product/ProductGrid';

export default function ProductDetailClient({ product }) {
  const router = useRouter();
  const formatPrice = (v) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v);

  const bestPrice = Math.min(...product.prices.map(p => p.price));
  const minPrice = Math.min(...product.prices.map(p => p.price));
  const maxPrice = Math.max(...product.prices.map(p => p.price));
  const avgPrice = Math.round(product.prices.reduce((s, p) => s + p.price, 0) / product.prices.length);

  const history = product.prices.map((p, i) => ({
    date: `Día ${i + 1}`,
    price: p.price - ((i * 47 + 31) % 301) + 150,
  })).sort((a, b) => new Date(a.date) - new Date(b.date));

  const trendingDown = history.length > 1 && history[0].price > history[history.length - 1].price;

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-100 transition-colors mb-6 text-sm group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Volver
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
            <div className="aspect-square bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center overflow-hidden">
              {product.image ? (
                <Image src={product.image} alt={product.name} width={400} height={400} className="w-full h-full object-cover" />
              ) : (
                <Store size={80} className="text-zinc-700" />
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-3 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/categoria/${product.category?.toLowerCase().replace(/\s+/g, '-')}`} className="hover:opacity-80">
                    <Badge variant="info" size="sm">{product.category}</Badge>
                  </Link>
                  {product.barcode && <Badge variant="default" size="sm">EAN {product.barcode}</Badge>}
                  {product.savingsPercent > 0 && <DiscountBadge percent={product.savingsPercent} />}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 leading-tight">{product.name}</h1>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-zinc-400">{product.brand}</span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-400">{product.totalStores} comercios</span>
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-all" aria-label="Favorito"><Heart size={20} /></button>
                <button className="p-2 rounded-xl text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-all" aria-label="Compartir"><Share2 size={20} /></button>
              </div>
            </div>

            <p className="text-sm text-zinc-400 leading-relaxed">{product.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Precio mínimo', value: formatPrice(minPrice), color: 'text-emerald-400' },
                { label: 'Precio máximo', value: formatPrice(maxPrice), color: 'text-red-400' },
                { label: 'Precio promedio', value: formatPrice(avgPrice), color: 'text-zinc-100' },
                { label: 'Ahorro máximo', value: product.savingsPercent > 0 ? `-${product.savingsPercent}%` : '-', color: 'text-rose-400' },
              ].map((stat, i) => (
                <div key={i} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 text-center">
                  <div className="text-xs text-zinc-500 mb-1">{stat.label}</div>
                  <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                </div>
              ))}
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-zinc-500 text-sm">Mejor precio disponible</span>
                <Badge variant="success" size="sm">{product.bestStore}</Badge>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-bold text-emerald-400">{formatPrice(bestPrice)}</span>
                {product.prices.find(p => p.price === bestPrice)?.oldPrice > bestPrice && (
                  <>
                    <span className="text-lg text-zinc-500 line-through">
                      {formatPrice(product.prices.find(p => p.price === bestPrice).oldPrice)}
                    </span>
                    <DiscountBadge percent={Math.round(((product.prices.find(p => p.price === bestPrice).oldPrice - bestPrice) / product.prices.find(p => p.price === bestPrice).oldPrice) * 100)} />
                  </>
                )}
              </div>
              {product.presentation?.weight && (
                <p className="text-xs text-zinc-500 mt-2">Precio referente: {formatPrice(Math.round(bestPrice / (parseFloat(product.presentation.weight) || 1) * (product.presentation.weight.includes('g') && !product.presentation.weight.includes('kg') ? 1000 : 1)))} / kg</p>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="primary" size="lg" icon={<ShoppingBag size={18} />} className="flex-1">Comparar precios</Button>
              <Button variant="secondary" size="lg" icon={<Heart size={18} />}>Guardar</Button>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-zinc-100">Historial de precios</h2>
              <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${trendingDown ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {trendingDown ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                {trendingDown ? 'En bajada' : 'En subida'}
              </div>
            </div>
            <div className="h-[220px] sm:h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="date" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 200', 'dataMax + 200']} />
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', color: '#fafafa' }} itemStyle={{ color: '#34d399' }} />
                  <Line type="monotone" dataKey="price" stroke="#059669" strokeWidth={3} dot={{ fill: '#09090b', stroke: '#059669', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-zinc-100 mb-5">Comparativa de precios</h2>
            <div className="space-y-3">
              {product.prices.sort((a, b) => a.price - b.price).map((p, i) => (
                <motion.div
                  key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i }}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    i === 0 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-zinc-900/50 border-zinc-800'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link href={`/supermercado/${p.storeSlug}`} className="hover:underline">
                        <h3 className={`text-sm font-medium truncate ${i === 0 ? 'text-emerald-400' : 'text-zinc-100'}`}>
                          {p.store} {p.storeSlug === 'd1' || p.storeSlug === 'ara' ? <Badge variant={i === 0 ? 'success' : 'default'} size="sm">{i === 0 ? 'MEJOR PRECIO' : 'D1'}</Badge> : ''}
                        </h3>
                      </Link>
                      {!p.available && <AlertCircle size={14} className="text-red-400 flex-shrink-0" />}
                      {p.available && i === 0 && <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
                      <MapPin size={10} /> {p.distance} km {p.address ? `• ${p.address}` : ''}
                    </p>
                    {p.oldPrice > p.price && (
                      <p className="text-[11px] text-rose-400 mt-0.5">Ahorras {formatPrice(p.oldPrice - p.price)}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <div className={`text-base font-bold ${i === 0 ? 'text-emerald-400' : 'text-zinc-100'}`}>
                      {formatPrice(p.price)}
                    </div>
                    {p.oldPrice > p.price && (
                      <div className="text-xs text-zinc-500 line-through">{formatPrice(p.oldPrice)}</div>
                    )}
                    <div className={`text-[11px] ${p.available ? 'text-emerald-500' : 'text-red-400'}`}>
                      {p.available ? 'En stock' : 'Agotado'}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
