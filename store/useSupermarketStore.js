import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

export const useSupermarketStore = create(persist((set) => ({
  carrito: [],
  isCarritoAbierto: false,

  user: null,

  setIsCarritoAbierto: (isOpen) => set({ isCarritoAbierto: isOpen }),
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
    set({ user: null });
  },
}), {
  name: 'ahorroya:carrito',
  storage: createJSONStorage(() => {
    if (typeof window === 'undefined') throw new Error('no window (SSR)');
    return window.localStorage;
  }),
  partialize: (state) => ({ carrito: state.carrito }),
}));

// `user` was previously write-only: AuthModal called setUser() right after a
// fresh login/signup, but nothing ever hydrated it from an existing Supabase
// session, so a returning user with a valid session still showed as logged
// out until they logged in again. This runs once per browser tab (module is
// a singleton) and keeps `user` in sync with the real auth state.
if (typeof window !== 'undefined' && supabase) {
  supabase.auth.getSession().then(({ data }) => {
    if (data?.session?.user) useSupermarketStore.setState({ user: data.session.user });
  });
  supabase.auth.onAuthStateChange((_event, session) => {
    useSupermarketStore.setState({ user: session?.user || null });
  });
}
