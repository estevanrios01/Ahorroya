'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { BreadcrumbJsonLd, WebSiteJsonLd } from '../../components/seo/JsonLd';
import { Heart, ArrowLeft, Trash2, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const formatPrice = (value) =>
  value != null
    ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value)
    : '';

export default function FavoritosPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncFavorites = () => {
      try {
        const stored = JSON.parse(window.localStorage.getItem('ahorroya:favorites') || '[]');
        setFavorites(Array.isArray(stored) ? stored : []);
      } catch {
        setFavorites([]);
      }
      setLoading(false);
    };

    queueMicrotask(syncFavorites);
    window.addEventListener('storage', syncFavorites);
    return () => window.removeEventListener('storage', syncFavorites);
  }, []);

  function removeFavorite(productId) {
    setFavorites((prev) => {
      const next = prev.filter((favorite) => favorite.id !== productId);
      window.localStorage.setItem('ahorroya:favorites', JSON.stringify(next));
      return next;
    });
  }

  function goBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push('/buscar');
  }

  return (
    <>
      <BreadcrumbJsonLd items={[{ name: 'Inicio', url: '/' }, { name: 'Favoritos' }]} />
      <WebSiteJsonLd />
      <div className="min-h-screen bg-zinc-950">
        <Header />
        <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-16">
          <div className="flex items-center gap-3 mb-6">
            <button
              type="button"
              onClick={goBack}
              className="p-2 rounded-xl text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-all"
              aria-label="Volver"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-100">Favoritos</h1>
              <p className="text-sm text-zinc-500">Productos guardados en este navegador</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full" />
            </div>
          ) : favorites.length === 0 ? (
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 sm:p-12 text-center">
              <Heart size={48} className="mx-auto text-zinc-700 mb-4" />
              <h2 className="text-xl font-semibold text-zinc-200 mb-2">No tienes favoritos guardados</h2>
              <p className="text-zinc-500 mb-6 text-sm">
                Puedes comparar precios sin crear cuenta. Explora productos y vuelve cuando quieras.
              </p>
              <Link
                href="/buscar"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-colors"
              >
                <Search size={18} /> Buscar productos
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {favorites.map((favorite, index) => (
                <motion.div
                  key={favorite.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center gap-4 hover:border-zinc-700 transition-all group"
                >
                  <Link href={`/producto/${favorite.slug || favorite.id}`} className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-500 mb-0.5">{favorite.brand || 'Producto'}</p>
                    <h3 className="text-sm font-medium text-zinc-100 group-hover:text-emerald-400 transition-colors truncate">
                      {favorite.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-emerald-400">{formatPrice(favorite.price)}</span>
                      {favorite.oldPrice > favorite.price && (
                        <span className="text-xs text-zinc-500 line-through">{formatPrice(favorite.oldPrice)}</span>
                      )}
                    </div>
                  </Link>
                  <button
                    onClick={() => removeFavorite(favorite.id)}
                    className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    aria-label="Eliminar favorito"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}
