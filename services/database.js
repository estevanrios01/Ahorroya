import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getClient() {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createClient(supabaseUrl, supabaseAnonKey);
}

function getAdminClient() {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey);
}

export const supabase = getClient();
export const supabaseAdmin = getAdminClient();

function handleError(error, context) {
  if (!error) return null;
  const msg = `[DB] ${context}: ${error.message}`;
  if (typeof console !== 'undefined') console.error(msg);
  return { error: msg };
}

async function attachPrices(products) {
  if (!supabase || !products?.length) return products || [];
  const ids = products.map((product) => product.id).filter(Boolean);
  if (ids.length === 0) return products;
  const { data, error } = await supabase
    .from('store_products')
    .select('price, original_price, store_id, available, url, master_product_id, stores!inner(website)')
    .in('master_product_id', ids)
    .eq('available', true)
    .limit(ids.length * 8);
  if (error) return products.map((product) => ({ ...product, store_products: [] }));
  const byProduct = new Map();
  for (const row of data || []) {
    if (row.stores?.website && row.url === row.stores.website) continue;
    if (!byProduct.has(row.master_product_id)) byProduct.set(row.master_product_id, []);
    byProduct.get(row.master_product_id).push(row);
  }
  return products.map((product) => ({ ...product, store_products: byProduct.get(product.id) || [] }));
}

export const db = {
  products: {
    async list({ q, category, city, page = 1, limit = 20 } = {}) {
      if (!supabase) return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
      if (city) {
        const offset = (page - 1) * limit;
        let data = null;
        let error = null;
        for (let attempt = 1; attempt <= 2; attempt++) {
          const result = await supabase.rpc('search_products_by_city', {
            p_q: q || '',
            p_city: city,
            p_category_id: category || null,
            p_limit: limit,
            p_offset: offset,
          });
          data = result.data;
          error = result.error;
          if (!error) break;
          await new Promise((resolve) => setTimeout(resolve, attempt * 250));
        }
        if (error) return handleError(error, 'products.list.searchProductsByCity');
        const rows = data || [];
        const total = rows.length > 0 ? Number(rows[0].total_count || 0) : 0;
        const products = rows.map((row) => ({
          id: row.id,
          name: row.name,
          slug: row.slug,
          short_name: row.short_name,
          barcode: row.barcode,
          ean: row.ean,
          image: row.image,
          unit: row.unit,
          brands: row.brand_name ? { name: row.brand_name, slug: row.brand_slug } : null,
          categories: row.category_name ? { name: row.category_name, slug: row.category_slug } : null,
          store_products: row.store_products || [],
        }));
        return {
          data: products,
          pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        };
      }
      let query = supabase
        .from('master_products')
        .select('*, brands(name, slug), categories(name, slug)')
        .eq('status', 'active');
      if (q) {
        const filters = [`name.ilike.%${q}%`, `short_name.ilike.%${q}%`];
        if (/^\d+$/.test(q)) {
          filters.push(`barcode.ilike.%${q}%`, `ean.ilike.%${q}%`);
        }
        query = query.or(filters.join(','));
      }
      if (category) query = query.eq('category_id', category);
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      const { data, error } = await query.range(from, to);
      if (error?.code === '57014') {
        return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
      }
      if (error) return handleError(error, 'products.list');
      const products = await attachPrices(data || []);
      const total = from + products.length;
      return { data: products, pagination: { page, limit, total, pages: page } };
    },

    async getBySlug(slug) {
      if (!supabase) return { data: null };
      const { data, error } = await supabase.from('master_products').select('*').eq('slug', slug).eq('status', 'active').single();
      if (error) return handleError(error, 'products.getBySlug');
      const { data: images } = await supabase
        .from('product_images')
        .select('url,thumbnail_url,is_primary,alt')
        .eq('master_product_id', data.id)
        .order('is_primary', { ascending: false });
      const imageUrls = (images || []).map((image) => image.url).filter(Boolean);
      return { data: { ...data, image: data.image || imageUrls[0] || null, images: imageUrls } };
    },

    async getById(id) {
      if (!supabase) return { data: null };
      const { data, error } = await supabase.from('master_products').select('*').eq('id', id).single();
      if (error) return handleError(error, 'products.getById');
      return { data };
    },

    async getByBarcode(code) {
      if (!supabase) return { data: null };
      const { data, error } = await supabase
        .from('master_products')
        .select('*, brands(name, slug), categories(name, slug)')
        .or(`barcode.eq.${code},ean.eq.${code},upc.eq.${code}`)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle();
      if (error) return handleError(error, 'products.getByBarcode');
      return { data };
    },

    async getByCategory(categorySlug, { page = 1, limit = 20 } = {}) {
      if (!supabase) return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
      const { data: cat } = await supabase.from('categories').select('id').eq('slug', categorySlug).single();
      if (!cat) return { data: [] };
      let query = supabase.from('master_products').select('*', { count: 'exact' }).eq('category_id', cat.id).eq('status', 'active');
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      const { data, count, error } = await query.range(from, to).order('name');
      if (error) return handleError(error, 'products.getByCategory');
      return { data: data || [], pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) } };
    },

    async getByBrand(brandSlug, { page = 1, limit = 20 } = {}) {
      if (!supabase) return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
      const { data: brand } = await supabase.from('brands').select('id').eq('slug', brandSlug).single();
      if (!brand) return { data: [] };
      let query = supabase.from('master_products').select('*', { count: 'exact' }).eq('brand_id', brand.id).eq('status', 'active');
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      const { data, count, error } = await query.range(from, to).order('name');
      if (error) return handleError(error, 'products.getByBrand');
      return { data: data || [], pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) } };
    },

    async getPrices(productId) {
      if (!supabase) return { data: [] };
      const { data, error } = await supabase.from('store_products').select('*, stores!inner(name, slug, logo, website), branches!left(name, address, city, latitude, longitude)').eq('master_product_id', productId).eq('available', true).order('price');
      if (error) return handleError(error, 'products.getPrices');
      return { data: (data || []).filter((row) => !row.stores?.website || row.url !== row.stores.website) };
    },

    async getPriceHistory(storeProductId) {
      if (!supabase) return { data: [] };
      const { data, error } = await supabase.from('store_product_history').select('*').eq('store_product_id', storeProductId).order('captured_at', { ascending: true });
      if (error) return handleError(error, 'products.getPriceHistory');
      return { data: data || [] };
    },

    async search(query, { page = 1, limit = 20 } = {}) {
      if (!supabase) return { data: [], total: 0 };
      const { data, count, error } = await supabase.from('master_products').select('*', { count: 'exact' }).or(`name.ilike.%${query}%,short_name.ilike.%${query}%,barcode.ilike.%${query}%,ean.ilike.%${query}%`).eq('status', 'active').range((page - 1) * limit, (page - 1) * limit + limit - 1).order('name');
      if (error) return handleError(error, 'products.search');
      return { data: data || [], total: count || 0 };
    },
  },

  stores: {
    async list({ page = 1, limit = 50 } = {}) {
      if (!supabase) return { data: [], pagination: { page, limit, total: 0, pages: 0 } };
      const { data, count, error } = await supabase.from('stores').select('*', { count: 'exact' }).eq('status', 'active').range((page - 1) * limit, (page - 1) * limit + limit - 1).order('name');
      if (error) return handleError(error, 'stores.list');
      return { data: data || [], pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) } };
    },

    async getBySlug(slug) {
      if (!supabase) return { data: null };
      const { data, error } = await supabase.from('stores').select('*').eq('slug', slug).single();
      if (error) return handleError(error, 'stores.getBySlug');
      return { data };
    },

    async getBranches(storeId) {
      if (!supabase) return { data: [] };
      const { data, error } = await supabase.from('branches').select('*').eq('store_id', storeId).eq('status', 'active');
      if (error) return handleError(error, 'stores.getBranches');
      return { data: data || [] };
    },

    async getPharmacyList() {
      if (!supabase) return { data: [] };
      const { data, error } = await supabase.from('stores').select('*').eq('status', 'active').or('category.eq.Farmacia,category.eq.Droguería').order('name');
      if (error) return handleError(error, 'stores.getPharmacyList');
      return { data: data || [] };
    },
  },

  categories: {
    async list() {
      if (!supabase) return { data: [] };
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) return handleError(error, 'categories.list');
      return { data: data || [] };
    },

    async getBySlug(slug) {
      if (!supabase) return { data: null };
      const { data, error } = await supabase.from('categories').select('*').eq('slug', slug).single();
      if (error) return handleError(error, 'categories.getBySlug');
      return { data };
    },

    async getProductCount(categoryId) {
      if (!supabase) return 0;
      const { count, error } = await supabase.from('master_products').select('*', { count: 'exact', head: true }).eq('category_id', categoryId).eq('status', 'active');
      if (error) return 0;
      return count || 0;
    },
  },

  brands: {
    async list() {
      if (!supabase) return { data: [] };
      const { data, error } = await supabase.from('brands').select('*').order('name');
      if (error) return handleError(error, 'brands.list');
      return { data: data || [] };
    },

    async getBySlug(slug) {
      if (!supabase) return { data: null };
      const { data, error } = await supabase.from('brands').select('*').eq('slug', slug).single();
      if (error) return handleError(error, 'brands.getBySlug');
      return { data };
    },

    async getProductCount(brandId) {
      if (!supabase) return 0;
      const { count, error } = await supabase.from('master_products').select('*', { count: 'exact', head: true }).eq('brand_id', brandId).eq('status', 'active');
      if (error) return 0;
      return count || 0;
    },
  },

  cities: {
    async list() {
      if (!supabase) return { data: [] };
      const { data, error } = await supabase.from('branches').select('city, department, count:store_id').eq('status', 'active').not('city', 'is', null);
      if (error) return handleError(error, 'cities.list');
      const map = new Map();
      for (const row of data || []) {
        if (!row.city) continue;
        const key = row.city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (!map.has(key)) {
          map.set(key, { name: row.city, slug: key, department: row.department || '', stores: new Set(), products: 0 });
        }
        if (row.count) map.get(key).stores.add(row.count);
      }
      const cities = [];
      for (const entry of map.values()) {
        cities.push({ name: entry.name, slug: entry.slug, department: entry.department, storeCount: entry.stores.size });
      }
      return { data: cities.sort((a, b) => a.name.localeCompare(b.name)) };
    },

    async getBySlug(slug) {
      const { data: all } = await this.list();
      if (!all) return { data: null };
      const found = all.find(c => c.slug === slug);
      return { data: found || null };
    },

    async getBranchesByCity(cityName) {
      if (!supabase) return { data: [] };
      const { data, error } = await supabase.from('branches').select('*, stores!inner(name, slug, logo, category)').eq('status', 'active').ilike('city', cityName);
      if (error) return handleError(error, 'cities.getBranchesByCity');
      return { data: data || [] };
    },
  },

  departments: {
    async list() {
      if (!supabase) return { data: [] };
      const { data, error } = await supabase.from('branches').select('department').eq('status', 'active').not('department', 'is', null);
      if (error) return handleError(error, 'departments.list');
      const seen = new Set();
      const depts = [];
      for (const row of data || []) {
        if (!row.department || seen.has(row.department.toLowerCase())) continue;
        seen.add(row.department.toLowerCase());
        const slug = row.department.toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        depts.push({ name: row.department, slug });
      }
      return { data: depts.sort((a, b) => a.name.localeCompare(b.name)) };
    },

    async getBySlug(slug) {
      const { data: all } = await this.list();
      if (!all) return { data: null };
      const found = all.find(d => d.slug === slug);
      return { data: found || null };
    },

    async getBranchesByDepartment(deptName) {
      if (!supabase) return { data: [] };
      const { data, error } = await supabase.from('branches').select('*, stores!inner(name, slug, logo, category)').eq('status', 'active').ilike('department', deptName);
      if (error) return handleError(error, 'departments.getBranchesByDepartment');
      return { data: data || [] };
    },
  },

  favorites: {
    async list(userId) {
      if (!supabase || !userId) return { data: [] };
      const { data, error } = await supabase.from('baskets').select('*, basket_items(*, master_products(*))').eq('user_id', userId).eq('favorite', true);
      if (error) return handleError(error, 'favorites.list');
      return { data: data || [] };
    },

    async toggle(userId, productId) {
      if (!supabaseAdmin) return { error: 'DB not configured' };
      const { data: existing } = await supabaseAdmin.from('basket_items').select('id, basket_id').eq('basket_id', userId).eq('master_product_id', productId).maybeSingle();
      if (existing) {
        await supabaseAdmin.from('basket_items').delete().eq('id', existing.id);
        return { favorited: false };
      }
      let { data: basket } = await supabaseAdmin.from('baskets').select('id').eq('user_id', userId).eq('favorite', true).maybeSingle();
      if (!basket) {
        const { data: newBasket } = await supabaseAdmin.from('baskets').insert({ user_id: userId, name: 'Favoritos', favorite: true }).select().single();
        basket = newBasket;
      }
      await supabaseAdmin.from('basket_items').insert({ basket_id: basket.id, master_product_id: productId, quantity: 1 });
      return { favorited: true };
    },
  },

  scraping: {
    async listJobs({ limit = 50 } = {}) {
      if (!supabase) return { data: [] };
      const { data, error } = await supabase.from('scraping_jobs').select('*').order('created_at', { ascending: false }).limit(limit);
      if (error) return handleError(error, 'scraping.listJobs');
      return { data: data || [] };
    },

    async createJob(store, payload = {}) {
      if (!supabaseAdmin) return { error: 'DB not configured' };
      const { data, error } = await supabaseAdmin.from('scraping_jobs').insert({ store, status: 'pending', priority: 100, payload }).select().single();
      if (error) return handleError(error, 'scraping.createJob');
      return { data };
    },

    async updateJob(id, updates) {
      if (!supabaseAdmin) return { error: 'DB not configured' };
      const { data, error } = await supabaseAdmin.from('scraping_jobs').update(updates).eq('id', id).select().single();
      if (error) return handleError(error, 'scraping.updateJob');
      return { data };
    },

    async recordRun(runData) {
      if (!supabaseAdmin) return { error: 'DB not configured' };
      const { data, error } = await supabaseAdmin.from('scraping_runs').insert(runData).select().single();
      if (error) return handleError(error, 'scraping.recordRun');
      return { data };
    },

    async getLatestRun(store) {
      if (!supabase) return null;
      const { data, error } = await supabase.from('scraping_runs').select('*').eq('store', store || '').order('started_at', { ascending: false }).limit(1).maybeSingle();
      if (error) return null;
      return data;
    },
  },

  analytics: {
    async track(event) {
      if (!supabaseAdmin) return;
      await supabaseAdmin.from('analytics_events').insert(event).select().maybeSingle();
    },
  },
};
