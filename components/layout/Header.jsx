'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSupermarketStore } from '../../store/useSupermarketStore';
import { Search, Heart, ShoppingBag, Bell, User, MapPin, Menu, X, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const router = useRouter();
  const { carrito, user, logout, setIsCarritoAbierto } = useSupermarketStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue('');
    }
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <span className="text-white font-extrabold text-sm">A</span>
            </div>
            <span className="text-xl font-bold text-zinc-100 hidden sm:block">
              Ahorro<span className="text-emerald-400">Ya</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1 text-xs text-zinc-500 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-zinc-800">
            <MapPin size={12} className="text-emerald-500" />
            <span>Cali, Colombia</span>
          </div>

          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-lg relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Buscar productos, marcas..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              aria-label="Buscar productos"
            />
          </form>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => router.push('/favoritos')}
              className="relative p-2 rounded-xl text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-all"
              aria-label="Favoritos"
            >
              <Heart size={20} />
            </button>

            <button
              onClick={() => setIsCarritoAbierto(true)}
              className="relative p-2 rounded-xl text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-all"
              aria-label="Lista de compras"
            >
              <ShoppingBag size={20} />
              {carrito.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-emerald-500 text-[10px] font-bold text-white flex items-center justify-center">
                  {carrito.length}
                </span>
              )}
            </button>

            <button className="hidden sm:flex relative p-2 rounded-xl text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-all" aria-label="Notificaciones">
              <Bell size={20} />
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-emerald-600/20 border border-emerald-600/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
                  {user.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <button onClick={logout} className="text-zinc-500 hover:text-red-400 transition-colors p-1" aria-label="Cerrar sesión">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push('/auth')}
                className="hidden sm:flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-lg shadow-emerald-600/20"
              >
                <User size={16} />
                <span>Ingresar</span>
              </button>
            )}

            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="lg:hidden p-2 rounded-xl text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-all"
              aria-label="Menú"
            >
              {mobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-zinc-800 bg-zinc-950"
          >
            <div className="px-4 py-4 space-y-3">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Buscar productos..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50"
                    aria-label="Buscar productos"
                  />
                </div>
              </form>
              <div className="flex gap-2">
                <Link href="/favoritos" className="flex-1 text-center text-sm text-zinc-400 hover:text-zinc-100 bg-zinc-900 rounded-xl py-2.5">Favoritos</Link>
                <Link href="/categorias" className="flex-1 text-center text-sm text-zinc-400 hover:text-zinc-100 bg-zinc-900 rounded-xl py-2.5">Categorías</Link>
                <Link href="/supermercados" className="flex-1 text-center text-sm text-zinc-400 hover:text-zinc-100 bg-zinc-900 rounded-xl py-2.5">Tiendas</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
