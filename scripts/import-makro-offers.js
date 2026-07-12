const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#') || !line.includes('=')) continue;
    const index = line.indexOf('=');
    process.env[line.slice(0, index).trim()] ||= line.slice(index + 1).trim();
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BATCH_SIZE = Number(process.env.IMPORT_BATCH_SIZE || 50);
const MAX_LIST_SIZE = Number(process.env.MAKRO_MAX_LIST_SIZE || 200);
const STORE_IDS = (process.env.MAKRO_STORE_IDS || '')
  .split(',')
  .map((value) => Number(value.trim()))
  .filter(Boolean);
const SKIP_PRODUCT_IMAGES = process.env.IMPORT_SKIP_PRODUCT_IMAGES === '1';
const SKIP_PRICE_HISTORY = process.env.IMPORT_SKIP_PRICE_HISTORY === '1';

const MAKRO_OFFERS_URL = 'https://makro.com.co/totem/api/?controller=product&action=getOffersByStore';
const MAKRO_STORES_URL = 'https://as-mco-co-cap-api-prd.azurewebsites.net/catalog/stores/allstores';

const DEPARTMENTS_BY_CITY = {
  Bogota: 'Cundinamarca',
  Cali: 'Valle del Cauca',
  Medellin: 'Antioquia',
  Barranquilla: 'Atlantico',
  Pereira: 'Risaralda',
  Ibague: 'Tolima',
  Cartagena: 'Bolivar',
  Cucuta: 'Norte de Santander',
  Bucaramanga: 'Santander',
  Villavicencio: 'Meta',
  Monteria: 'Cordoba',
  Armenia: 'Quindio',
  Neiva: 'Huila',
  Valledupar: 'Cesar',
};

if (!SUPABASE_URL || !SERVICE_KEY) {
  throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
}

function slug(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 180);
}

function cryptoId(input) {
  const hex = crypto.createHash('sha1').update(`ahorroya-makro:${input}`).digest('hex').slice(0, 32).split('');
  hex[12] = '5';
  hex[16] = ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  return `${hex.slice(0, 8).join('')}-${hex.slice(8, 12).join('')}-${hex.slice(12, 16).join('')}-${hex.slice(16, 20).join('')}-${hex.slice(20, 32).join('')}`;
}

function parsePrice(value) {
  if (value == null) return 0;
  const normalized = String(value)
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^0-9.]/g, '');
  const price = Number(normalized);
  return Number.isFinite(price) ? price : 0;
}

function normalizeCity(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeDepartment(city) {
  if (!city) return null;
  return DEPARTMENTS_BY_CITY[city] || null;
}

async function rest(pathname, { method = 'GET', body, prefer = '', returnMinimal = false } = {}) {
  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
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
      if (!response.ok) throw new Error(`${method} ${pathname}: ${text}`);
      return returnMinimal || !text ? null : JSON.parse(text);
    } catch (error) {
      lastError = error;
      const retryable = /statement timeout|ECONNRESET|terminated|fetch failed/i.test(String(error.message || error));
      if (!retryable || attempt === 3) break;
      await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
    }
  }
  throw lastError;
}

async function upsertBatch(table, rows, onConflict, { returning = true } = {}) {
  const out = [];
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    if (!batch.length) continue;
    const result = await rest(`${table}?on_conflict=${encodeURIComponent(onConflict)}&select=*`, {
      method: 'POST',
      body: batch,
      prefer: `resolution=merge-duplicates,return=${returning ? 'representation' : 'minimal'}`,
      returnMinimal: !returning,
    });
    if (Array.isArray(result)) out.push(...result);
    console.log(`${table}: ${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length}`);
  }
  return out;
}

async function insertBatch(table, rows) {
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    if (!batch.length) continue;
    await rest(table, { method: 'POST', body: batch, prefer: 'return=minimal', returnMinimal: true });
    console.log(`${table}: ${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length}`);
  }
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

function numericEqual(left, right) {
  const a = left == null ? null : Number(left);
  const b = right == null ? null : Number(right);
  if (a == null && b == null) return true;
  return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) < 0.01;
}

function listingChanged(previous, next) {
  if (!previous) return true;
  return !numericEqual(previous.price, next.price)
    || !numericEqual(previous.original_price, next.original_price)
    || Boolean(previous.available) !== Boolean(next.available);
}

async function fetchMakroStores() {
  const response = await fetch(MAKRO_STORES_URL, {
    headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0 AhorroYaMakroImporter/1.0' },
    signal: AbortSignal.timeout(30000),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Makro stores HTTP ${response.status}: ${text}`);
  const data = JSON.parse(text);
  if (!data.success || !Array.isArray(data.data)) throw new Error(`Respuesta inesperada de sedes Makro: ${text.slice(0, 400)}`);
  return data.data;
}

async function fetchMakroOffers(idStore) {
  const response = await fetch(MAKRO_OFFERS_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 AhorroYaMakroImporter/1.0',
    },
    body: JSON.stringify({ idCountry: 'CO', idStore, maxListSize: MAX_LIST_SIZE }),
    signal: AbortSignal.timeout(45000),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Makro offers ${idStore} HTTP ${response.status}: ${text}`);
  const data = JSON.parse(text);
  if (!Array.isArray(data.offers)) throw new Error(`Respuesta inesperada de ofertas Makro ${idStore}: ${text.slice(0, 400)}`);
  return data.offers;
}

function normalizeOffer(offer) {
  const sku = String(offer.sku || '').replace(/\D/g, '') || String(offer.sku || '').trim();
  const name = String(offer.name || '').trim().replace(/\s+/g, ' ');
  const description = String(offer.description || '').trim();
  const price = parsePrice(offer.offerPrice);
  const originalPrice = parsePrice(offer.originalPrice);
  if (!sku || !name || price <= 0) return null;
  return {
    sourceProductId: sku,
    name,
    slug: slug(`${name}-${sku}`),
    brand: 'Makro',
    category: 'Ofertas Makro',
    sku,
    image: offer.urlImage || null,
    description: description || null,
    unit: offer.unitPrefix || 'unidad',
    price,
    originalPrice: originalPrice > price ? originalPrice : null,
    available: true,
    stock: null,
    url: offer.urlEndPoint || `https://www.makro.com.co/ofertas#${sku}`,
  };
}

async function getStore() {
  const config = {
    name: 'Makro',
    slug: 'makro',
    chain: 'Makro',
    category: 'Supermercado',
    website: 'https://www.makro.com.co',
  };
  const rows = await rest(`stores?slug=eq.${config.slug}&select=*`);
  if (rows?.[0]) return rows[0];
  return (await upsertBatch('stores', [{
    name: config.name,
    slug: config.slug,
    brand: config.name,
    chain: config.chain,
    category: config.category,
    website: config.website,
    status: 'active',
  }], 'slug'))[0];
}

function buildBranchRow(store, branch) {
  const city = normalizeCity(branch.province);
  return {
    id: cryptoId(`branch:${store.id}:${branch.storeNo}`),
    store_id: store.id,
    name: `Makro ${branch.name}`,
    code: `MAKRO-${branch.storeNo}`,
    address: branch.address || null,
    city,
    department: normalizeDepartment(city),
    country: 'Colombia',
    latitude: branch.latitude ? Number(branch.latitude) : null,
    longitude: branch.longitude ? Number(branch.longitude) : null,
    phone: branch.phone || null,
    schedule: branch.hours ? { raw: branch.hours.split(';').filter(Boolean) } : null,
    services: {
      gas: Boolean(branch.hasGas),
      restaurante: Boolean(branch.hasResto),
      wifi: Boolean(branch.hasWifi),
      siga: Boolean(branch.hasSiga),
    },
    has_parking: true,
    has_accessibility: true,
    status: 'active',
    updated_at: new Date().toISOString(),
  };
}

async function main() {
  const store = await getStore();
  const allStores = await fetchMakroStores();
  const selectedStores = STORE_IDS.length
    ? allStores.filter((branch) => STORE_IDS.includes(Number(branch.storeNo)))
    : allStores;

  const branchRows = selectedStores.map((branch) => buildBranchRow(store, branch));
  const branches = await upsertBatch('branches', branchRows, 'id');
  const branchByCode = new Map(branches.map((branch) => [branch.code, branch]));

  const rawByBranch = [];
  for (const branch of selectedStores) {
    const offers = await fetchMakroOffers(branch.storeNo);
    console.log(`makro/${branch.storeNo} source: ${offers.length}`);
    rawByBranch.push({ branch, offers });
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  const normalizedByKey = new Map();
  for (const { offers } of rawByBranch) {
    for (const offer of offers) {
      const normalized = normalizeOffer(offer);
      if (normalized?.image) normalizedByKey.set(normalized.slug, normalized);
    }
  }
  const normalized = [...normalizedByKey.values()];

  const brands = await upsertBatch('brands', [{
    name: 'Makro',
    slug: 'makro',
    country: 'Colombia',
  }], 'slug');
  const categories = await upsertBatch('categories', [{
    name: 'Ofertas Makro',
    slug: 'ofertas-makro',
    level: 1,
  }], 'slug');

  const brandId = brands[0]?.id || null;
  const categoryId = categories[0]?.id || null;

  const masters = await upsertBatch('master_products', normalized.map((product) => ({
    name: product.name,
    slug: product.slug,
    short_name: product.name.slice(0, 150),
    commercial_name: product.name,
    brand_id: brandId,
    category_id: categoryId,
    barcode: null,
    ean: null,
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
      url: product.image,
      thumbnail_url: product.image,
      alt: product.name,
      is_primary: true,
    })).filter((row) => row.master_product_id), 'master_product_id,url', { returning: false });
  }

  const now = new Date().toISOString();
  const listings = [];
  for (const { branch, offers } of rawByBranch) {
    const branchRow = branchByCode.get(`MAKRO-${branch.storeNo}`);
    for (const offer of offers) {
      const product = normalizeOffer(offer);
      if (!product?.image) continue;
      const master = masterBySlug[product.slug];
      if (!master || !branchRow) continue;
      listings.push({
        id: cryptoId(`listing:${store.id}:${branchRow.id}:${product.sku}`),
        master_product_id: master.id,
        store_id: store.id,
        branch_id: branchRow.id,
        sku: product.sku,
        price: product.price,
        original_price: product.originalPrice,
        available: product.available,
        stock: product.stock,
        url: product.url,
        captured_at: now,
        updated_at: now,
      });
    }
  }
  const uniqueListings = [...listings.reduce((accumulator, listing) => {
    const current = accumulator.get(listing.id);
    if (!current || Number(listing.price) < Number(current.price)) {
      accumulator.set(listing.id, listing);
    }
    return accumulator;
  }, new Map()).values()];

  const existingListings = SKIP_PRICE_HISTORY ? new Map() : await fetchExistingListings(uniqueListings.map((row) => row.id));
  const historyRows = uniqueListings
    .filter((row) => listingChanged(existingListings.get(row.id), row))
    .map((row) => ({
      store_product_id: row.id,
      price: row.price,
      available: row.available,
      captured_at: row.captured_at,
    }));

  await upsertBatch('store_products', uniqueListings, 'id', { returning: false });
  if (!SKIP_PRICE_HISTORY) {
    await insertBatch('store_product_history', historyRows);
  }

  console.log('Importacion Makro finalizada:', {
    branches: branches.length,
    sourceOffers: rawByBranch.reduce((sum, item) => sum + item.offers.length, 0),
    normalized: normalized.length,
    listings: uniqueListings.length,
    priceEvents: SKIP_PRICE_HISTORY ? 'skipped' : historyRows.length,
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
