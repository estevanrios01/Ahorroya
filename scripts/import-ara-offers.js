const crypto = require('crypto');
const cheerio = require('cheerio');
const { loadEnv, rest, upsertBatch, insertBatch, slug, makeCryptoId, numericEqual, logPriceAnomalies } = require('./lib/supabase-rest');

loadEnv();

const cryptoId = makeCryptoId('ahorroya-ara');
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BATCH_SIZE = Number(process.env.IMPORT_BATCH_SIZE || 50);
const MAX_PAGES = Number(process.env.ARA_MAX_PAGES || process.argv[2] || 12);
const SKIP_PRODUCT_IMAGES = process.env.IMPORT_SKIP_PRODUCT_IMAGES === '1';
const SKIP_PRICE_HISTORY = process.env.IMPORT_SKIP_PRICE_HISTORY === '1';
const SOURCE_URLS = (process.env.ARA_SOURCE_URLS || '')
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean);

if (!SUPABASE_URL || !SERVICE_KEY) throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');

function truncate(value, max) {
  if (value === null || value === undefined) return value;
  return String(value).slice(0, max);
}

function parsePrice(value) {
  const normalized = String(value || '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^0-9.]/g, '');
  const price = Number(normalized);
  return Number.isFinite(price) && price > 0 ? price : null;
}

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function toTitle(value) {
  return cleanText(value)
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

async function fetchExistingListings(ids) {
  const rows = [];
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE);
    if (!batch.length) continue;
    const result = await rest(`store_products?id=in.(${batch.join(',')})&select=id,price,original_price,available`);
    if (Array.isArray(result)) rows.push(...result);
  }
  return new Map(rows.map((row) => [row.id, row]));
}

function listingChanged(previous, next) {
  if (!previous) return true;
  return !numericEqual(previous.price, next.price)
    || !numericEqual(previous.original_price, next.original_price)
    || Boolean(previous.available) !== Boolean(next.available);
}

function defaultUrls() {
  return Array.from({ length: MAX_PAGES }, (_, index) => `https://aratiendas.com/merca-todo/norte-2/${index + 1}/`);
}

async function fetchPage(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'text/html,application/xhtml+xml',
      'User-Agent': 'Mozilla/5.0 AhorroYaAraImporter/1.0',
    },
    signal: AbortSignal.timeout(45000),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Ara HTTP ${response.status} ${url}: ${text.slice(0, 300)}`);
  return text;
}

function categoryFromClasses(classes) {
  const match = String(classes || '').match(/categorias_rebajon-([a-z0-9-]+)/i);
  if (!match) return 'Ofertas Ara';
  return toTitle(match[1].replace(/-/g, ' '));
}

function extractBarcode(image, text) {
  const source = `${image || ''} ${text || ''}`;
  const match = source.match(/\b(7\d{12}|8\d{12}|9\d{12})\b/);
  return match ? match[1] : null;
}

function normalizeProduct(box, $, url) {
  const name = cleanText(box.find('.producto-col .elementor-heading-title').first().text());
  const priceTexts = box.find('.precio .elementor-heading-title')
    .map((_, el) => cleanText($(el).text()))
    .get()
    .filter(Boolean);
  const price = parsePrice(priceTexts[0]);
  const originalPrice = parsePrice(priceTexts[1]);
  const image = box.find('img').first().attr('src') || box.find('img').first().attr('data-src') || null;
  if (!name || !price || !image) return null;
  const text = cleanText(box.text());
  const barcode = extractBarcode(image, text);
  const category = categoryFromClasses(box.closest('.merca_todo_ara').attr('class'));
  const sourceProductId = barcode || crypto.createHash('sha1').update(`${name}:${image}`).digest('hex').slice(0, 16);
  return {
    sourceProductId,
    name,
    slug: slug(`${name}-${sourceProductId}`),
    brand: 'Ara',
    category,
    barcode,
    sku: sourceProductId,
    image,
    description: `Oferta publicada por Tiendas Ara. ${text}`.slice(0, 500),
    unit: 'unidad',
    price,
    originalPrice: originalPrice && originalPrice > price ? originalPrice : null,
    available: true,
    stock: null,
    url,
  };
}

async function fetchSourceProducts() {
  const urls = SOURCE_URLS.length ? SOURCE_URLS : defaultUrls();
  const products = new Map();
  for (const url of urls) {
    const html = await fetchPage(url);
    const $ = cheerio.load(html);
    $('.mta-box').each((_, element) => {
      const product = normalizeProduct($(element), $, url);
      if (product) products.set(product.slug, product);
    });
    console.log(`ara source: ${products.size} productos tras ${url}`);
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return [...products.values()];
}

async function getStore() {
  const rows = await rest('stores?slug=eq.ara&select=*');
  if (rows?.[0]) return rows[0];
  return (await upsertBatch('stores', [{
    name: 'Ara',
    slug: 'ara',
    brand: 'Tiendas Ara',
    chain: 'Jeronimo Martins',
    category: 'Supermercado',
    website: 'https://aratiendas.com',
    status: 'active',
  }], 'slug'))[0];
}

async function main() {
  const store = await getStore();
  const normalized = await fetchSourceProducts();
  if (!normalized.length) throw new Error('Ara no entrego productos parseables');

  const brands = await upsertBatch('brands', [{
    name: 'Ara',
    slug: 'ara',
    country: 'Colombia',
  }], 'slug');

  const categories = await upsertBatch('categories', [...new Map(normalized.map((product) => [slug(product.category), {
    name: product.category,
    slug: slug(product.category),
    level: 1,
  }])).values()], 'slug');

  const brandId = brands[0]?.id || null;
  const categoryIds = Object.fromEntries(categories.map((category) => [category.slug, category.id]));

  const masters = await upsertBatch('master_products', normalized.map((product) => ({
    name: product.name,
    slug: product.slug,
    short_name: product.name.slice(0, 150),
    commercial_name: product.name,
    brand_id: brandId,
    category_id: categoryIds[slug(product.category)] || null,
    barcode: product.barcode,
    ean: product.barcode,
    image: product.image,
    description: product.description,
    unit: product.unit,
    status: 'active',
    updated_at: new Date().toISOString(),
  })), 'slug');

  const masterBySlug = Object.fromEntries(masters.map((product) => [product.slug, product]));

  if (!SKIP_PRODUCT_IMAGES) {
    await upsertBatch('product_images', normalized.map((product) => ({
      master_product_id: masterBySlug[product.slug]?.id,
      url: truncate(product.image, 500),
      thumbnail_url: truncate(product.image, 500),
      alt: truncate(product.name, 200),
      is_primary: true,
    })).filter((row) => row.master_product_id), 'master_product_id,url', { returning: false });
  }

  const branch = (await upsertBatch('branches', [{
    id: cryptoId(`branch:${store.id}:ofertas-nacionales`),
    store_id: store.id,
    name: 'Ara Ofertas Nacionales',
    code: 'ARA-OFERTAS-NACIONALES',
    address: null,
    city: null,
    department: null,
    country: 'Colombia',
    phone: null,
    schedule: { raw: ['Ofertas publicadas en aratiendas.com'] },
    services: { online: false, promotional: true },
    has_parking: false,
    has_accessibility: false,
    status: 'active',
    updated_at: new Date().toISOString(),
  }], 'id'))[0];

  const now = new Date().toISOString();
  const listings = normalized
    .map((product) => {
      const master = masterBySlug[product.slug];
      if (!master) return null;
      return {
        id: cryptoId(`listing:${store.id}:${branch.id}:${product.sourceProductId}`),
        master_product_id: master.id,
        store_id: store.id,
        branch_id: branch.id,
        sku: product.sku,
        price: product.price,
        original_price: product.originalPrice,
        available: product.available,
        stock: product.stock,
        url: truncate(product.url, 500),
        captured_at: now,
        updated_at: now,
      };
    })
    .filter(Boolean);

  const uniqueListings = [...listings.reduce((accumulator, listing) => {
    const current = accumulator.get(listing.id);
    if (!current || Number(listing.price) < Number(current.price)) accumulator.set(listing.id, listing);
    return accumulator;
  }, new Map()).values()];

  const existingListings = await fetchExistingListings(uniqueListings.map((row) => row.id));
  const changedListings = uniqueListings.filter((row) => listingChanged(existingListings.get(row.id), row));
  logPriceAnomalies(changedListings, existingListings, 'ara');
  const historyRows = SKIP_PRICE_HISTORY ? [] : changedListings
    .filter((row) => listingChanged(existingListings.get(row.id), row))
    .map((row) => ({
      store_product_id: row.id,
      price: row.price,
      available: row.available,
      captured_at: row.captured_at,
    }));

  await upsertBatch('store_products', changedListings, 'id', { returning: false });
  if (!SKIP_PRICE_HISTORY) await insertBatch('store_product_history', historyRows);

  console.log('Importacion Ara finalizada:', {
    source: normalized.length,
    listings: uniqueListings.length,
    writtenListings: changedListings.length,
    skippedUnchanged: uniqueListings.length - changedListings.length,
    priceEvents: SKIP_PRICE_HISTORY ? 'skipped' : historyRows.length,
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
