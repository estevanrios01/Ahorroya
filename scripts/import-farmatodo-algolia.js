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
const TARGET_PRODUCTS = Number(process.env.FARMATODO_TARGET_PRODUCTS || process.argv[2] || 2000);
const HITS_PER_PAGE = Math.min(Number(process.env.FARMATODO_HITS_PER_PAGE || 100), 1000);
const SEARCH_TERMS = (process.env.FARMATODO_TERMS || process.argv[3] || '')
  .split(',')
  .map((term) => term.trim())
  .filter(Boolean);
const SKIP_PRODUCT_IMAGES = process.env.IMPORT_SKIP_PRODUCT_IMAGES === '1';
const SKIP_PRICE_HISTORY = process.env.IMPORT_SKIP_PRICE_HISTORY === '1';
const IMPORT_CITY_PRICES = process.env.FARMATODO_CITY_PRICES !== '0';

const ALGOLIA_APP_ID = 'VCOJEYD2PO';
const ALGOLIA_API_KEY = 'eb9544fe7bfe7ec4c1aa5e5bf7740feb';
const ALGOLIA_INDEX = 'products-colombia';
const ALGOLIA_URL = `https://${ALGOLIA_APP_ID.toLowerCase()}-dsn.algolia.net/1/indexes/${ALGOLIA_INDEX}/query`;

const CITY_BY_CODE = {
  ARM: ['Armenia', 'Quindio'],
  BAR: ['Barranquilla', 'Atlantico'],
  BOG: ['Bogota', 'Cundinamarca'],
  BUC: ['Bucaramanga', 'Santander'],
  CTG: ['Cartagena', 'Bolivar'],
  CUT: ['Cucuta', 'Norte de Santander'],
  DOS: ['Dosquebradas', 'Risaralda'],
  ENV: ['Envigado', 'Antioquia'],
  IBA: ['Ibague', 'Tolima'],
  MED: ['Medellin', 'Antioquia'],
  PER: ['Pereira', 'Risaralda'],
  SMR: ['Santa Marta', 'Magdalena'],
  SOA: ['Soacha', 'Cundinamarca'],
  SOL: ['Soledad', 'Atlantico'],
  TAG: ['Itagui', 'Antioquia'],
  VUP: ['Valledupar', 'Cesar'],
  VVC: ['Villavicencio', 'Meta'],
};

if (!SUPABASE_URL || !SERVICE_KEY) throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');

function slug(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 180);
}

function truncate(value, max) {
  if (value === null || value === undefined) return value;
  return String(value).slice(0, max);
}

function cryptoId(input) {
  const hex = crypto.createHash('sha1').update(`ahorroya-farmatodo:${input}`).digest('hex').slice(0, 32).split('');
  hex[12] = '5';
  hex[16] = ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  return `${hex.slice(0, 8).join('')}-${hex.slice(8, 12).join('')}-${hex.slice(12, 16).join('')}-${hex.slice(16, 20).join('')}-${hex.slice(20, 32).join('')}`;
}

function numberOrNull(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
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

async function fetchAlgoliaPage(query, page) {
  const response = await fetch(ALGOLIA_URL, {
    method: 'POST',
    headers: {
      'x-algolia-application-id': ALGOLIA_APP_ID,
      'x-algolia-api-key': ALGOLIA_API_KEY,
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 AhorroYaFarmatodoImporter/1.0',
    },
    body: JSON.stringify({
      query,
      hitsPerPage: HITS_PER_PAGE,
      page,
      attributesToRetrieve: [
        'id',
        'mediaDescription',
        'largeDescription',
        'marca',
        'categorie',
        'departments',
        'subCategory',
        'barcode',
        'barcodeList',
        'mediaImageUrl',
        'listUrlImages',
        'fullPrice',
        'offerPrice',
        'fullPriceByCity',
        'offerPriceByCity',
        'outofstore',
        'onlyOnline',
        'labelPum',
        'measurePum',
        'url',
      ],
    }),
    signal: AbortSignal.timeout(45000),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Farmatodo Algolia HTTP ${response.status}: ${text}`);
  return JSON.parse(text);
}

async function fetchSourceProducts() {
  const terms = SEARCH_TERMS.length ? SEARCH_TERMS : [''];
  const products = new Map();
  for (const term of terms) {
    for (let page = 0; products.size < TARGET_PRODUCTS; page++) {
      const data = await fetchAlgoliaPage(term, page);
      for (const hit of data.hits || []) {
        const normalized = normalizeProduct(hit);
        if (normalized) products.set(normalized.slug, normalized);
      }
      console.log(`farmatodo/${term || 'catalogo'} source: ${products.size}/${TARGET_PRODUCTS} page=${page + 1}/${data.nbPages}`);
      if (!data.hits?.length || page + 1 >= data.nbPages) break;
      await new Promise((resolve) => setTimeout(resolve, 120));
    }
  }
  return [...products.values()].slice(0, TARGET_PRODUCTS);
}

function normalizeProduct(hit) {
  const id = String(hit.id || hit.objectID || '').trim();
  const name = String(hit.mediaDescription || '').trim().replace(/\s+/g, ' ');
  const price = numberOrNull(hit.offerPrice) || numberOrNull(hit.fullPrice);
  const originalPrice = numberOrNull(hit.fullPrice);
  const image = hit.mediaImageUrl || hit.listUrlImages?.[0] || null;
  if (!id || !name || !price || !image) return null;
  const barcode = String(hit.barcode || hit.barcodeList?.find((item) => String(item).length >= 8) || '').replace(/\D/g, '').slice(0, 14) || null;
  const category = hit.categorie || hit.departments?.[0] || hit.subCategory || 'Farmacia';
  return {
    sourceProductId: id,
    name,
    slug: slug(`${name}-${id}`),
    brand: hit.marca || 'Farmatodo',
    category,
    barcode,
    sku: id,
    image,
    description: hit.largeDescription || null,
    unit: hit.labelPum || 'unidad',
    price,
    originalPrice: originalPrice && originalPrice > price ? originalPrice : null,
    available: hit.outofstore !== true && price > 0,
    stock: null,
    url: hit.url || `https://www.farmatodo.com.co/buscar?product=${encodeURIComponent(name)}`,
    fullPriceByCity: Array.isArray(hit.fullPriceByCity) ? hit.fullPriceByCity : [],
    offerPriceByCity: Array.isArray(hit.offerPriceByCity) ? hit.offerPriceByCity : [],
  };
}

async function getStore() {
  const rows = await rest('stores?slug=eq.farmatodo&select=*');
  if (rows?.[0]) return rows[0];
  return (await upsertBatch('stores', [{
    name: 'Farmatodo',
    slug: 'farmatodo',
    brand: 'Farmatodo',
    chain: 'Farmatodo',
    category: 'Farmacia',
    website: 'https://www.farmatodo.com.co',
    status: 'active',
  }], 'slug'))[0];
}

function cityPriceMap(product) {
  const offers = new Map((product.offerPriceByCity || [])
    .map((row) => [row.cityCode, numberOrNull(row.offerPrice)])
    .filter(([, price]) => price));
  return (product.fullPriceByCity || [])
    .map((row) => {
      const city = CITY_BY_CODE[row.cityCode];
      if (!city) return null;
      const fullPrice = numberOrNull(row.fullPrice);
      const offerPrice = offers.get(row.cityCode);
      const price = offerPrice || fullPrice;
      if (!price) return null;
      return {
        code: row.cityCode,
        city: city[0],
        department: city[1],
        price,
        originalPrice: offerPrice && fullPrice && fullPrice > offerPrice ? fullPrice : null,
      };
    })
    .filter(Boolean);
}

async function main() {
  const store = await getStore();
  const normalized = await fetchSourceProducts();

  const brands = await upsertBatch('brands', [...new Map(normalized.map((product) => [slug(product.brand), {
    name: product.brand,
    slug: slug(product.brand),
    country: 'Colombia',
  }])).values()], 'slug');

  const categories = await upsertBatch('categories', [...new Map(normalized.map((product) => [slug(product.category), {
    name: product.category,
    slug: slug(product.category),
    level: 1,
  }])).values()], 'slug');

  const brandIds = Object.fromEntries(brands.map((brand) => [brand.slug, brand.id]));
  const categoryIds = Object.fromEntries(categories.map((category) => [category.slug, category.id]));

  const masters = await upsertBatch('master_products', normalized.map((product) => ({
    name: product.name,
    slug: product.slug,
    short_name: product.name.slice(0, 150),
    commercial_name: product.name,
    brand_id: brandIds[slug(product.brand)] || null,
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

  const branchRows = [];
  if (IMPORT_CITY_PRICES) {
    for (const [code, [city, department]] of Object.entries(CITY_BY_CODE)) {
      branchRows.push({
        id: cryptoId(`branch:${store.id}:${code}`),
        store_id: store.id,
        name: `Farmatodo ${city} Online`,
        code: `FARMATODO-${code}`,
        address: null,
        city,
        department,
        country: 'Colombia',
        phone: null,
        schedule: { raw: ['Precio online por ciudad'] },
        services: { online: true },
        has_parking: false,
        has_accessibility: false,
        status: 'active',
        updated_at: new Date().toISOString(),
      });
    }
  }
  const branches = branchRows.length ? await upsertBatch('branches', branchRows, 'id') : [];
  const branchByCode = new Map(branches.map((branch) => [branch.code.replace('FARMATODO-', ''), branch]));

  const now = new Date().toISOString();
  const listings = [];
  for (const product of normalized) {
    const master = masterBySlug[product.slug];
    if (!master) continue;
    listings.push({
      id: cryptoId(`listing:${store.id}:online:${product.sourceProductId}`),
      master_product_id: master.id,
      store_id: store.id,
      branch_id: null,
      sku: product.sku,
      price: product.price,
      original_price: product.originalPrice,
      available: product.available,
      stock: product.stock,
      url: truncate(product.url, 500),
      captured_at: now,
      updated_at: now,
    });
    if (IMPORT_CITY_PRICES) {
      for (const cityPrice of cityPriceMap(product)) {
        const branch = branchByCode.get(cityPrice.code);
        if (!branch) continue;
        listings.push({
          id: cryptoId(`listing:${store.id}:${branch.id}:${product.sourceProductId}`),
          master_product_id: master.id,
          store_id: store.id,
          branch_id: branch.id,
          sku: product.sku,
          price: cityPrice.price,
          original_price: cityPrice.originalPrice,
          available: product.available,
          stock: product.stock,
          url: truncate(product.url, 500),
          captured_at: now,
          updated_at: now,
        });
      }
    }
  }

  const uniqueListings = [...listings.reduce((accumulator, listing) => {
    const current = accumulator.get(listing.id);
    if (!current || Number(listing.price) < Number(current.price)) accumulator.set(listing.id, listing);
    return accumulator;
  }, new Map()).values()];

  const existingListings = await fetchExistingListings(uniqueListings.map((row) => row.id));
  const changedListings = uniqueListings.filter((row) => listingChanged(existingListings.get(row.id), row));
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

  console.log('Importacion Farmatodo finalizada:', {
    source: normalized.length,
    branches: branches.length,
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
