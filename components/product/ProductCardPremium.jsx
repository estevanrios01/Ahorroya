'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Eye, Store } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function ProductCardPremium({ product }) {
  const [liked, setLiked] = useState(false);
  const hasDiscount = product.oldPrice && product.oldPrice > product.price;
  const discountPercent = hasDiscount ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;

  const formatPrice = (val) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="group bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 hover:shadow-xl hover:shadow-black/20 transition-all duration-300"
    >
      <div className="relative aspect-square bg-zinc-800 overflow-hidden">
        {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-700">
            <Store size={48} />
          </div>
        )}

        {/* Discount badge */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg">
            -{discountPercent}%
          </div>
        )}

        {/* Actions overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => setLiked(!liked)}
            className={`p-2 rounded-xl backdrop-blur-md transition-all ${
              liked ? 'bg-rose-500/20 text-rose-400' : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-100'
            }`}
            aria-label={liked ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-2.5">
        {product.brand && (
          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{product.brand}</p>
        )}

        <Link href={`/producto/${product.slug || product.id}`}>
          <h3 className="text-sm font-semibold text-zinc-100 leading-snug line-clamp-2 group-hover:text-emerald-400 transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.presentation && (
          <p className="text-xs text-zinc-500">{product.presentation}</p>
        )}

        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-lg font-bold text-zinc-100">{formatPrice(product.price)}</span>
          {hasDiscount && (
            <span className="text-xs text-zinc-500 line-through">{formatPrice(product.oldPrice)}</span>
          )}
        </div>

        {product.storesCount > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <Store size={12} />
            <span>Disponible en {product.storesCount} {product.storesCount === 1 ? 'comercio' : 'comercios'}</span>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1.5">
          <Link
            href={`/producto/${product.slug || product.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-xl py-2.5 transition-colors"
          >
            <Eye size={14} />
            <span>Ver</span>
          </Link>
          <button
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl py-2.5 transition-colors shadow-lg shadow-emerald-600/20"
            aria-label="Comparar precios"
          >
            <ShoppingBag size={14} />
            <span>Comparar</span>
          </button>
        </div>
      </div>
    </motion.article>
  );
}
