'use client';

import { useEffect, useCallback } from 'react';
import { useSupermarketStore } from '../../store/useSupermarketStore';
import { X, Trash2, ShoppingBag } from 'lucide-react';

export default function ListaCompras() {
  const { carrito, isCarritoAbierto, setIsCarritoAbierto, removerDelCarrito } = useSupermarketStore();

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') setIsCarritoAbierto(false);
  }, [setIsCarritoAbierto]);

  useEffect(() => {
    if (isCarritoAbierto) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isCarritoAbierto, handleKeyDown]);

  if (!isCarritoAbierto) return null;

  const total = carrito.reduce((sum, item) => sum + item.precio, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Lista de compras">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsCarritoAbierto(false)}
        aria-hidden="true"
      ></div>

      <div className="relative w-full max-w-md bg-[#0f172a] border-l border-slate-800 h-full flex flex-col shadow-2xl" role="document">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#1e293b]">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="text-cyan-400" /> Mi Lista Inteligente
          </h2>
          <button
            onClick={() => setIsCarritoAbierto(false)}
            className="text-slate-400 hover:text-white transition-colors p-1"
            aria-label="Cerrar lista de compras"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {carrito.length === 0 ? (
            <div className="text-center text-slate-500 mt-10">
              Tu lista está vacía. Empieza a buscar productos para ahorrar.
            </div>
          ) : (
            carrito.map((item) => (
              <div key={item.id} className="bg-[#1e293b] p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                <div>
                  <h4 className="text-white font-medium">{item.producto_nombre}</h4>
                  <p className="text-slate-400 text-sm">{item.cadena_nombre}</p>
                  <p className="text-cyan-400 font-bold mt-1">${item.precio.toLocaleString('es-CO')}</p>
                </div>
                <button
                  onClick={() => removerDelCarrito(item.id)}
                  className="text-slate-500 hover:text-red-400 transition-colors"
                  aria-label={`Eliminar ${item.producto_nombre} de la lista`}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-slate-800 bg-[#1e293b]">
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-400">Total estimado:</span>
            <span className="text-2xl font-bold text-emerald-400">${total.toLocaleString('es-CO')}</span>
          </div>
          <button className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={carrito.length === 0} aria-label="Trazar ruta de compras">
            Trazar Ruta de Compras
          </button>
        </div>
      </div>
    </div>
  );
}
