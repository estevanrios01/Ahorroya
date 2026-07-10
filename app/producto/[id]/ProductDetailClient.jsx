'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useCallback } from 'react';
import {
  ArrowLeft, MapPin, TrendingDown, TrendingUp, Store, ShoppingBag, Heart, Share2,
  AlertCircle, CheckCircle2, ZoomIn, ChevronLeft, ChevronRight, Package, Ruler, Barcode, Map
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import { Badge, DiscountBadge } from '../../../packages/ui/src/components/badge';
import { Button } from '../../../packages/ui/src/components/button';
import { Section } from '../../../packages/ui/src/components/section';
import ProductGrid from '../../../components/product/ProductGrid';

const formatPrice = (v) => v != null ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v) : '';

export default function ProductDetailClient({ product }) {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [liked, setLiked] = useState(false);

  const images = product.images?.length > 0 ? product.images : product.image ? [product.image] : [];
  const bestPrice = Math.min(...(product.prices || []).map(p => p.price));
  const minPrice = bestPrice;
  const maxPrice = Math.max(...(product.prices || []).map(p => p.price));
  const avgPrice = product.prices?.length > 0 ? Math.round(product.prices.reduce((s, p) => s + p.price, 0) / product.prices.length) : 0;

  const history = (product.prices || []).map(p => ({ date: p.store, price: p.price }));
  const trendingDown = history.length > 1 && history[0]?.price > history[history.length - 1]?.price;

  const similarProducts = product.similar || [];

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <nav className="flex items-center gap-2 text-xs text-zinc-600 mb-4">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-100 transition-colors">
            <ArrowLeft size={14} /> Volver
          </button>
          <span className="text-zinc-700">/</span>
          <Link href="/" className="hover:text-zinc-400 transition-colors">Inicio</Link>
          {product.category && (
            <>
              <span className="text-zinc-700">/</span>
              <Link href={`/categoria/${product.categorySlug || product.category?.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-zinc-400 transition-colors">{product.category}</Link>
            </>
          )}
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div
              className="relative aspect-square bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden group cursor-crosshair"
              onMouseEnter={() => setZoomed(true)}
              onMouseLeave={() => setZoomed(false)}
            >
              {images[selectedImage] ? (
                <>
                  <Image
                    src={images[selectedImage]}
                    alt={product.name}
                    fill
                    className={`object-cover transition-transform duration-500 ${zoomed ? 'scale-150' : 'scale-100'}`}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                  <div className="absolute top-3 right-3 bg-zinc-900/80 backdrop-blur-sm rounded-xl p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn size={16} className="text-zinc-400" />
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                  <Store size={64} className="text-zinc-700" />
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      i === selectedImage ? 'border-emerald-500' : 'border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {product.category && (
                <Link href={`/categoria/${product.categorySlug || product.category?.toLowerCase().replace(/\s+/g, '-')}`}>
                  <Badge variant="info" size="sm">{product.category}</Badge>
                </Link>
              )}
              {product.barcode && <Badge variant="default" size="sm"><Barcode size={10} className="mr-1" />{product.barcode}</Badge>}
              {product.savingsPercent > 0 && <DiscountBadge percent={product.savingsPercent} />}
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-zinc-100 leading-tight">{product.name}</h1>

            <div className="flex items-center gap-3 text-sm">
              {product.brand && (
                <Link href={`/marca/${product.brandSlug || product.brand?.toLowerCase().replace(/\s+/g, '-')}`} className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                  {product.brand}
                </Link>
              )}
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-400">{product.totalStores || product.prices?.length || 0} comercios</span>
              {product.presentation?.weight && (
                <>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-400"><Ruler size={12} className="inline mr-1" />{product.presentation.weight}</span>
                </>
              )}
            </div>

            {product.description && (
              <p className="text-sm text-zinc-400 leading-relaxed">{product.description}</p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { label: 'Mínimo', value: formatPrice(minPrice), color: 'text-emerald-400' },
                { label: 'Máximo', value: formatPrice(maxPrice), color: 'text-red-400' },
                { label: 'Promedio', value: formatPrice(avgPrice), color: 'text-zinc-100' },
                { label: 'Ahorro', value: product.savingsPercent > 0 ? `-${product.savingsPercent}%` : '-', color: 'text-rose-400' },
              ].map((stat, i) => (
                <div key={i} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-2.5 text-center">
                  <div className="text-[10px] text-zinc-500 mb-0.5">{stat.label}</div>
                  <div className={`text-sm sm:text-base font-bold ${stat.color}`}>{stat.value}</div>
                </div>
              ))}
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-zinc-500">Mejor precio disponible</span>
                {product.bestStore && <Badge variant="success" size="sm">{product.bestStore}</Badge>}
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-400">{formatPrice(bestPrice)}</span>
                {product.prices?.find(p => p.price === bestPrice)?.oldPrice > bestPrice && (
                  <>
                    <span className="text-base text-zinc-500 line-through">
                      {formatPrice(product.prices.find(p => p.price === bestPrice).oldPrice)}
                    </span>
                    <DiscountBadge percent={Math.round(((product.prices.find(p => p.price === bestPrice).oldPrice - bestPrice) / product.prices.find(p => p.price === bestPrice).oldPrice) * 100)} />
                  </>
                )}
              </div>
              {product.presentation?.weight && (
                <p className="text-xs text-zinc-500 mt-1">Precio referente: ~{formatPrice(Math.round(bestPrice / (parseFloat(product.presentation.weight) || 1) * (product.presentation.weight.includes('g') && !product.presentation.weight.includes('kg') ? 1000 : 1)))} / kg</p>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="primary" size="lg" icon={<ShoppingBag size={18} />} className="flex-1">Comparar precios</Button>
              <Button
                variant="secondary"
                size="lg"
                icon={<Heart size={18} fill={liked ? 'currentColor' : 'none'} />}
                onClick={() => setLiked(!liked)}
              >
                {liked ? 'Guardado' : 'Guardar'}
              </Button>
              <button className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-all" aria-label="Compartir">
                <Share2 size={18} />
              </button>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 sm:p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-zinc-100">Comparativa de precios</h2>
              <span className="text-xs text-zinc-500">{product.prices?.length || 0} comercios</span>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {(product.prices || []).sort((a, b) => a.price - b.price).map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border transition-all ${
                    i === 0 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-zinc-900/50 border-zinc-800'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link href={`/supermercado/${p.storeSlug}`} className="hover:underline">
                        <h3 className={`text-sm font-medium truncate ${i === 0 ? 'text-emerald-400' : 'text-zinc-100'}`}>{p.store}</h3>
                      </Link>
                      {i === 0 && <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />}
                      {!p.available && <AlertCircle size={14} className="text-red-400 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
                      <MapPin size={10} /> {p.distance ? `${p.distance} km` : ''}{p.address ? ` • ${p.address}` : ''}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <div className={`text-sm font-bold ${i === 0 ? 'text-emerald-400' : 'text-zinc-100'}`}>
                      {formatPrice(p.price)}
                    </div>
                    {p.oldPrice > p.price && (
                      <div className="text-[11px] text-zinc-500 line-through">{formatPrice(p.oldPrice)}</div>
                    )}
                    <div className={`text-[10px] ${p.available ? 'text-emerald-500' : 'text-red-400'}`}>
                      {p.available ? 'En stock' : 'Agotado'}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 sm:p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-zinc-100">Historial de precios</h2>
              {history.length > 1 && (
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  trendingDown ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                }`}>
                  {trendingDown ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                  {trendingDown ? 'Bajando' : 'Subiendo'}
                </div>
              )}
            </div>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="date" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} angle={-15} textAnchor="end" height={50} />
                  <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} domain={['dataMin - 200', 'dataMax + 200']} width={55} />
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', color: '#fafafa' }} itemStyle={{ color: '#34d399' }} />
                  <Line type="monotone" dataKey="price" stroke="#059669" strokeWidth={2.5} dot={{ fill: '#09090b', stroke: '#059669', strokeWidth: 2, r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {similarProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <Section
              title="Productos similares"
              subtitle="También te pueden interesar"
              action={<Link href={`/buscar?q=${product.category}`} className="text-sm text-emerald-400 hover:text-emerald-300 font-medium">Ver más →</Link>}
            />
            <ProductGrid products={similarProducts.slice(0, 4)} />
          </motion.div>
        )}
      </main>
      <Footer />
    </div>
  );
}
