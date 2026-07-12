'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Store, MapPin, TrendingDown, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const formatPrice = (v) =>
  v != null ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v) : '';

export default function ProductCardPremium({ product }) {
  const [liked, setLiked] = useState(false);
  const [imgError, setImgError] = useState(false);

  const hasDiscount = product.oldPrice && product.oldPrice > product.price;
  const discountPercent = hasDiscount ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
  const isCheapest = product.isCheapest;
  const isNew = product.isNew;
  const isPriceDown = product.priceDown;

  const badge = isCheapest ? { label: 'Más barato', color: 'bg-emerald-500' }
    : discountPercent >= 20 ? { label: `-${discountPercent}%`, color: 'bg-rose-500' }
    : isPriceDown ? { label: 'Bajó', color: 'bg-emerald-500' }
    : isNew ? { label: 'Nuevo', color: 'bg-blue-500' }
    : null;

  const storeLogos = {
    'exito': '/logos/exito.svg', 'd1': '/logos/d1.svg', 'jumbo': '/logos/jumbo.svg',
    'ara': '/logos/ara.svg', 'carulla': '/logos/carulla.svg', 'olimpica': '/logos/olimpica.svg',
    'cruz-verde': '/logos/cruz-verde.svg', 'farmatodo': '/logos/farmatodo.svg',
    'la-rebaja': '/logos/la-rebaja.svg',
  };

  useEffect(() => {
    const syncFavorite = () => {
      try {
        const stored = JSON.parse(window.localStorage.getItem('ahorroya:favorites') || '[]');
        setLiked(Array.isArray(stored) && stored.some((item) => item.id === product.id));
      } catch {
        setLiked(false);
      }
    };

    queueMicrotask(syncFavorite);
    window.addEventListener('storage', syncFavorite);
    return () => window.removeEventListener('storage', syncFavorite);
  }, [product.id]);

  function toggleFavorite() {
    try {
      const stored = JSON.parse(window.localStorage.getItem('ahorroya:favorites') || '[]');
      const favorites = Array.isArray(stored) ? stored : [];
      const exists = favorites.some((item) => item.id === product.id);
      const next = exists
        ? favorites.filter((item) => item.id !== product.id)
        : [{
            id: product.id,
            slug: product.slug,
            name: product.name,
            brand: product.brand,
            price: product.price,
            oldPrice: product.oldPrice,
          }, ...favorites].slice(0, 100);
      window.localStorage.setItem('ahorroya:favorites', JSON.stringify(next));
      setLiked(!exists);
    } catch {
      setLiked((value) => !value);
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -6 }}
      className="group bg-zinc-900/90 border border-zinc-800/80 rounded-2xl overflow-hidden hover:border-zinc-700 hover:shadow-2xl hover:shadow-black/30 transition-all duration-500 will-change-transform"
    >
      <div className="relative aspect-square bg-zinc-800/80 overflow-hidden">
        {product.image && !imgError ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700 bg-gradient-to-br from-zinc-800 to-zinc-900">
            <Store size={40} className="opacity-40" />
            <span className="text-[10px] mt-2 opacity-30 uppercase tracking-wider">{product.brand || 'Producto'}</span>
          </div>
        )}

        {badge && (
          <div className={`absolute top-3 left-3 ${badge.color} text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-lg z-10`}>
            {badge.label}
          </div>
        )}

        {product.unitPrice && (
          <div className="absolute top-3 right-3 bg-zinc-900/90 backdrop-blur-sm text-[10px] text-zinc-400 px-2 py-1 rounded-lg border border-zinc-700/50">
            {formatPrice(product.unitPrice)}/{product.unitType || 'un'}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute bottom-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <button
            onClick={toggleFavorite}
            className={`p-2.5 rounded-xl backdrop-blur-md transition-all shadow-lg ${
              liked ? 'bg-rose-500/30 text-rose-400 shadow-rose-500/10' : 'bg-zinc-900/90 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
            }`}
            aria-label={liked ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Heart size={15} fill={liked ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      <div className="p-3.5 sm:p-4 space-y-2">
        {product.brand && (
          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-[0.08em]">{product.brand}</p>
        )}

        <Link href={`/producto/${product.slug || product.id}`}>
          <h3 className="text-sm font-semibold text-zinc-100 leading-snug line-clamp-2 group-hover:text-emerald-400 transition-colors duration-300">
            {product.name}
          </h3>
        </Link>

        {product.presentation && (
          <p className="text-[11px] text-zinc-500">
            {typeof product.presentation === 'object'
              ? `${product.presentation.quantity || ''}${product.presentation.unit || ''}`.trim()
              : product.presentation}
          </p>
        )}

        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="text-lg font-bold text-zinc-100 tracking-tight">{formatPrice(product.price)}</span>
          {hasDiscount && (
            <span className="text-[11px] text-zinc-500 line-through">{formatPrice(product.oldPrice)}</span>
          )}
        </div>

        {hasDiscount && (
          <p className="text-[11px] text-emerald-400 font-medium">Ahorras {formatPrice(product.oldPrice - product.price)}</p>
        )}

        {product.storesCount > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <Store size={11} />
            <span>{product.storesCount} {product.storesCount === 1 ? 'comercio' : 'comercios'}</span>
          </div>
        )}

        {product.storeLogos && product.storeLogos.length > 0 && (
          <div className="flex items-center gap-1.5 pt-0.5">
            {product.storeLogos.slice(0, 4).map((slug) => (
              <div key={slug} className="h-5 w-5 rounded-md bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-700/50">
                {storeLogos[slug] ? (
                  <Image src={storeLogos[slug]} alt="" width={12} height={12} className="h-3 w-3 object-contain" />
                ) : (
                  <span className="text-[6px] font-bold text-zinc-500 uppercase">{slug.slice(0, 2)}</span>
                )}
              </div>
            ))}
            {product.storeLogos.length > 4 && (
              <span className="text-[9px] text-zinc-600">+{product.storeLogos.length - 4}</span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 pt-1.5">
          <Link
            href={`/producto/${product.slug || product.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-zinc-300 bg-zinc-800/80 hover:bg-zinc-700 rounded-xl py-2.5 transition-all duration-200"
          >
            <ShoppingBag size={13} />
            <span>Ver precios</span>
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
