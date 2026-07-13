const cheerio = require('cheerio');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const RETAILERS = [
  { name: 'exito', label: 'Éxito', type: 'supermarket', baseUrl: 'https://www.exito.com', searchUrl: 'https://www.exito.com/buscar?q={q}', query: 'arroz' },
  { name: 'd1', label: 'D1', type: 'supermarket', baseUrl: 'https://www.tiendasd1.com', searchUrl: 'https://www.tiendasd1.com/buscar?q={q}', query: 'leche' },
  { name: 'jumbo', label: 'Jumbo', type: 'supermarket', baseUrl: 'https://www.jumbo.com.co', searchUrl: 'https://www.jumbo.com.co/buscar?q={q}', query: 'aceite' },
  { name: 'ara', label: 'Ara', type: 'supermarket', baseUrl: 'https://www.ara.com.co', searchUrl: 'https://www.ara.com.co/buscar?q={q}', query: 'huevos' },
  { name: 'carulla', label: 'Carulla', type: 'supermarket', baseUrl: 'https://www.carulla.com', searchUrl: 'https://www.carulla.com/buscar?q={q}', query: 'cafe' },
  { name: 'olimpica', label: 'Olímpica', type: 'supermarket', baseUrl: 'https://www.olimpica.com', searchUrl: 'https://www.olimpica.com/buscar?q={q}', query: 'azucar' },
  { name: 'makro', label: 'Makro', type: 'supermarket', baseUrl: 'https://www.makro.com.co', searchUrl: 'https://www.makro.com.co/buscar?q={q}', query: 'detergente' },
  { name: 'farmatodo', label: 'Farmatodo', type: 'pharmacy', baseUrl: 'https://www.farmatodo.com.co', searchUrl: 'https://www.farmatodo.com.co/buscar?q={q}', query: 'acetaminofen' },
  { name: 'cruz-verde', label: 'Cruz Verde', type: 'pharmacy', baseUrl: 'https://www.cruzverde.com.co', searchUrl: 'https://www.cruzverde.com.co/buscar?q={q}', query: 'ibuprofeno' },
  { name: 'la-rebaja', label: 'La Rebaja', type: 'pharmacy', baseUrl: 'https://www.larebaja.com.co', searchUrl: 'https://www.larebaja.com.co/buscar?q={q}', query: 'vitamina' },
];

function assertEnv() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  }
}

async function rest(pathname, { method = 'GET', body, prefer } = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${pathname}`, {
    method,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: body == null ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(`${method} ${pathname}: ${data?.message || text}`);
  return data;
}

async function selectOne(table, filters) {
  const params = new URLSearchParams({ select: '*', limit: '1' });
  for (const [key, value] of Object.entries(filters)) params.set(key, value);
  const rows = await rest(`${table}?${params.toString()}`);
  return rows?.[0] || null;
}

async function upsert(table, row, onConflict) {
  const params = new URLSearchParams({ on_conflict: onConflict, select: '*' });
  const rows = await rest(`${table}?${params.toString()}`, {
    method: 'POST',
    body: row,
    prefer: 'resolution=merge-duplicates,return=representation',
  });
  return rows?.[0] || null;
}

async function insert(table, row) {
  const rows = await rest(`${table}?select=*`, { method: 'POST', body: row, prefer: 'return=representation' });
  return rows?.[0] || null;
}

async function patch(table, filters, row) {
  const params = new URLSearchParams({ select: '*' });
  for (const [key, value] of Object.entries(filters)) params.set(key, value);
  const rows = await rest(`${table}?${params.toString()}`, { method: 'PATCH', body: row, prefer: 'return=representation' });
  return rows?.[0] || null;
}

async function fetchHtml(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/json',
        'Accept-Language': 'es-CO,es;q=0.9,en;q=0.7',
      },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
    return response.text();
  } finally {
    clearTimeout(timer);
  }
}

function parseProducts(html, retailer, limit = 100) {
  const products = [];
  const seen = new Set();
  const add = (raw) => {
    const product = normalizeProduct(raw, retailer);
    if (!product.name || product.price <= 0) return;
    const key = product.ean || product.sku || `${product.name}-${product.price}-${product.url || ''}`;
    if (seen.has(key)) return;
    seen.add(key);
    products.push(product);
  };

  for (const json of extractJsonBlocks(html)) collectProducts(json, add);

  if (products.length < limit) {
    const $ = cheerio.load(html);
    $('[data-testid*="product"], [class*="product"], [class*="Product"], article, li').each((_, element) => {
      if (products.length >= limit) return false;
      const $el = $(element);
      const name = cleanText($el.find('[class*="name"], [class*="Name"], h2, h3, a[title]').first().text()) || $el.find('img[alt]').first().attr('alt') || $el.attr('title');
      const price = cleanText($el.find('[class*="price"], [class*="Price"], [data-price]').first().text()) || $el.attr('data-price');
      const image = absolutize($el.find('img').first().attr('src') || $el.find('img').first().attr('data-src'), retailer.baseUrl);
      const url = absolutize($el.find('a[href]').first().attr('href'), retailer.baseUrl);
      add({ name, price, image, url, sku: $el.attr('data-sku') || $el.attr('data-id') });
    });
  }

  return products.slice(0, limit);
}

function extractJsonBlocks(html) {
  const blocks = [];
  const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = jsonLdRegex.exec(html)) !== null) {
    try { blocks.push(JSON.parse(match[1].trim())); } catch { }
  }
  const nextDataMatch = html.match(/<script[^>]*id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);
  if (nextDataMatch) {
    try { blocks.push(JSON.parse(nextDataMatch[1].trim())); } catch { }
  }
  return blocks;
}

function collectProducts(node, add, depth = 0) {
  if (!node || depth > 12) return;
  if (Array.isArray(node)) {
    for (const item of node) collectProducts(item, add, depth + 1);
    return;
  }
  if (typeof node !== 'object') return;
  const looksLikeProduct = node['@type'] === 'Product' || (node.name && (node.offers || node.price || node.sku || node.gtin13 || node.image));
  if (looksLikeProduct) add(parseJsonProduct(node));
  for (const value of Object.values(node)) collectProducts(value, add, depth + 1);
}

function parseJsonProduct(json) {
  const offers = Array.isArray(json.offers) ? json.offers[0] : json.offers;
  return {
    name: json.name || json.title || json.description,
    price: offers?.price || offers?.lowPrice || json.price || json.priceRange?.sellingPrice?.highPrice,
    originalPrice: offers?.highPrice || json.listPrice,
    image: Array.isArray(json.image) ? json.image[0] : json.image || json.images?.[0]?.url,
    description: json.description,
    brand: typeof json.brand === 'string' ? json.brand : json.brand?.name,
    ean: json.gtin13 || json.gtin12 || json.gtin8 || json.gtin || json.ean,
    sku: json.sku || json.productId || json.id,
    category: json.category || json.categoryName,
    url: json.url || offers?.url,
    available: !String(offers?.availability || '').toLowerCase().includes('outofstock'),
  };
}

function normalizeProduct(raw, retailer) {
  const name = cleanText(raw.name);
  const ean = normalizeEAN(raw.ean);
  return {
    name,
    slug: toSlug(ean || name),
    shortName: name.slice(0, 150) || null,
    brand: cleanText(raw.brand).slice(0, 150) || null,
    ean,
    sku: String(raw.sku || ean || '').slice(0, 100) || null,
    price: normalizePrice(raw.price),
    originalPrice: raw.originalPrice ? normalizePrice(raw.originalPrice) : null,
    image: absolutize(Array.isArray(raw.image) ? raw.image[0] : raw.image, retailer.baseUrl),
    description: cleanText(raw.description).slice(0, 2000) || null,
    category: cleanText(raw.category || retailer.query).slice(0, 100) || null,
    unit: 'unidad',
    url: absolutize(raw.url, retailer.baseUrl),
    available: raw.available !== false,
  };
}

function normalizeEAN(ean) {
  const cleaned = String(ean || '').replace(/[^0-9]/g, '');
  return cleaned.length >= 8 && cleaned.length <= 14 ? cleaned : null;
}

function normalizePrice(value) {
  if (typeof value === 'number') return Math.round(value * 100) / 100;
  const cleaned = String(value || '').replace(/[^0-9.,]/g, '').replace(/\./g, '').replace(',', '.');
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : 0;
}

function cleanText(value) {
  return String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function absolutize(url, baseUrl) {
  if (!url) return null;
  try { return new URL(url, baseUrl).toString(); } catch { return url; }
}

function toSlug(text) {
  return String(text || `product-${Date.now()}`).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 300);
}

async function getOrCreateBrand(name) {
  if (!name) return null;
  const slug = toSlug(name).slice(0, 150);
  return (await upsert('brands', { name, slug }, 'slug'))?.id || null;
}

async function getOrCreateCategory(name) {
  if (!name) return null;
  const slug = toSlug(name).slice(0, 100);
  return (await upsert('categories', { name, slug, level: 0 }, 'slug'))?.id || null;
}

async function getOrCreateStore(retailer) {
  const category = retailer.type === 'pharmacy' ? 'Farmacia' : 'Supermercado';
  return upsert('stores', {
    name: retailer.label,
    slug: retailer.name,
    brand: retailer.label,
    chain: retailer.label,
    category,
    website: retailer.baseUrl,
    status: 'active',
  }, 'slug');
}

async function persistProduct(retailer, store, product) {
  const [brandId, categoryId] = await Promise.all([
    getOrCreateBrand(product.brand),
    getOrCreateCategory(product.category),
  ]);

  const existing = product.ean
    ? await selectOne('master_products', { ean: `eq.${product.ean}` })
    : await selectOne('master_products', { slug: `eq.${product.slug}` });

  const masterPayload = {
    name: product.name,
    slug: product.slug,
    short_name: product.shortName,
    commercial_name: product.name,
    brand_id: brandId,
    category_id: categoryId,
    barcode: product.ean,
    ean: product.ean,
    image: product.image,
    description: product.description,
    unit: product.unit,
    status: 'active',
    updated_at: new Date().toISOString(),
  };

  const comparableMaster = { ...masterPayload };
  delete comparableMaster.updated_at;
  const masterChanged = existing && Object.entries(comparableMaster).some(([key, value]) => {
    const current = existing[key] ?? null;
    const next = value ?? null;
    return current !== next;
  });
  const master = existing
    ? (masterChanged ? await patch('master_products', { id: `eq.${existing.id}` }, masterPayload) : existing)
    : await insert('master_products', masterPayload);

  if (product.image) {
    await upsert('product_images', { master_product_id: master.id, url: product.image, alt: product.name, is_primary: true }, 'master_product_id,url');
  }

  const storeProduct = await selectOne('store_products', {
    master_product_id: `eq.${master.id}`,
    store_id: `eq.${store.id}`,
    branch_id: 'is.null',
  });

  if (storeProduct) {
    const priceChanged = Number(storeProduct.price) !== product.price;
    const availabilityChanged = Boolean(storeProduct.available) !== Boolean(product.available);
    const originalPriceChanged = Number(storeProduct.original_price || 0) !== Number(product.originalPrice || 0);
    const listingChanged = priceChanged
      || availabilityChanged
      || originalPriceChanged
      || (storeProduct.sku ?? null) !== (product.sku ?? null)
      || (storeProduct.url ?? null) !== (product.url ?? null);
    if (listingChanged) {
      await patch('store_products', { id: `eq.${storeProduct.id}` }, {
        sku: product.sku,
        price: product.price,
        original_price: product.originalPrice,
        available: product.available,
        url: product.url,
        captured_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    if (priceChanged || availabilityChanged) {
      await insert('store_product_history', { store_product_id: storeProduct.id, price: product.price, available: product.available });
    }
    return {
      storeProductId: storeProduct.id,
      inserted: false,
      updated: listingChanged,
      priceChanged: priceChanged || availabilityChanged,
    };
  }

  const created = await insert('store_products', {
    master_product_id: master.id,
    store_id: store.id,
    sku: product.sku,
    price: product.price,
    original_price: product.originalPrice,
    available: product.available,
    url: product.url,
  });
  await insert('store_product_history', { store_product_id: created.id, price: product.price, available: product.available });
  return { storeProductId: created.id, inserted: true, updated: false, priceChanged: true };
}

async function markMissingUnavailable(store, seenIds) {
  if (seenIds.size === 0) return 0;
  const rows = await rest(`store_products?select=id,price&store_id=eq.${store.id}&available=eq.true`);
  let removed = 0;
  for (const row of rows || []) {
    if (seenIds.has(row.id)) continue;
    await patch('store_products', { id: `eq.${row.id}` }, { available: false, updated_at: new Date().toISOString() });
    await insert('store_product_history', { store_product_id: row.id, price: row.price, available: false });
    removed++;
  }
  return removed;
}

async function recordRun(retailer, stats, status = 'completed', errorMessage = null) {
  const started = stats.startedAt.toISOString();
  const finished = new Date().toISOString();
  await insert('scraping_jobs', {
    store: retailer.name,
    status,
    payload: { ...stats, startedAt: undefined, error: errorMessage },
    started_at: started,
    finished_at: finished,
  });
  await insert('scraping_runs', {
    store: retailer.name,
    status,
    products_found: stats.productsFound,
    products_updated: stats.productsUpdated,
    products_inserted: stats.productsInserted,
    products_removed: stats.productsRemoved,
    price_changes: stats.priceChanges,
    errors: stats.errors,
    error_message: errorMessage,
    duration_seconds: Math.round((Date.now() - stats.startedAt.getTime()) / 1000),
    started_at: started,
    finished_at: finished,
  });
}

async function runRetailer(retailer) {
  const stats = { startedAt: new Date(), productsFound: 0, productsUpdated: 0, productsInserted: 0, productsRemoved: 0, priceChanges: 0, errors: 0 };
  const seenIds = new Set();
  try {
    const url = retailer.searchUrl.replace('{q}', encodeURIComponent(retailer.query));
    console.log(`[${retailer.name}] descargando ${url}`);
    const html = await fetchHtml(url);
    const products = parseProducts(html, retailer, 100);
    stats.productsFound = products.length;
    const store = await getOrCreateStore(retailer);
    for (const product of products) {
      try {
        const result = await persistProduct(retailer, store, product);
        seenIds.add(result.storeProductId);
        if (result.inserted) stats.productsInserted++;
        if (result.updated) stats.productsUpdated++;
        if (result.priceChanged) stats.priceChanges++;
      } catch (error) {
        stats.errors++;
        console.error(`[${retailer.name}] error producto ${product.name}: ${error.message}`);
      }
    }
    // Search pages are partial samples, not full store catalogs. Only mark
    // missing products unavailable for retailers explicitly configured as a
    // full-catalog crawl, otherwise a blocked/short search would hide valid
    // products from the database.
    stats.productsRemoved = retailer.fullCatalog ? await markMissingUnavailable(store, seenIds) : 0;
    await recordRun(retailer, stats);
    console.log(`[${retailer.name}] ok`, stats);
    return stats;
  } catch (error) {
    stats.errors++;
    stats.failed = true;
    await recordRun(retailer, stats, 'failed', error.message).catch(recordError => console.error(`[${retailer.name}] no se pudo registrar error: ${recordError.message}`));
    console.error(`[${retailer.name}] falló: ${error.message}`);
    return stats;
  }
}

async function main() {
  assertEnv();
  const selected = process.argv.slice(2);
  const retailers = selected.length ? RETAILERS.filter(item => selected.includes(item.name)) : RETAILERS;
  if (retailers.length === 0) throw new Error(`Scraper desconocido: ${selected.join(', ')}`);

  const totals = { productsFound: 0, productsUpdated: 0, productsInserted: 0, productsRemoved: 0, priceChanges: 0, errors: 0 };
  let failedRetailers = 0;
  for (const retailer of retailers) {
    const stats = await runRetailer(retailer);
    for (const key of Object.keys(totals)) totals[key] += stats[key] || 0;
    if (stats.failed) failedRetailers++;
  }
  console.log('Resumen scrapers:', { ...totals, failedRetailers, successfulRetailers: retailers.length - failedRetailers });

  const strictFailures = process.env.SCRAPER_STRICT_FAILURES === 'true';
  if (failedRetailers === retailers.length || (strictFailures && totals.errors > 0)) {
    process.exitCode = 1;
  }
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
