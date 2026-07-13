import { supabaseAdmin } from '../../services/database';
import { createLogger } from '../../lib/observability/logger';
import { trackScraperRun, trackJob } from '../../lib/observability/metrics';

function normalizePrice(price) {
  if (price == null) return 0;
  if (typeof price === 'number') return Math.round(price * 100) / 100;
  const cleaned = String(price).replace(/[^0-9.,]/g, '').replace(/\./g, '').replace(',', '.');
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : 0;
}

function normalizeEAN(ean) {
  if (!ean) return null;
  const cleaned = String(ean).replace(/[^0-9]/g, '');
  return cleaned.length >= 8 && cleaned.length <= 14 ? cleaned : null;
}

function sameValue(left, right) {
  return (left ?? null) === (right ?? null);
}

function sameNumber(left, right) {
  if (left == null && right == null) return true;
  return Number.isFinite(Number(left)) && Number.isFinite(Number(right))
    && Math.abs(Number(left) - Number(right)) < 0.01;
}

export class ScraperEngine {
  constructor(options) {
    this.name = options.name;
    this.label = options.label || options.name;
    this.type = options.type || 'supermarket';
    this.baseUrl = options.baseUrl;
    this.searchUrl = options.searchUrl;
    this.categoryUrl = options.categoryUrl;
    this.selectors = options.selectors;
    this.rateLimitMs = options.rateLimitMs || 2000;
    this.retryMax = options.retryMax || 3;
    this.timeout = options.timeout || 30000;
    this.headers = options.headers || {};
    this.fullCatalog = options.fullCatalog === true;
    this.logger = createLogger({ service: `scraper:${this.name}` });
    this.lastRequest = 0;
  }

  async waitForRateLimit() {
    const now = Date.now();
    const elapsed = now - this.lastRequest;
    if (elapsed < this.rateLimitMs) {
      await new Promise(r => setTimeout(r, this.rateLimitMs - elapsed));
    }
    this.lastRequest = Date.now();
  }

  async fetch(url, retries = 0) {
    await this.waitForRateLimit();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/json',
          'Accept-Language': 'es-CO,es;q=0.9,en;q=0.7',
          ...this.headers,
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      if (retries < this.retryMax) {
        const backoff = Math.pow(2, retries) * 1000 + Math.random() * 1000;
        this.logger.warn(`Retry ${retries + 1}/${this.retryMax} for ${url}`, { error: err.message, backoff });
        await new Promise(r => setTimeout(r, backoff));
        return this.fetch(url, retries + 1);
      }
      throw err;
    }
  }

  async search(query) {
    const url = this.searchUrl.replace('{q}', encodeURIComponent(query));
    return this.fetch(url);
  }

  async getCategory(category) {
    const url = this.categoryUrl.replace('{category}', encodeURIComponent(category));
    return this.fetch(url);
  }

  async runScraper({ query = 'arroz', category = '', limit = 50 } = {}) {
    trackJob(this.name, 'start');
    const startedAt = new Date();
    let productsFound = 0;
    let productsUpdated = 0;
    let productsInserted = 0;
    let productsRemoved = 0;
    let priceChanges = 0;
    let errors = 0;
    const seenStoreProductIds = new Set();

    try {
      this.logger.info(`Starting scraper for ${this.name}`, { query, category, limit });
      const response = category ? await this.getCategory(category) : await this.search(query);
      const html = await response.text();
      const products = this.parsePage(html, limit);
      productsFound = products.length;

      for (const product of products) {
        try {
          const saved = await this.persistProduct(product);
          if (!saved) continue;
          seenStoreProductIds.add(saved.storeProductId);
          if (saved.inserted) productsInserted++;
          if (saved.updated) productsUpdated++;
          if (saved.priceChanged) priceChanges++;
        } catch (err) {
          errors++;
          this.logger.error(`Error persisting product ${product.name || product.sku || 'unknown'}`, { error: err.message });
        }
      }

      if (this.fullCatalog && errors === 0 && seenStoreProductIds.size > 0) {
        productsRemoved = await this.markMissingProductsUnavailable(seenStoreProductIds);
      }

      const duration = Date.now() - startedAt.getTime();
      this.logger.info(`Scraper completed for ${this.name}`, { productsFound, productsUpdated, productsInserted, productsRemoved, priceChanges, errors, durationMs: duration });
      trackScraperRun(this.name, duration, productsFound, productsUpdated, null);
      trackJob(this.name, 'complete');
      await this.recordJob({ status: 'completed', duration, productsFound, productsUpdated, productsInserted, productsRemoved, priceChanges, errors, startedAt });
      return { productsFound, productsUpdated, productsInserted, productsRemoved, priceChanges, errors, duration };
    } catch (err) {
      const duration = Date.now() - startedAt.getTime();
      this.logger.error(`Scraper failed for ${this.name}`, { error: err.message, durationMs: duration });
      trackScraperRun(this.name, duration, productsFound, productsUpdated, err);
      trackJob(this.name, 'fail');
      await this.recordJob({ status: 'failed', error: err.message, duration, productsFound, productsUpdated, productsInserted, productsRemoved, priceChanges, errors: errors + 1, startedAt });
      throw err;
    }
  }

  parsePage() {
    throw new Error('parsePage must be implemented by subclass');
  }

  async persistProduct(product) {
    if (!supabaseAdmin) return false;
    const normalized = this.normalizeProduct(product);
    if (!normalized.name || normalized.price <= 0) return false;

    const [store, brandId, categoryId] = await Promise.all([
      this.getOrCreateStore(),
      this.getOrCreateBrand(normalized.brand),
      this.getOrCreateCategory(normalized.category),
    ]);
    if (!store) return false;

    let productQuery = supabaseAdmin.from('master_products').select('id, name, slug, short_name, commercial_name, brand_id, category_id, barcode, ean, image, description, unit, weight, status');
    if (normalized.ean) {
      productQuery = productQuery.or(`ean.eq.${normalized.ean},barcode.eq.${normalized.ean}`);
    } else {
      productQuery = productQuery.eq('slug', normalized.slug);
    }

    const { data: existing, error: findError } = await productQuery.limit(1).maybeSingle();
    if (findError) throw findError;

    const masterPayload = {
      name: normalized.name,
      slug: normalized.slug,
      short_name: normalized.shortName,
      commercial_name: normalized.name,
      brand_id: brandId,
      category_id: categoryId,
      barcode: normalized.ean,
      ean: normalized.ean,
      image: normalized.image,
      description: normalized.description,
      unit: normalized.unit,
      weight: normalized.weight,
      status: 'active',
      updated_at: new Date().toISOString(),
    };

    let masterId;
    let inserted = false;
    if (existing) {
      const comparablePayload = { ...masterPayload };
      delete comparablePayload.updated_at;
      const masterChanged = Object.entries(comparablePayload).some(([key, value]) => {
        if (key === 'weight') return !sameNumber(existing[key], value);
        return !sameValue(existing[key], value);
      });
      if (masterChanged) {
        const { error } = await supabaseAdmin.from('master_products').update(masterPayload).eq('id', existing.id);
        if (error) throw error;
      }
      masterId = existing.id;
    } else {
      const { data: insertedProduct, error } = await supabaseAdmin.from('master_products').insert(masterPayload).select('id').single();
      if (error) throw error;
      masterId = insertedProduct.id;
      inserted = true;
    }

    await this.persistImage(masterId, normalized);

    const { data: storeProduct, error: spError } = await supabaseAdmin
      .from('store_products')
      .select('id, sku, price, original_price, available, url')
      .eq('master_product_id', masterId)
      .eq('store_id', store.id)
      .is('branch_id', null)
      .maybeSingle();
    if (spError) throw spError;

    let storeProductId;
    let updated = false;
    let priceChanged = false;
    if (storeProduct) {
      priceChanged = Number(storeProduct.price) !== normalized.price;
      const availabilityChanged = Boolean(storeProduct.available) !== Boolean(normalized.available);
      const listingChanged = priceChanged
        || availabilityChanged
        || !sameNumber(storeProduct.original_price, normalized.originalPrice)
        || !sameValue(storeProduct.sku, normalized.sku)
        || !sameValue(storeProduct.url, normalized.url);
      if (listingChanged) {
        const { error } = await supabaseAdmin.from('store_products').update({
          sku: normalized.sku,
          price: normalized.price,
          original_price: normalized.originalPrice,
          available: normalized.available,
          url: normalized.url,
          captured_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).eq('id', storeProduct.id);
        if (error) throw error;
      }
      storeProductId = storeProduct.id;
      updated = listingChanged;
      if (availabilityChanged && !priceChanged) priceChanged = true;
    } else {
      const { data: newStoreProduct, error } = await supabaseAdmin.from('store_products').insert({
        master_product_id: masterId,
        store_id: store.id,
        sku: normalized.sku,
        price: normalized.price,
        original_price: normalized.originalPrice,
        available: normalized.available,
        url: normalized.url,
        captured_at: new Date().toISOString(),
      }).select('id').single();
      if (error) throw error;
      storeProductId = newStoreProduct.id;
      priceChanged = true;
    }

    if (priceChanged) {
      const { error } = await supabaseAdmin.from('store_product_history').insert({
        store_product_id: storeProductId,
        price: normalized.price,
        available: normalized.available,
        captured_at: new Date().toISOString(),
      });
      if (error) throw error;
    }

    return { storeProductId, inserted, updated, priceChanged };
  }

  async persistImage(masterProductId, product) {
    if (!product.image) return;
    await supabaseAdmin.from('product_images').upsert({
      master_product_id: masterProductId,
      url: product.image,
      alt: product.name,
      is_primary: true,
    }, { onConflict: 'master_product_id,url', ignoreDuplicates: true });
  }

  async markMissingProductsUnavailable(seenStoreProductIds) {
    const store = await this.getOrCreateStore();
    if (!store) return 0;
    const { data, error } = await supabaseAdmin
      .from('store_products')
      .select('id, price')
      .eq('store_id', store.id)
      .eq('available', true);
    if (error) throw error;

    const missing = (data || []).filter(item => !seenStoreProductIds.has(item.id));
    for (const item of missing) {
      await supabaseAdmin.from('store_products').update({ available: false, updated_at: new Date().toISOString() }).eq('id', item.id);
      await supabaseAdmin.from('store_product_history').insert({ store_product_id: item.id, price: item.price, available: false });
    }
    return missing.length;
  }

  async getOrCreateStore() {
    const { data: existing, error: findError } = await supabaseAdmin.from('stores').select('id').eq('slug', this.name).maybeSingle();
    if (findError) throw findError;
    if (existing) return existing;
    const category = this.type === 'pharmacy' ? 'Farmacia' : 'Supermercado';
    const { data, error } = await supabaseAdmin.from('stores').insert({
      name: this.label,
      slug: this.name,
      brand: this.label,
      chain: this.label,
      category,
      website: this.baseUrl,
      status: 'active',
    }).select('id').single();
    if (error) throw error;
    return data;
  }

  async getOrCreateBrand(name) {
    if (!name) return null;
    const slug = this.toSlug(name);
    const { data: existing, error: findError } = await supabaseAdmin.from('brands').select('id').eq('slug', slug).maybeSingle();
    if (findError) throw findError;
    if (existing) return existing.id;
    const { data, error } = await supabaseAdmin.from('brands').insert({ name: name.slice(0, 150), slug }).select('id').single();
    if (error) throw error;
    return data.id;
  }

  async getOrCreateCategory(name) {
    if (!name) return null;
    const slug = this.toSlug(name).slice(0, 100);
    const { data: existing, error: findError } = await supabaseAdmin.from('categories').select('id').eq('slug', slug).maybeSingle();
    if (findError) throw findError;
    if (existing) return existing.id;
    const { data, error } = await supabaseAdmin.from('categories').insert({ name: name.slice(0, 100), slug, level: 0 }).select('id').single();
    if (error) throw error;
    return data.id;
  }

  normalizeProduct(product) {
    const ean = normalizeEAN(product.ean || product.barcode || product.gtin || null);
    const name = product.name?.trim()?.slice(0, 300) || product.sku || product.url || ean;
    return {
      name,
      slug: this.toSlug(ean || name),
      shortName: name?.slice(0, 150) || null,
      brand: product.brand?.trim()?.slice(0, 150) || null,
      ean,
      sku: product.sku?.toString()?.slice(0, 100) || ean,
      price: normalizePrice(product.price),
      originalPrice: product.originalPrice ? normalizePrice(product.originalPrice) : null,
      image: Array.isArray(product.image) ? product.image[0] : product.image || null,
      description: product.description?.trim()?.slice(0, 2000) || null,
      category: product.category?.toString()?.slice(0, 100) || null,
      unit: product.unit || 'unidad',
      weight: product.weight || null,
      url: product.url || null,
      available: product.available !== false,
    };
  }

  toSlug(text) {
    if (!text) return `product-${Date.now()}`;
    return String(text).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 300) || `product-${Date.now()}`;
  }

  async recordJob({ status, error, duration, productsFound, productsUpdated, productsInserted, productsRemoved, priceChanges, errors, startedAt }) {
    if (!supabaseAdmin) return;
    const started = startedAt || new Date(Date.now() - (duration || 0));
    const finished = new Date();
    try {
      await supabaseAdmin.from('scraping_jobs').insert({
        store: this.name,
        status,
        payload: { error, duration, productsFound, productsUpdated, productsInserted, productsRemoved, priceChanges, errors },
        started_at: started.toISOString(),
        finished_at: finished.toISOString(),
      });
      await supabaseAdmin.from('scraping_runs').insert({
        store: this.name,
        status,
        products_found: productsFound || 0,
        products_updated: productsUpdated || 0,
        products_inserted: productsInserted || 0,
        products_removed: productsRemoved || 0,
        price_changes: priceChanges || 0,
        errors: errors || 0,
        error_message: error || null,
        duration_seconds: Math.round((duration || 0) / 1000),
        started_at: started.toISOString(),
        finished_at: finished.toISOString(),
      });
    } catch (err) {
      this.logger.error('Error recording job', { error: err.message });
    }
  }
}
