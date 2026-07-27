const { loadEnv, rest, upsertBatch, insertBatch, slug, makeCryptoId, numericEqual, logPriceAnomalies } = require('./lib/supabase-rest');

loadEnv();

const cryptoId = makeCryptoId('ahorroya-farmatodo');
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
// Scope which of the cities Farmatodo's own price-by-city data already
// covers get imported, e.g. for a city-by-city rollout. Values must match
// CITY_BY_CODE's real codes below -- this only filters existing real data,
// it does not invent city codes Farmatodo doesn't actually expose.
const CITY_CODES = (process.env.FARMATODO_CITY_CODES || '')
  .split(',')
  .map((value) => value.trim().toUpperCase())
  .filter(Boolean);

const ALGOLIA_APP_ID = 'VCOJEYD2PO';
const ALGOLIA_API_KEY = 'eb9544fe7bfe7ec4c1aa5e5bf7740feb';
const ALGOLIA_INDEX = 'products-colombia';
const ALGOLIA_URL = `https://${ALGOLIA_APP_ID.toLowerCase()}-dsn.algolia.net/1/indexes/${ALGOLIA_INDEX}/query`;

// Names must match exactly what the frontend's city filter sends (Hero.jsx
// / /buscar's city dropdown, search_products_by_city's ilike match) --
// these were stored unaccented, which silently made every Bogotá/Medellín
// branch (and Ibagué/Cúcuta/Montería) unmatchable by that filter even
// though the rows existed and this importer runs every cycle. Note: there
// is no Cali code here because Farmatodo's own city-price API (this map is
// reverse-engineered from its real cityCode values) doesn't expose one --
// not something to invent a code for.
const CITY_BY_CODE = {
  ARM: ['Armenia', 'Quindio'],
  BAR: ['Barranquilla', 'Atlantico'],
  // Bogotá D.C. is its own Distrito Capital, not part of Cundinamarca
  // department (Cundinamarca's own capital happens to also be Bogotá).
  BOG: ['Bogotá', 'Bogotá D.C.'],
  BUC: ['Bucaramanga', 'Santander'],
  CTG: ['Cartagena', 'Bolivar'],
  CUT: ['Cúcuta', 'Norte de Santander'],
  DOS: ['Dosquebradas', 'Risaralda'],
  ENV: ['Envigado', 'Antioquia'],
  IBA: ['Ibagué', 'Tolima'],
  MED: ['Medellín', 'Antioquia'],
  PER: ['Pereira', 'Risaralda'],
  SMR: ['Santa Marta', 'Magdalena'],
  SOA: ['Soacha', 'Cundinamarca'],
  SOL: ['Soledad', 'Atlantico'],
  TAG: ['Itagui', 'Antioquia'],
  VUP: ['Valledupar', 'Cesar'],
  VVC: ['Villavicencio', 'Meta'],
};

if (!SUPABASE_URL || !SERVICE_KEY) throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');

function truncate(value, max) {
  if (value === null || value === undefined) return value;
  return String(value).slice(0, max);
}

function numberOrNull(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
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
  // Farmatodo's own mediaDescription field occasionally leaks leading
  // separator noise (seen live: "//Pasabocas Tosh...") -- a stray
  // slash/pipe prefix is never legitimately part of a product name, unlike
  // digits or punctuation that could be, so only that narrow pattern is
  // stripped rather than guessing at broader "junk" characters.
  const name = String(hit.mediaDescription || '').trim().replace(/\s+/g, ' ').replace(/^[/\\|]+\s*/, '');
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
    const cityCodeEntries = CITY_CODES.length
      ? Object.entries(CITY_BY_CODE).filter(([code]) => CITY_CODES.includes(code))
      : Object.entries(CITY_BY_CODE);
    for (const [code, [city, department]] of cityCodeEntries) {
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
  logPriceAnomalies(changedListings, existingListings, 'farmatodo');
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
