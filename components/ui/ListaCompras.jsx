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

  const total = carrito.reduce((sum, item) => sum + (item.precio || item.price || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Lista de compras">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsCarritoAbierto(false)}
        aria-hidden="true"
      ></div>

      <div className="relative w-full max-w-md bg-zinc-950 border-l border-zinc-800 h-full flex flex-col shadow-2xl" role="document">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <ShoppingBag className="text-emerald-400" /> Mi Lista Inteligente
          </h2>
          <button
            onClick={() => setIsCarritoAbierto(false)}
            className="text-zinc-500 hover:text-zinc-100 transition-colors p-1"
            aria-label="Cerrar lista de compras"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {carrito.length === 0 ? (
            <div className="text-center text-zinc-500 mt-10">
              Tu lista está vacía. Empieza a buscar productos para ahorrar.
            </div>
          ) : (
            carrito.map((item) => (
              <div key={item.id} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex justify-between items-center">
                <div>
                  <h4 className="text-zinc-100 font-medium">{item.producto_nombre || item.name}</h4>
                  <p className="text-zinc-500 text-sm">{item.cadena_nombre || item.store}</p>
                  <p className="text-emerald-400 font-bold mt-1">${(item.precio || item.price || 0).toLocaleString('es-CO')}</p>
                </div>
                <button
                  onClick={() => removerDelCarrito(item.id)}
                  className="text-zinc-500 hover:text-red-400 transition-colors"
                  aria-label={`Eliminar ${item.producto_nombre || item.name} de la lista`}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-zinc-800 bg-zinc-900">
          <div className="flex justify-between items-center mb-4">
            <span className="text-zinc-400">Total estimado:</span>
            <span className="text-2xl font-bold text-emerald-400">${total.toLocaleString('es-CO')}</span>
          </div>
          <p className="text-xs leading-5 text-zinc-500">
            Total calculado con el mejor precio visible al agregar cada producto. Confirma disponibilidad y precio final en el comercio.
          </p>
        </div>
      </div>
    </div>
  );
}
