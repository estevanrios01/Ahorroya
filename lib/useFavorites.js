'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'ahorroya:favorites';
const MAX_FAVORITES = 100;

function readFavorites() {
  if (typeof window === 'undefined') return [];
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function writeFavorites(favorites) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch {}
}

// Single shared source of truth for the localStorage-backed favorites list --
// previously duplicated (with slightly different shapes) across
// ProductDetailClient, ProductCardPremium and the /favoritos page.
export function useFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const sync = () => setFavorites(readFavorites());
    queueMicrotask(() => {
      sync();
      setIsReady(true);
    });
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const isFavorite = useCallback((id) => favorites.some((item) => item.id === id), [favorites]);

  const toggleFavorite = useCallback((product) => {
    setFavorites((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      const next = exists
        ? prev.filter((item) => item.id !== product.id)
        : [{
            id: product.id,
            slug: product.slug,
            name: product.name,
            brand: product.brand,
            price: product.price ?? null,
            oldPrice: product.oldPrice ?? null,
            image: product.image ?? null,
          }, ...prev].slice(0, MAX_FAVORITES);
      writeFavorites(next);
      return next;
    });
  }, []);

  const removeFavorite = useCallback((id) => {
    setFavorites((prev) => {
      const next = prev.filter((item) => item.id !== id);
      writeFavorites(next);
      return next;
    });
  }, []);

  return { favorites, isReady, isFavorite, toggleFavorite, removeFavorite };
}
