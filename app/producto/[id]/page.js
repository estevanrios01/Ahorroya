'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, MapPin, TrendingDown, TrendingUp, AlertCircle, Store, ShoppingBag, Heart, Share2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import { Badge, DiscountBadge } from '../../../packages/ui/src/components/badge';
import { Button } from '../../../packages/ui/src/components/button';

export default function DetalleProducto() {
  const params = useParams();
  const router = useRouter();

  const product = {
    id: params.id,
    name: 'Arroz Diana Premium 1kg',
    brand: 'Diana',
    category: 'Despensa',
    presentation: 'Bolsa 1kg',
    barcode: '7701001234567',
    description: 'Arroz blanco premium 100% colombiano. Ideal para preparar arroces de grano largo y suelto.',
    image: null,
    bestPrice: 3800,
    bestStore: 'Tiendas D1',
    prices: [
      { store: 'Tiendas D1', logo: null, price: 3800, oldPrice: 4500, distance: 0.5, stock: true, address: 'Carrera 100 # 11-60' },
      { store: 'Almacenes Éxito', logo: null, price: 4200, oldPrice: 4800, distance: 1.2, stock: true, address: 'Calle 5 # 38D-35' },
      { store: 'Supermercados Olímpica', logo: null, price: 4500, distance: 2.1, stock: false, address: 'Av Pasoancho # 50-12' },
      { store: 'Jumbo', logo: null, price: 4100, oldPrice: 4700, distance: 3.0, stock: true, address: 'Carrera 98 # 42-30' },
    ],
    history: [
      { date: '1 Jul', price: 4500 },
      { date: '3 Jul', price: 4500 },
      { date: '5 Jul', price: 4200 },
      { date: '7 Jul', price: 3900 },
      { date: '9 Jul', price: 3800 },
    ],
  };

  const trendingDown = product.history[0].price > product.history[product.history.length - 1].price;
  const formatPrice = (v) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v);

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-100 transition-colors mb-6 text-sm"
        >
          <ArrowLeft size={18} /> Volver
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <div className="aspect-square bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center">
              {product.image ? (
                <Image src={product.image} alt={product.name} width={400} height={400} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <Store size={80} className="text-zinc-700" />
              )}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3 space-y-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="info" size="sm">{product.category}</Badge>
                  {product.barcode && <Badge variant="default" size="sm">EAN {product.barcode}</Badge>}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 leading-tight">{product.name}</h1>
                <p className="text-zinc-500 mt-1">{product.brand} • {product.presentation}</p>
              </div>
              <div className="flex gap-1">
                <button className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-all" aria-label="Favorito">
                  <Heart size={20} />
                </button>
                <button className="p-2 rounded-xl text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-all" aria-label="Compartir">
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            <p className="text-sm text-zinc-400 leading-relaxed">{product.description}</p>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-zinc-500 text-sm">Mejor precio</span>
                <div className="text-right">
                  <span className="text-3xl font-bold text-emerald-400">{formatPrice(product.bestPrice)}</span>
                  {product.prices[0].oldPrice && (
                    <span className="text-sm text-zinc-500 line-through ml-2">{formatPrice(product.prices[0].oldPrice)}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Disponible en</span>
                <span className="text-zinc-300 font-medium">{product.prices.filter(p => p.stock).length} comercios</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Mejor tienda</span>
                <span className="text-emerald-400 font-medium">{product.bestStore}</span>
              </div>
              {product.prices[0].oldPrice && (
                <DiscountBadge percent={Math.round(((product.prices[0].oldPrice - product.bestPrice) / product.prices[0].oldPrice) * 100)} />
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="primary" size="lg" icon={<ShoppingBag size={18} />} className="flex-1">
                Comparar precios
              </Button>
              <Button variant="secondary" size="lg" icon={<Heart size={18} />}>
                Favorito
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Price History & Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 sm:p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-zinc-100">Historial de precios</h2>
              <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${trendingDown ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {trendingDown ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                {trendingDown ? 'En bajada' : 'En subida'}
              </div>
            </div>
            <div className="h-[220px] sm:h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={product.history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="date" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 200', 'dataMax + 200']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', color: '#fafafa' }}
                    itemStyle={{ color: '#34d399' }}
                    labelStyle={{ color: '#a1a1aa' }}
                  />
                  <Line type="monotone" dataKey="price" stroke="#059669" strokeWidth={3} dot={{ fill: '#09090b', stroke: '#059669', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 sm:p-6"
          >
            <h2 className="text-lg font-semibold text-zinc-100 mb-5">Comparativa de precios</h2>
            <div className="space-y-3">
              {product.prices.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    p.price === product.bestPrice
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : 'bg-zinc-900/50 border-zinc-800'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-zinc-100 truncate">{p.store}</h3>
                      {p.price === product.bestPrice && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">MEJOR</span>
                      )}
                      {!p.stock && <AlertCircle size={14} className="text-red-400 flex-shrink-0" title="Sin stock" />}
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
                      <MapPin size={10} /> {p.address} • {p.distance} km
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <div className={`text-base font-bold ${p.price === product.bestPrice ? 'text-emerald-400' : 'text-zinc-100'}`}>
                      {formatPrice(p.price)}
                    </div>
                    {p.oldPrice && (
                      <div className="text-xs text-zinc-500 line-through">{formatPrice(p.oldPrice)}</div>
                    )}
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
