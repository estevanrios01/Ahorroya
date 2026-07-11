import { supabase } from '../../lib/supabase';

function handleError(error, context) {
  if (!error) return null;
  if (typeof console !== 'undefined') console.error(`[CatalogService] ${context}:`, error.message);
  return error.message;
}

export async function getAllProducts({ q, category, page = 1, limit = 20 } = {}) {
  if (!supabase) return { products: [], pagination: { page, limit, total: 0, pages: 0 } };
  let query = supabase.from('master_products').select('*', { count: 'exact' }).eq('status', 'active');
  if (q) query = query.or(`name.ilike.%${q}%,short_name.ilike.%${q}%,barcode.ilike.%${q}%,ean.ilike.%${q}%`);
  if (category) query = query.eq('category_id', category);
  const from = (page - 1) * limit;
  const { data, count, error } = await query.range(from, from + limit - 1).order('name');
  if (error) { handleError(error, 'getAllProducts'); return { products: [] }; }
  return { products: data || [], pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) } };
}

export async function getProductBySlug(slug) {
  if (!supabase) return { product: null };
  const { data, error } = await supabase.from('master_products').select('*').eq('slug', slug).eq('status', 'active').single();
  if (error) return { product: null, error: error.message };
  const { data: prices } = await supabase.from('store_products').select('*, stores!inner(name, slug, logo)').eq('master_product_id', data.id).eq('available', true).order('price');
  return { product: { ...data, prices: prices || [] } };
}

export async function getProductById(id) {
  if (!supabase) return { product: null };
  const { data, error } = await supabase.from('master_products').select('*').eq('id', id).single();
  if (error) return { product: null };
  return { product: data };
}

export async function getAllStores({ page = 1, limit = 50 } = {}) {
  if (!supabase) return { stores: [] };
  const { data, count, error } = await supabase.from('stores').select('*', { count: 'exact' }).eq('status', 'active').range((page - 1) * limit, (page - 1) * limit + limit - 1).order('name');
  if (error) { handleError(error, 'getAllStores'); return { stores: [] }; }
  return { stores: data || [], pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) } };
}

export async function getStoreBySlug(slug) {
  if (!supabase) return { store: null };
  const { data, error } = await supabase.from('stores').select('*').eq('slug', slug).single();
  if (error) return { store: null };
  return { store: data };
}

export async function getAllPharmacies() {
  if (!supabase) return { stores: [] };
  const { data, error } = await supabase.from('stores').select('*').eq('status', 'active').or('category.eq.Farmacia,category.eq.Droguer%C3%ADa').order('name');
  if (error) { handleError(error, 'getAllPharmacies'); return { stores: [] }; }
  return { stores: data || [] };
}

export async function getAllCategories() {
  if (!supabase) return { categories: [] };
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) { handleError(error, 'getAllCategories'); return { categories: [] }; }
  return { categories: (data || []).map((category) => ({ ...category, productCount: null })) };
}

export async function getCategoryBySlug(slug) {
  if (!supabase) return { category: null };
  const { data, error } = await supabase.from('categories').select('*').eq('slug', slug).single();
  if (error) return { category: null };
  const { count } = await supabase.from('master_products').select('*', { count: 'exact', head: true }).eq('category_id', data.id).eq('status', 'active');
  return { category: { ...data, productCount: count || 0 } };
}

export async function getProductsByCategory(categorySlug, { page = 1, limit = 20 } = {}) {
  if (!supabase) return { products: [] };
  const { data: cat } = await supabase.from('categories').select('id').eq('slug', categorySlug).single();
  if (!cat) return { products: [] };
  const from = (page - 1) * limit;
  const { data, count, error } = await supabase.from('master_products').select('*', { count: 'exact' }).eq('category_id', cat.id).eq('status', 'active').range(from, from + limit - 1).order('name');
  if (error) { handleError(error, 'getProductsByCategory'); return { products: [] }; }
  return { products: data || [], pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) } };
}

export async function getAllBrands() {
  if (!supabase) return { brands: [] };
  const { data, error } = await supabase.from('brands').select('id,name,slug,logo,country').order('name').limit(2000);
  if (error) { handleError(error, 'getAllBrands'); return { brands: [] }; }
  return { brands: (data || []).map((brand) => ({ ...brand, productCount: null })) };
}

export async function getBrandBySlug(slug) {
  if (!supabase) return { brand: null };
  const { data, error } = await supabase.from('brands').select('*').eq('slug', slug).single();
  if (error) return { brand: null };
  const { count } = await supabase.from('master_products').select('*', { count: 'exact', head: true }).eq('brand_id', data.id).eq('status', 'active');
  return { brand: { ...data, productCount: count || 0 } };
}

export async function getProductsByBrand(brandSlug, { page = 1, limit = 20 } = {}) {
  if (!supabase) return { products: [] };
  const { data: brand } = await supabase.from('brands').select('id').eq('slug', brandSlug).single();
  if (!brand) return { products: [] };
  const from = (page - 1) * limit;
  const { data, count, error } = await supabase.from('master_products').select('*', { count: 'exact' }).eq('brand_id', brand.id).eq('status', 'active').range(from, from + limit - 1).order('name');
  if (error) { handleError(error, 'getProductsByBrand'); return { products: [] }; }
  return { products: data || [], pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) } };
}

export async function getAllCities() {
  if (!supabase) return { cities: [] };
  const { data, error } = await supabase
    .from('branches')
    .select('city, department, store_id, stores(category)')
    .eq('status', 'active')
    .not('city', 'is', null);
  if (error) { handleError(error, 'getAllCities'); return { cities: [] }; }
  const map = new Map();
  for (const row of data || []) {
    if (!row.city) continue;
    const key = row.city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (!map.has(key)) {
      map.set(key, {
        name: row.city,
        slug: key,
        department: row.department || '',
        stores: new Set(),
        supermarkets: new Set(),
        pharmacies: new Set(),
      });
    }
    map.get(key).stores.add(row.store_id);
    const category = row.stores?.category || '';
    if (category === 'Supermercado') map.get(key).supermarkets.add(row.store_id);
    if (category === 'Farmacia' || category === 'Drogueria' || category === 'Droguería') map.get(key).pharmacies.add(row.store_id);
  }
  const cities = [];
  for (const entry of map.values()) {
    cities.push({
      name: entry.name, slug: entry.slug, department: entry.department,
      storeCount: entry.stores.size,
      productCount: entry.stores.size * 150,
      supermarketCount: entry.supermarkets.size,
      pharmacyCount: entry.pharmacies.size,
    });
  }
  return { cities: cities.sort((a, b) => a.name.localeCompare(b.name)) };
}

export async function getCity(slug) {
  const { cities } = await getAllCities();
  const city = cities.find(c => c.slug === slug);
  return { city: city || null };
}

export async function getProductsByStore(storeSlug, { page = 1, limit = 20 } = {}) {
  if (!supabase) return { products: [] };
  const { data: store } = await supabase.from('stores').select('id').eq('slug', storeSlug).single();
  if (!store) return { products: [] };
  const from = (page - 1) * limit;
  const query = supabase
    .from('store_products')
    .select('*, master_products!inner(*)', { count: 'planned' })
    .eq('store_id', store.id)
    .eq('available', true)
    .range(from, from + limit - 1)
    .order('price');
  const { data, count, error } = await query;
  if (error) {
    const fallback = await supabase
      .from('store_products')
      .select('*, master_products!inner(*)')
      .eq('store_id', store.id)
      .eq('available', true)
      .range(from, from + limit - 1)
      .order('price');
    if (fallback.error) {
      handleError(error, 'getProductsByStore');
      return { products: [] };
    }
    return { products: fallback.data || [], pagination: { page, limit, total: from + (fallback.data || []).length, pages: page } };
  }
  return { products: data || [], pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) } };
}

export async function getStore(slug) {
  return getStoreBySlug(slug);
}

export async function getBrand(slug) {
  return getBrandBySlug(slug);
}

export async function getCategory(slug) {
  return getCategoryBySlug(slug);
}

export async function getAllDepartments() {
  if (!supabase) return { departments: [] };
  const { data, error } = await supabase.from('branches').select('department').eq('status', 'active').not('department', 'is', null);
  if (error) { handleError(error, 'getAllDepartments'); return { departments: [] }; }
  const seen = new Set();
  const depts = [];
  for (const row of data || []) {
    if (!row.department || seen.has(row.department.toLowerCase())) continue;
    seen.add(row.department.toLowerCase());
    const slug = row.department.toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    depts.push({ name: row.department, slug });
  }
  return { departments: depts.sort((a, b) => a.name.localeCompare(b.name)) };
}

export async function getDepartment(slug) {
  const { departments } = await getAllDepartments();
  const dept = departments.find(d => d.slug === slug);
  return { department: dept || null };
}

export async function searchProducts(query, { page = 1, limit = 20 } = {}) {
  if (!supabase) return { results: [], total: 0 };
  const { data, count, error } = await supabase.from('master_products').select('*', { count: 'exact' }).or(`name.ilike.%${query}%,short_name.ilike.%${query}%,barcode.ilike.%${query}%,ean.ilike.%${query}%`).eq('status', 'active').range((page - 1) * limit, (page - 1) * limit + limit - 1).order('name');
  if (error) { handleError(error, 'searchProducts'); return { results: [], total: 0 }; }
  return { results: data || [], total: count || 0 };
}

const CatalogService = {
  getAllProducts, getProductBySlug, getProductById,
  getAllStores, getStoreBySlug, getAllPharmacies,
  getAllCategories, getCategoryBySlug, getProductsByCategory,
  getAllBrands, getBrandBySlug, getProductsByBrand,
  getAllCities, getCity, getAllDepartments, getDepartment,
  getProductsByStore, getStore, getBrand, getCategory,
  searchProducts,
};

export default CatalogService;
