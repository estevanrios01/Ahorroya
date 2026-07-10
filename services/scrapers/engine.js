import { supabaseAdmin } from '../../services/database';
import { createLogger } from '../../lib/observability/logger';
import { trackScraperRun, trackJob } from '../../lib/observability/metrics';

export class ScraperEngine {
  constructor(options) {
    this.name = options.name;
    this.baseUrl = options.baseUrl;
    this.searchUrl = options.searchUrl;
    this.categoryUrl = options.categoryUrl;
    this.selectors = options.selectors;
    this.rateLimitMs = options.rateLimitMs || 2000;
    this.retryMax = options.retryMax || 3;
    this.timeout = options.timeout || 30000;
    this.headers = options.headers || {};
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
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 'Accept': 'text/html,application/xhtml+xml', 'Accept-Language': 'es-CO,es;q=0.9', ...this.headers },
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

  parseProduct(element) {
    throw new Error('parseProduct must be implemented by subclass');
  }

  async runScraper({ query = '', category = '', limit = 50 } = {}) {
    trackJob(this.name, 'start');
    const startTime = Date.now();
    let productsFound = 0;
    let productsUpdated = 0;
    let error = null;

    try {
      this.logger.info(`Starting scraper for ${this.name}`, { query, category });
      const response = query ? await this.search(query) : await this.getCategory(category);
      const html = await response.text();
      const products = this.parsePage(html, limit);
      productsFound = products.length;

      for (const product of products) {
        try {
          const saved = await this.persistProduct(product);
          if (saved) productsUpdated++;
        } catch (err) {
          this.logger.error(`Error persisting product ${product.name}`, { error: err.message });
        }
      }

      const duration = Date.now() - startTime;
      this.logger.info(`Scraper completed for ${this.name}`, { productsFound, productsUpdated, durationMs: duration });
      trackScraperRun(this.name, duration, productsFound, productsUpdated, null);
      trackJob(this.name, 'complete');
    } catch (err) {
      error = err;
      const duration = Date.now() - startTime;
      this.logger.error(`Scraper failed for ${this.name}`, { error: err.message, durationMs: duration });
      trackScraperRun(this.name, duration, productsFound, productsUpdated, err);
      trackJob(this.name, 'fail');
      await this.recordJob({ status: 'failed', error: err.message, duration, productsFound, productsUpdated });
      throw err;
    }
    await this.recordJob({ status: 'completed', duration: Date.now() - startTime, productsFound, productsUpdated });
    return { productsFound, productsUpdated, duration: Date.now() - startTime };
  }

  parsePage(html, limit) {
    throw new Error('parsePage must be implemented by subclass');
  }

  async persistProduct(product) {
    if (!supabaseAdmin || !product.ean) return false;
    const normalized = this.normalizeProduct(product);
    const { data: existing } = await supabaseAdmin.from('master_products').select('id').eq('ean', normalized.ean).maybeSingle();
    let masterId;
    if (existing) {
      await supabaseAdmin.from('master_products').update({ ...normalized, updated_at: new Date().toISOString() }).eq('id', existing.id);
      masterId = existing.id;
    } else {
      const { data: inserted } = await supabaseAdmin.from('master_products').insert(normalized).select('id').single();
      if (!inserted) return false;
      masterId = inserted.id;
    }
    const { data: store } = await supabaseAdmin.from('stores').select('id').eq('slug', this.name).single();
    if (!store) return false;
    const { data: sp } = await supabaseAdmin.from('store_products').select('id, price').eq('master_product_id', masterId).eq('store_id', store.id).maybeSingle();
    if (sp && sp.price !== normalized.price) {
      await supabaseAdmin.from('store_product_history').insert({ store_product_id: sp.id, price: sp.price, available: true });
    }
    if (sp) {
      await supabaseAdmin.from('store_products').update({ price: normalized.price, available: true, captured_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', sp.id);
    } else {
      await supabaseAdmin.from('store_products').insert({ master_product_id: masterId, store_id: store.id, price: normalized.price, available: true, captured_at: new Date().toISOString() });
    }
    return true;
  }

  normalizeProduct(product) {
    return {
      name: product.name?.trim()?.slice(0, 300) || 'Sin nombre',
      slug: this.toSlug(product.name || product.ean),
      short_name: product.name?.trim()?.slice(0, 150) || null,
      brand: product.brand?.trim()?.slice(0, 150) || null,
      barcode: product.ean,
      ean: product.ean,
      price: product.price || 0,
      image: product.image || null,
      description: product.description?.trim()?.slice(0, 2000) || null,
      category: product.category || null,
      unit: product.unit || 'unidad',
      weight: product.weight || null,
      status: 'active',
    };
  }

  toSlug(text) {
    if (!text) return `product-${Date.now()}`;
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 300) || `product-${Date.now()}`;
  }

  async recordJob({ status, error, duration, productsFound, productsUpdated }) {
    if (!supabaseAdmin) return;
    try {
      await supabaseAdmin.from('scraping_jobs').insert({
        store: this.name,
        status,
        payload: { error, duration, productsFound, productsUpdated },
        started_at: new Date(Date.now() - (duration || 0)).toISOString(),
        finished_at: new Date().toISOString(),
      });
      await supabaseAdmin.from('scraping_runs').insert({
        products_found: productsFound || 0,
        products_updated: productsUpdated || 0,
        duration_seconds: Math.round((duration || 0) / 1000),
        started_at: new Date(Date.now() - (duration || 0)).toISOString(),
        finished_at: new Date().toISOString(),
      });
    } catch (err) {
      this.logger.error('Error recording job', { error: err.message });
    }
  }
}
