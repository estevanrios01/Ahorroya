import { create } from 'zustand';

interface MobileStore {
  user: { id: string; email: string; name: string } | null;
  favorites: string[];
  cart: { productId: string; quantity: number }[];
  offline: boolean;
  setUser: (user: MobileStore['user']) => void;
  toggleFavorite: (productId: string) => void;
  setOffline: (offline: boolean) => void;
}

export const useMobileStore = create<MobileStore>((set) => ({
  user: null,
  favorites: [],
  cart: [],
  offline: false,
  setUser: (user) => set({ user }),
  toggleFavorite: (productId) =>
    set((s) => ({
      favorites: s.favorites.includes(productId)
        ? s.favorites.filter((id) => id !== productId)
        : [...s.favorites, productId],
    })),
  setOffline: (offline) => set({ offline }),
}));
