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
    await supabase?.auth.signOut();
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
    if (!searchQuery || !supabase) {
      set({ isLoading: false, results: [] });
      return;
    }
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('store_products')
        .select('*, master_products!inner(name, slug), stores!inner(name, slug)')
        .or(`master_products.name.ilike.%${searchQuery}%`)
        .eq('available', true)
        .limit(50);
      if (error) throw error;
      const mapped = (data || []).map((item, i) => ({
        id: item.id || i,
        producto_nombre: item.master_products?.name || searchQuery,
        cadena_nombre: item.stores?.name || 'Tienda',
        precio: item.price,
        distancia_metros: 0,
        tag: i === 0 ? 'Mejor Precio' : null,
      }));
      set({ results: mapped, isLoading: false });
    } catch (err) {
      console.error('[Store] fetchResults error:', err);
      set({ isLoading: false, results: [] });
    }
  },
}));
