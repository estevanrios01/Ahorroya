import axios from 'axios';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://ahorroya.vercel.app';

export const api = axios.create({ baseURL: API_BASE, timeout: 15000 });

export interface Product {
  id: string; name: string; slug: string; brand: string; category: string;
  price: number; oldPrice?: number; image?: string; storesCount: number;
  description?: string; barcode?: string;
}

export interface Store {
  id: string; name: string; slug: string; type: string; logo?: string;
  description?: string; branches: number; color?: string;
}

export interface PriceEntry {
  store: string; storeSlug: string; price: number; oldPrice?: number;
  distance: number; available: boolean; address: string;
}

export const products = {
  search: (q: string) => api.get<{ query: string; results: Product[]; total: number }>('/api/search', { params: { q } }),
  getBySlug: (slug: string) => api.get<Product>(`/api/products/${slug}`),
  getAll: () => api.get<Product[]>('/api/products'),
};

export const stores = {
  getAll: () => api.get<Store[]>('/api/stores'),
  getBySlug: (slug: string) => api.get<Store>(`/api/stores/${slug}`),
};

export const barcode = {
  lookup: (code: string) => api.get<Product>(`/api/barcode/${code}`),
};
