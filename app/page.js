'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupermarketStore } from '../store/useSupermarketStore';
import { Search, MapPin, Filter, ShoppingBag, Camera, Plus, LogOut } from 'lucide-react';
import Categorias from '../components/ui/Categorias';
import ListaCompras from '../components/ui/ListaCompras';
import ReportarPrecio from '../components/ui/ReportarPrecio';
import ControlesBusqueda from '../components/ui/ControlesBusqueda';
import AuthModal from '../components/ui/AuthModal';

export default function Home() {
  const router = useRouter();
  const { searchQuery, setSearchQuery, fetchResults, results, isLoading, setIsCarritoAbierto, carrito, getResultadosOrdenados, agregarAlCarrito, user, logout } = useSupermarketStore();
  const [isReportarAbierto, setIsReportarAbierto] = useState(false);
  const [isAuthAbierto, setIsAuthAbierto] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchResults();
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-20">
      <header className="mb-8 pt-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Ahorro<span className="text-cyan-400">Ya</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1 flex items-center gap-1">
            <MapPin size={14} /> Entregando en: Calle 5 # 38-35, Cali
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsReportarAbierto(true)}
            className="hidden md:flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-full border border-slate-700 transition-colors text-sm font-medium"
          >
            <Camera size={16} /> Aportar Precio
          </button>
          <button
            onClick={() => setIsCarritoAbierto(true)}
            className="relative text-slate-400 hover:text-cyan-400 transition-colors p-2"
          >
            <ShoppingBag size={24} />
            {carrito.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-cyan-500 text-slate-900 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {carrito.length}
              </span>
            )}
          </button>
          {user ? (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-cyan-500/20 border-2 border-cyan-500 flex items-center justify-center text-cyan-400 font-bold uppercase">
                {user.email.charAt(0)}
              </div>
              <button onClick={logout} className="text-slate-500 hover:text-red-400 transition-colors">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthAbierto(true)}
              className="bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 border border-cyan-500/50 hover:text-slate-900 px-4 py-2 rounded-full transition-all text-sm font-semibold"
            >
              Iniciar Sesión
            </button>
          )}
        </div>
      </header>

      <form onSubmit={handleSearch} className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-6 w-6 text-slate-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-12 pr-14 py-4 bg-[#1e293b] border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all text-lg shadow-lg"
          placeholder="Busca productos, marcas o categorías..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="button" className="absolute right-4 top-4 bottom-4 text-slate-400 hover:text-cyan-400 transition-colors">
          <Filter size={24} />
        </button>
      </form>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Explorar Categorías</h2>
        <Categorias />
      </section>

      <section>
        <ControlesBusqueda />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {getResultadosOrdenados().map((item) => (
            <div key={item.id} onClick={() => router.push(`/producto/${item.id}`)} className="bg-[#1e293b] border border-slate-700 rounded-2xl p-5 hover:border-cyan-500 transition-colors relative overflow-hidden flex flex-col justify-between h-full cursor-pointer group">
              {item.tag && (
                <span className="absolute top-0 right-0 bg-cyan-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-bl-lg">
                  {item.tag}
                </span>
              )}
              <div>
                <h3 className="text-xl font-semibold text-white mb-2 pr-16 group-hover:text-cyan-400 transition-colors">{item.producto_nombre}</h3>
                <p className="text-slate-400 text-sm flex items-center gap-1 mb-1">
                  <MapPin size={14} className="text-slate-500" /> {item.cadena_nombre}
                </p>
                <p className="text-slate-500 text-xs mb-4">
                  A {(item.distancia_metros / 1000).toFixed(1)} km de tu ubicación
                </p>
              </div>
              <div className="flex justify-between items-end border-t border-slate-700 pt-4 mt-auto">
                <span className="text-2xl font-bold text-emerald-400 flex items-center gap-1">
                  ${item.precio.toLocaleString('es-CO')}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); agregarAlCarrito(item); }}
                  className="bg-slate-800 hover:bg-cyan-500 hover:text-slate-900 text-white p-2 rounded-xl transition-all"
                  title="Añadir a la lista"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {results.length === 0 && !isLoading && (
          <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-700 rounded-2xl mt-4">
            Ingresa un producto en el buscador para comparar precios.
          </div>
        )}
      </section>

      <ListaCompras />
      {isReportarAbierto && <ReportarPrecio onClose={() => setIsReportarAbierto(false)} />}
      {isAuthAbierto && <AuthModal onClose={() => setIsAuthAbierto(false)} />}
    </div>
  );
}
