import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useSupermarketStore = create((set, get) => ({
  searchQuery: '',
  results: [],
  isLoading: false,
  criterioOrden: 'relevancia',

  carrito: [],
  isCarritoAbierto: false,

  user: null,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setIsCarritoAbierto: (isOpen) => set({ isCarritoAbierto: isOpen }),
  setCriterioOrden: (criterio) => set({ criterioOrden: criterio }),
  setUser: (user) => set({ user }),

  agregarAlCarrito: (producto) => set((state) => {
    if (state.carrito.find(item => item.id === producto.id)) return state;
    return { carrito: [...state.carrito, producto] };
  }),

  removerDelCarrito: (id) => set((state) => ({
    carrito: state.carrito.filter(item => item.id !== id)
  })),

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, carrito: [] });
  },

  getResultadosOrdenados: () => {
    const { results, criterioOrden } = get();
    let resultadosCopia = [...results];

    if (criterioOrden === 'precio_menor') {
      resultadosCopia.sort((a, b) => a.precio - b.precio);
    } else if (criterioOrden === 'distancia_menor') {
      resultadosCopia.sort((a, b) => a.distancia_metros - b.distancia_metros);
    }
    return resultadosCopia;
  },

  fetchResults: async () => {
    const { searchQuery } = get();
    if (!searchQuery) return;

    set({ isLoading: true });

    setTimeout(() => {
      set({
        results: [
          { id: 1, producto_nombre: 'Arroz Diana Premium', cadena_nombre: 'Almacenes Éxito', precio: 4200, distancia_metros: 1200, tag: 'Calidad' },
          { id: 2, producto_nombre: 'Arroz Roa Fortificado', cadena_nombre: 'Tiendas D1', precio: 3800, distancia_metros: 500, tag: 'Más Cercano' },
          { id: 3, producto_nombre: 'Arroz Supremo Tradicional', cadena_nombre: 'Supermercados Olímpica', precio: 3500, distancia_metros: 2100, tag: 'Mejor Precio' }
        ],
        isLoading: false
      });
    }, 800);
  }
}));
