'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Store } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const formatPrice = (value) =>
  value != null
    ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value)
    : '';

function getPresentation(value) {
  if (!value) return '';
  if (typeof value === 'object') return `${value.quantity || ''}${value.unit || ''}`.trim();
  return String(value);
}

export default function ProductCardPremium({ product }) {
  const [liked, setLiked] = useState(false);
  const [imgError, setImgError] = useState(false);

  const offers = Array.isArray(product.store_products)
    ? product.store_products
      .filter((offer) => offer.available !== false && offer.price != null)
      .sort((left, right) => Number(left.price) - Number(right.price))
    : [];
  const bestOffer = offers[0] || null;
  const comparisonCount = product.storesCount || offers.length || 0;
  const storeLabel = product.bestStore || bestOffer?.stores?.name || bestOffer?.store?.name || '';
  const hasPrice = product.price != null && Number(product.price) > 0;
  const hasDiscount = hasPrice && product.oldPrice && Number(product.oldPrice) > Number(product.price);
  const discountPercent = hasDiscount ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
  const badge = product.isCheapest
    ? { label: 'Mejor precio', color: 'bg-emerald-500' }
    : discountPercent >= 15
      ? { label: `-${discountPercent}%`, color: 'bg-rose-500' }
      : product.priceDown
        ? { label: 'Bajó', color: 'bg-emerald-500' }
        : null;

  const href = `/producto/${product.slug || product.id}`;
  const presentation = getPresentation(product.presentation);

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

  function toggleFavorite(event) {
    event.preventDefault();
    event.stopPropagation();
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
            image: product.image,
          }, ...favorites].slice(0, 100);
      window.localStorage.setItem('ahorroya:favorites', JSON.stringify(next));
      setLiked(!exists);
    } catch {
      setLiked((value) => !value);
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.25 }}
      whileHover={{ y: -4 }}
      className="group overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/90 shadow-sm transition-all duration-300 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-black/25"
    >
      <Link href={href} className="block">
        <div className="relative aspect-square overflow-hidden bg-zinc-100">
          {product.image && !imgError ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 px-4 text-center text-zinc-500">
              <Store size={36} className="mb-2 opacity-60" />
              <span className="text-[10px] font-semibold uppercase tracking-wide">{product.brand || 'Producto'}</span>
              <span className="mt-1 text-[10px] text-zinc-400">Sin foto verificada</span>
            </div>
          )}

          {badge && (
            <div className={`absolute left-3 top-3 ${badge.color} rounded-lg px-2.5 py-1 text-[11px] font-bold text-white shadow-lg`}>
              {badge.label}
            </div>
          )}

          <button
            onClick={toggleFavorite}
            className={`absolute right-3 top-3 rounded-xl p-2 shadow-lg backdrop-blur-md transition-all ${
              liked ? 'bg-rose-500/90 text-white' : 'bg-white/90 text-zinc-500 hover:text-rose-500'
            }`}
            aria-label={liked ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Heart size={15} fill={liked ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="space-y-2 p-3.5 sm:p-4">
          {product.brand && (
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-zinc-500">{product.brand}</p>
          )}

          <h3 className="min-h-[2.5rem] text-sm font-semibold leading-snug text-zinc-100 line-clamp-2 transition-colors group-hover:text-emerald-400">
            {product.name}
          </h3>

          {presentation && <p className="text-[11px] text-zinc-500 line-clamp-1">{presentation}</p>}

          <div className="flex items-baseline gap-2 pt-0.5">
            <span className="text-lg font-bold tracking-tight text-zinc-100">
              {hasPrice ? `${comparisonCount > 1 ? 'Desde ' : ''}${formatPrice(product.price)}` : 'Ver precio'}
            </span>
            {hasDiscount && <span className="text-[11px] text-zinc-500 line-through">{formatPrice(product.oldPrice)}</span>}
          </div>

          {storeLabel && (
            <p className="text-[11px] font-medium text-zinc-400">Mejor precio en {storeLabel}</p>
          )}

          {hasDiscount && (
            <p className="text-[11px] font-medium text-emerald-400">Ahorras {formatPrice(product.oldPrice - product.price)}</p>
          )}

          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500">
              <Store size={11} />
              {comparisonCount > 0
                ? `${comparisonCount} ${comparisonCount === 1 ? 'comercio' : 'comercios'}`
                : 'Comparar'}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
              <ShoppingBag size={13} />
              Ver
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
