const { Agent } = require('undici');
const { loadEnv, rest, upsertBatch, insertBatch, slug, fixMojibake, makeCryptoId, numericEqual, logPriceAnomalies } = require('./lib/supabase-rest');
const { extractPresentation } = require('./lib/normalize');

loadEnv();

const cryptoId = makeCryptoId('ahorroya-vtex');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const STORE_SLUG = process.env.VTEX_STORE || process.argv[2] || 'exito';
const TARGET_PRODUCTS = Number(process.env.VTEX_TARGET_PRODUCTS || process.argv[3] || 2000);
const START_FROM = Number(process.env.VTEX_START_FROM || process.argv[4] || 0);
const SEARCH_TERM = process.env.VTEX_SEARCH || process.argv[5] || '';
const CATEGORY_PATH = process.env.VTEX_CATEGORY_PATH || process.argv[6] || '';
const PAGE_SIZE = Number(process.env.VTEX_PAGE_SIZE || 50);
const BATCH_SIZE = Number(process.env.IMPORT_BATCH_SIZE || 50);
const SKIP_PRODUCT_IMAGES = process.env.IMPORT_SKIP_PRODUCT_IMAGES === '1';
const SKIP_PRICE_HISTORY = process.env.IMPORT_SKIP_PRICE_HISTORY === '1';
const ALLOW_INSECURE_TLS = process.env.VTEX_ALLOW_INSECURE_TLS === '1';
const insecureDispatcher = ALLOW_INSECURE_TLS ? new Agent({ connect: { rejectUnauthorized: false } }) : undefined;

const STORES = {
  exito: {
    name: 'Exito',
    slug: 'exito',
    chain: 'Grupo Exito',
    category: 'Supermercado',
    website: 'https://www.exito.com',
    endpoint: 'https://exitocol.vtexcommercestable.com.br/api/catalog_system/pub/products/search',
  },
  carulla: {
    name: 'Carulla',
    slug: 'carulla',
    chain: 'Grupo Exito',
    category: 'Supermercado',
    website: 'https://www.carulla.com',
    endpoint: 'https://www.carulla.com/api/catalog_system/pub/products/search',
  },
  olimpica: {
    name: 'Olimpica',
    slug: 'olimpica',
    chain: 'Olimpica',
    category: 'Supermercado',
    website: 'https://www.olimpica.com',
    endpoint: 'https://olimpica.vtexcommercestable.com.br/api/catalog_system/pub/products/search',
  },
  jumbo: {
    name: 'Jumbo',
    slug: 'jumbo',
    chain: 'Cencosud',
    category: 'Supermercado',
    website: 'https://www.tiendasjumbo.co',
    endpoint: 'https://jumbocolombiaio.vtexcommercestable.com.br/api/catalog_system/pub/products/search',
  },
  metro: {
    name: 'Metro',
    slug: 'metro',
    chain: 'Cencosud',
    category: 'Supermercado',
    website: 'https://www.tiendasmetro.co',
    endpoint: 'https://metrocolombiaio.vtexcommercestable.com.br/api/catalog_system/pub/products/search',
  },
  larebaja: {
    name: 'La Rebaja',
    slug: 'larebaja',
    chain: 'La Rebaja',
    category: 'Farmacia',
    website: 'https://www.larebajavirtual.com',
    endpoint: 'https://www.larebajavirtual.com/api/catalog_system/pub/products/search',
  },
  colsubsidio: {
    name: 'Droguerias Colsubsidio',
    slug: 'colsubsidio',
    chain: 'Colsubsidio',
    category: 'Farmacia',
    website: 'https://www.drogueriascolsubsidio.com',
    endpoint: 'https://www.drogueriascolsubsidio.com/api/catalog_system/pub/products/search',
  },
  locatel: {
    name: 'Locatel',
    slug: 'locatel',
    chain: 'Locatel',
    category: 'Farmacia',
    website: 'https://www.locatelcolombia.com',
    endpoint: 'https://www.locatelcolombia.com/api/catalog_system/pub/products/search',
  },
  medipiel: {
    name: 'Medipiel',
    slug: 'medipiel',
    chain: 'Medipiel',
    category: 'Farmacia',
    website: 'https://www.medipiel.com.co',
    endpoint: 'https://www.medipiel.com.co/api/catalog_system/pub/products/search',
  },
  mercaldas: {
    name: 'Mercaldas',
    slug: 'mercaldas',
    chain: 'Mercaldas',
    category: 'Supermercado',
    website: 'https://www.mercaldas.com',
    endpoint: 'https://www.mercaldas.com/api/catalog_system/pub/products/search',
  },
  megatiendas: {
    name: 'Megatiendas',
    slug: 'megatiendas',
    chain: 'Megatiendas',
    category: 'Supermercado',
    website: 'https://www.megatiendas.co',
    endpoint: 'https://www.megatiendas.co/api/catalog_system/pub/products/search',
  },
  euro: {
    name: 'Euro Supermercados',
    slug: 'euro',
    chain: 'Euro Supermercados',
    category: 'Supermercado',
    website: 'https://www.eurosupermercados.com.co',
    endpoint: 'https://www.eurosupermercados.com.co/api/catalog_system/pub/products/search',
  },
  blushbar: {
    name: 'Blush-Bar',
    slug: 'blushbar',
    chain: 'Blush-Bar',
    category: 'Farmacia',
    website: 'https://www.blush-bar.com',
    endpoint: 'https://www.blush-bar.com/api/catalog_system/pub/products/search',
  },
  cromantic: {
    name: 'Cromantic',
    slug: 'cromantic',
    chain: 'Cromantic',
    category: 'Farmacia',
    website: 'https://www.cromantic.com',
    endpoint: 'https://www.cromantic.com/api/catalog_system/pub/products/search',
  },
  bellapiel: {
    name: 'Bella Piel',
    slug: 'bellapiel',
    chain: 'Bella Piel',
    category: 'Farmacia',
    website: 'https://www.bellapiel.com.co',
    endpoint: 'https://www.bellapiel.com.co/api/catalog_system/pub/products/search',
  },
  pasteur: {
    name: 'Farmacias Pasteur',
    slug: 'pasteur',
    chain: 'Farmacias Pasteur',
    category: 'Farmacia',
    website: 'https://www.farmaciaspasteur.com.co',
    endpoint: 'https://www.farmaciaspasteur.com.co/api/catalog_system/pub/products/search',
  },
  easy: {
    name: 'Easy',
    slug: 'easy',
    chain: 'Easy',
    category: 'Retail',
    website: 'https://www.easy.com.co',
    endpoint: 'https://www.easy.com.co/api/catalog_system/pub/products/search',
  },
  miniso: {
    name: 'Miniso',
    slug: 'miniso',
    chain: 'Miniso',
    category: 'Retail',
    website: 'https://www.miniso.co',
    endpoint: 'https://www.miniso.co/api/catalog_system/pub/products/search',
  },
  velez: {
    name: 'Velez',
    slug: 'velez',
    chain: 'Velez',
    category: 'Retail',
    website: 'https://www.velez.com.co',
    endpoint: 'https://www.velez.com.co/api/catalog_system/pub/products/search',
  },
  pepeganga: {
    name: 'Pepeganga',
    slug: 'pepeganga',
    chain: 'Pepeganga',
    category: 'Retail',
    website: 'https://www.pepeganga.com',
    endpoint: 'https://www.pepeganga.com/api/catalog_system/pub/products/search',
  },
  panamericana: {
    name: 'Panamericana',
    slug: 'panamericana',
    chain: 'Panamericana',
    category: 'Retail',
    website: 'https://www.panamericana.com.co',
    endpoint: 'https://www.panamericana.com.co/api/catalog_system/pub/products/search',
  },
};

if (!SUPABASE_URL || !SERVICE_KEY) throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
if (!STORES[STORE_SLUG]) throw new Error(`Tienda VTEX no soportada: ${STORE_SLUG}`);

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

async function fetchVtexPage(store, from, to) {
  const params = new URLSearchParams({ _from: String(from), _to: String(to) });
  if (SEARCH_TERM) params.set('ft', SEARCH_TERM);
  if (CATEGORY_PATH) params.set('fq', `C:${CATEGORY_PATH}`);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  let response;
  try {
    response = await fetch(`${store.endpoint}?${params.toString()}`, {
      signal: controller.signal,
      dispatcher: insecureDispatcher,
      headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0 AhorroYaCatalogImporter/1.0' },
    });
  } finally {
    clearTimeout(timeout);
  }
  if (!response.ok && response.status !== 206) {
    const text = await response.text();
    if (response.status === 400 && text.includes("_from can't be greater than 2500")) {
      return { data: [], resources: response.headers.get('resources'), reachedWindowLimit: true };
    }
    throw new Error(`${store.slug} HTTP ${response.status}: ${text}`);
  }
  return { data: await response.json(), resources: response.headers.get('resources') };
}

async function fetchSourceProducts(store) {
  const products = [];
  let resources = null;
  for (let from = START_FROM; products.length < TARGET_PRODUCTS; from += PAGE_SIZE) {
    const page = await fetchVtexPage(store, from, from + PAGE_SIZE - 1);
    resources ||= page.resources;
    if (!page.data?.length) break;
    products.push(...page.data);
    const label = CATEGORY_PATH || SEARCH_TERM || 'catalogo';
    console.log(`${store.slug}/${label} source: ${products.length}/${TARGET_PRODUCTS} desde ${START_FROM} (${resources || 'sin total'})`);
    await new Promise((resolve) => setTimeout(resolve, 120));
  }
  return products.slice(0, TARGET_PRODUCTS);
}

function primaryItem(product) {
  return product.items?.find((item) => item.sellers?.some((seller) => seller.sellerDefault)) || product.items?.[0] || null;
}

function primaryOffer(item) {
  return item?.sellers?.find((seller) => seller.sellerDefault)?.commertialOffer || item?.sellers?.[0]?.commertialOffer || null;
}

function primaryCategory(product) {
  const raw = product.categories?.[0] || '';
  const parts = raw.split('/').filter(Boolean);
  return parts[1] || parts[0] || 'Supermercado';
}

const GENERIC_UNITS = new Set(['un', 'und', 'unid', 'unidad', 'u']);

// VTEX's own measurementUnit is often just a generic "un" even when the
// product name has a real package size in it (e.g. "Arroz Diana 500g"). Only
// fall back to the name-derived size when VTEX's unit isn't already a
// specific one -- retailer data wins when it's actually specific.
function resolveUnit(vtexUnit, name) {
  const normalized = String(vtexUnit || '').trim().toLowerCase();
  if (normalized && !GENERIC_UNITS.has(normalized)) return vtexUnit;
  const presentation = extractPresentation(name);
  if (presentation.quantity && presentation.unit) return `${presentation.quantity}${presentation.unit}`;
  return vtexUnit || 'unidad';
}

function normalizeProduct(product) {
  const item = primaryItem(product);
  const offer = primaryOffer(item);
  const image = item?.images?.[0]?.imageUrl || null;
  const name = fixMojibake(product.productName || item?.nameComplete || item?.name || '');
  const ean = item?.ean || product.ean?.[0] || product.productReference || null;
  const price = Number(offer?.Price || 0);
  const originalPrice = Number(offer?.ListPrice || offer?.PriceWithoutDiscount || price || 0);
  const productSlug = slug(product.linkText || `${name}-${product.productId}`);

  return {
    sourceProductId: product.productId,
    name,
    slug: productSlug,
    brand: fixMojibake(product.brand || 'Sin Marca'),
    category: fixMojibake(primaryCategory(product)),
    ean: ean ? String(ean).replace(/[^0-9]/g, '').slice(0, 14) : null,
    sku: item?.itemId || product.productId,
    image,
    description: product.metaTagDescription || product.description || null,
    unit: resolveUnit(item?.measurementUnit || product.measurement_unit?.[0], name),
    price,
    originalPrice: originalPrice > price ? originalPrice : null,
    available: offer?.IsAvailable !== false && price > 0,
    stock: Number(offer?.AvailableQuantity || 0),
    url: product.link || null,
  };
}

async function getStore(config) {
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

async function main() {
  const config = STORES[STORE_SLUG];
  const raw = await fetchSourceProducts(config);
  const bySlug = [...new Map(raw
    .map(normalizeProduct)
    .filter((product) => product.name && product.price > 0 && product.slug && product.image)
    .map((product) => [product.slug, product])).values()];

  // The retailer's own linkText (source of product.slug) isn't stable per
  // physical product -- the same barcode can show up under two different
  // URLs (seen for real: a normal product page and a "kit-" prefixed
  // duplicate), and since master_products upserts on_conflict=slug, that
  // created two separate rows for one item, with only one of them ending
  // up with an active price. Resolve to the slug of whatever row already
  // exists for that EAN before upserting, so repeat imports converge onto
  // a single master_products row instead of accumulating duplicates.
  const eans = [...new Set(bySlug.map((product) => product.ean).filter(Boolean))];
  if (eans.length) {
    const existingByEan = await rest(`master_products?ean=in.(${eans.join(',')})&select=slug,ean`);
    const slugByEan = new Map((existingByEan || []).map((row) => [row.ean, row.slug]));
    for (const product of bySlug) {
      if (product.ean && slugByEan.has(product.ean)) {
        product.slug = slugByEan.get(product.ean);
      }
    }
  }
  const normalized = [...new Map(bySlug.map((product) => [product.slug, product])).values()];
  const store = await getStore(config);

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
    barcode: product.ean,
    ean: product.ean,
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
  const listings = normalized.map((product) => ({
    id: cryptoId(`${config.slug}:${product.sourceProductId}:${store.id}`),
    master_product_id: masterBySlug[product.slug]?.id,
    store_id: store.id,
    branch_id: null,
    sku: product.sku,
    price: product.price,
    original_price: product.originalPrice,
    available: product.available,
    stock: product.stock,
    url: product.url,
    captured_at: now,
    updated_at: now,
  })).filter((row) => row.master_product_id);

  const existingListings = await fetchExistingListings(listings.map((row) => row.id));
  const changedListings = listings.filter((row) => listingChanged(existingListings.get(row.id), row));
  logPriceAnomalies(changedListings, existingListings, config.slug);
  const historyRows = SKIP_PRICE_HISTORY ? [] : changedListings
    .filter((row) => listingChanged(existingListings.get(row.id), row))
    .map((row) => ({
      store_product_id: row.id,
      price: row.price,
      available: row.available,
      captured_at: row.captured_at,
    }));

  await upsertBatch('store_products', changedListings, 'id', { returning: false });
  if (!SKIP_PRICE_HISTORY) {
    await insertBatch('store_product_history', historyRows);
  }

  console.log('Importacion VTEX finalizada:', {
    store: config.slug,
    source: raw.length,
    normalized: normalized.length,
    listings: listings.length,
    writtenListings: changedListings.length,
    skippedUnchanged: listings.length - changedListings.length,
    priceEvents: SKIP_PRICE_HISTORY ? 'skipped' : historyRows.length,
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
