'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSupermarketStore } from '../../store/useSupermarketStore';
import { Search, Heart, ShoppingBag, MapPin, Menu, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const router = useRouter();
  const { carrito, setIsCarritoAbierto } = useSupermarketStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
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

  const cartCount = carrito.length;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-zinc-950/90 backdrop-blur-2xl border-b border-zinc-800/50 shadow-lg shadow-black/10' : 'bg-zinc-950/50'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-600/20 group-hover:shadow-emerald-600/40 transition-shadow">
              <span className="text-white font-extrabold text-sm">A</span>
            </div>
            <span className="text-xl font-bold text-zinc-100 hidden sm:block">
              Ahorro<span className="text-emerald-400">Ya</span>
            </span>
          </Link>

          <Link href="/ciudades" className="hidden md:flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-900/70 px-3 py-1.5 rounded-full border border-zinc-800/50 transition-colors hover:border-emerald-500/30 hover:text-zinc-300">
            <MapPin size={12} className="text-emerald-500" />
            <span>Elegir ciudad</span>
            <ChevronDown size={10} className="text-zinc-600" />
          </Link>

          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-lg relative group">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Buscar productos, marcas..."
              className="w-full bg-zinc-900/80 border border-zinc-800/80 rounded-xl pl-10 pr-11 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              aria-label="Buscar productos"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-emerald-400"
              aria-label="Ejecutar busqueda"
            >
              <Search size={15} />
            </button>
          </form>

          <div className="flex items-center gap-1">
            <button
              onClick={() => router.push('/favoritos')}
              className="relative p-2.5 rounded-xl text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800/80 transition-all"
              aria-label="Favoritos"
            >
              <Heart size={18} />
            </button>

            <button
              onClick={() => setIsCarritoAbierto(true)}
              className="relative p-2.5 rounded-xl text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800/80 transition-all"
              aria-label="Lista de compras"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4.5 w-4.5 rounded-full bg-emerald-500 text-[9px] font-bold text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="lg:hidden p-2.5 rounded-xl text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800/80 transition-all"
              aria-label="Menu"
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
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-zinc-800/50 bg-zinc-950/95 backdrop-blur-xl"
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
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-11 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50"
                    aria-label="Buscar productos"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-emerald-400"
                    aria-label="Ejecutar busqueda"
                  >
                    <Search size={15} />
                  </button>
                </div>
              </form>
              <div className="grid grid-cols-3 gap-2">
                <Link href="/ciudades" className="text-center text-sm text-zinc-400 hover:text-zinc-100 bg-zinc-900/80 rounded-xl py-2.5 transition-colors">Ciudades</Link>
                <Link href="/categorias" className="text-center text-sm text-zinc-400 hover:text-zinc-100 bg-zinc-900/80 rounded-xl py-2.5 transition-colors">Categorias</Link>
                <Link href="/supermercados" className="text-center text-sm text-zinc-400 hover:text-zinc-100 bg-zinc-900/80 rounded-xl py-2.5 transition-colors">Tiendas</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
