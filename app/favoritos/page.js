'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { BreadcrumbJsonLd, WebSiteJsonLd } from '../../components/seo/JsonLd';
import { Heart, ShoppingBag, ArrowLeft, Trash2, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Badge } from '../../packages/ui/src/components/badge';

const formatPrice = (v) => v != null ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v) : '';

export default function FavoritosPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const res = await fetch('/api/favorites');
        const json = await res.json();
        if (json.success) setFavorites(json.data || []);
      }
      setLoading(false);
    }
    init();
  }, []);

  async function removeFavorite(productId) {
    await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    });
    setFavorites(prev => prev.filter(f => f.id !== productId));
  }

  return (
    <>
      <BreadcrumbJsonLd items={[{ name: 'Inicio', url: '/' }, { name: 'Favoritos' }]} />
      <WebSiteJsonLd />
      <div className="min-h-screen bg-zinc-950">
        <Header />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-16">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => router.back()} className="p-2 rounded-xl text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-all">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-100">Mis favoritos</h1>
              <p className="text-sm text-zinc-500">Productos que has guardado</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full" />
            </div>
          ) : !user ? (
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 sm:p-12 text-center">
              <div className="h-16 w-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
                <Heart size={28} className="text-rose-400" />
              </div>
              <h2 className="text-xl font-semibold text-zinc-200 mb-2">Inicia sesión para guardar favoritos</h2>
              <p className="text-zinc-500 mb-6 max-w-sm mx-auto text-sm">
                Recibe notificaciones cuando tus productos favoritos bajen de precio.
              </p>
              <button
                onClick={() => router.push('/auth')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-colors shadow-lg shadow-emerald-600/20"
              >
                <LogIn size={18} /> Iniciar sesión
              </button>
            </div>
          ) : favorites.length === 0 ? (
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 sm:p-12 text-center">
              <Heart size={48} className="mx-auto text-zinc-700 mb-4" />
              <h2 className="text-xl font-semibold text-zinc-200 mb-2">No tienes favoritos aún</h2>
              <p className="text-zinc-500 mb-6 text-sm">Explora productos y guarda tus favoritos para comparar precios.</p>
              <Link href="/buscar" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-colors">
                Explorar productos
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {favorites.map((fav, i) => (
                <motion.div
                  key={fav.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center gap-4 hover:border-zinc-700 transition-all group"
                >
                  <Link href={`/producto/${fav.slug || fav.id}`} className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-500 mb-0.5">{fav.brand || 'Producto'}</p>
                    <h3 className="text-sm font-medium text-zinc-100 group-hover:text-emerald-400 transition-colors truncate">{fav.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-emerald-400">{formatPrice(fav.price)}</span>
                      {fav.oldPrice > fav.price && (
                        <span className="text-xs text-zinc-500 line-through">{formatPrice(fav.oldPrice)}</span>
                      )}
                    </div>
                  </Link>
                  <button
                    onClick={() => removeFavorite(fav.id)}
                    className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    aria-label="Eliminar favorito"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        <Footer />
      </div>
    </>
  );
}
