const { loadEnv, rest, upsertBatch, insertBatch, slug, makeCryptoId, numericEqual, logPriceAnomalies } = require('./lib/supabase-rest');

loadEnv();

const cryptoId = makeCryptoId('ahorroya-real');
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TARGET_PRODUCTS = Number(process.env.OLIMPICA_TARGET_PRODUCTS || 2000);
const PAGE_SIZE = Number(process.env.OLIMPICA_PAGE_SIZE || 50);
const BATCH_SIZE = Number(process.env.IMPORT_BATCH_SIZE || 100);
const SKIP_PRICE_HISTORY = process.env.IMPORT_SKIP_PRICE_HISTORY === '1';

if (!SUPABASE_URL || !SERVICE_KEY) {
  throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
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

async function fetchOlimpicaPage(from, to) {
  const url = `https://www.olimpica.com/api/catalog_system/pub/products/search?_from=${from}&_to=${to}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0 AhorroYaCatalogImporter/1.0',
    },
  });
  if (!response.ok && response.status !== 206) {
    throw new Error(`Olimpica HTTP ${response.status}: ${await response.text()}`);
  }
  const totalHeader = response.headers.get('resources') || '';
  const data = await response.json();
  return { data, totalHeader };
}

async function fetchOlimpicaProducts() {
  const products = [];
  let totalHeader = null;
  for (let from = 0; products.length < TARGET_PRODUCTS; from += PAGE_SIZE) {
    const to = from + PAGE_SIZE - 1;
    const page = await fetchOlimpicaPage(from, to);
    totalHeader ||= page.totalHeader;
    if (!page.data?.length) break;
    products.push(...page.data);
    console.log(`olimpica source: ${products.length}/${TARGET_PRODUCTS} (${totalHeader || 'sin total'})`);
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

function normalizeProduct(product) {
  const item = primaryItem(product);
  const offer = primaryOffer(item);
  const image = item?.images?.[0]?.imageUrl || null;
  const name = product.productName || item?.nameComplete || item?.name || '';
  const ean = item?.ean || product.ean?.[0] || product.productReference || null;
  const price = Number(offer?.Price || 0);
  const originalPrice = Number(offer?.ListPrice || offer?.PriceWithoutDiscount || price || 0);
  const categoryName = primaryCategory(product);

  return {
    sourceProductId: product.productId,
    name,
    slug: slug(product.linkText || name),
    brand: product.brand || 'Sin Marca',
    category: categoryName,
    ean: ean ? String(ean).replace(/[^0-9]/g, '').slice(0, 14) : null,
    sku: item?.itemId || product.productId,
    image,
    description: product.metaTagDescription || product.description || null,
    unit: item?.measurementUnit || product.measurement_unit?.[0] || 'unidad',
    price,
    originalPrice: originalPrice > price ? originalPrice : null,
    available: offer?.IsAvailable !== false && price > 0,
    stock: Number(offer?.AvailableQuantity || 0),
    url: product.link || `https://www.olimpica.com/${product.linkText}/p`,
  };
}

async function getOlimpicaStore() {
  const rows = await rest('stores?slug=eq.olimpica&select=*');
  if (rows?.[0]) return rows[0];
  const inserted = await upsertBatch('stores', [{
    name: 'Olimpica',
    slug: 'olimpica',
    brand: 'Olimpica',
    chain: 'Olimpica',
    category: 'Supermercado',
    website: 'https://www.olimpica.com',
    status: 'active',
  }], 'slug');
  return inserted[0];
}

async function main() {
  const rawProducts = await fetchOlimpicaProducts();
  const normalized = [
    ...new Map(
      rawProducts
        .map(normalizeProduct)
        .filter((product) => product.name && product.price > 0 && product.slug)
        .map((product) => [product.slug, product])
    ).values(),
  ];
  const store = await getOlimpicaStore();

  const brandRows = [...new Map(normalized.map((product) => [slug(product.brand), {
    name: product.brand,
    slug: slug(product.brand),
    country: 'Colombia',
  }])).values()];
  const categoryRows = [...new Map(normalized.map((product) => [slug(product.category), {
    name: product.category,
    slug: slug(product.category),
    level: 1,
  }])).values()];

  const brands = await upsertBatch('brands', brandRows, 'slug');
  const categories = await upsertBatch('categories', categoryRows, 'slug');
  const brandIds = Object.fromEntries(brands.map((brand) => [brand.slug, brand.id]));
  const categoryIds = Object.fromEntries(categories.map((category) => [category.slug, category.id]));

  const masterRows = normalized.map((product) => ({
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
  }));

  const masters = await upsertBatch('master_products', masterRows, 'slug');
  const masterBySlug = Object.fromEntries(masters.map((product) => [product.slug, product]));

  const imageRows = normalized
    .filter((product) => product.image && masterBySlug[product.slug])
    .map((product) => ({
      master_product_id: masterBySlug[product.slug].id,
      url: product.image,
      thumbnail_url: product.image,
      alt: product.name,
      is_primary: true,
    }));
  await upsertBatch('product_images', imageRows, 'master_product_id,url', { returning: false });

  const listingRows = normalized
    .filter((product) => masterBySlug[product.slug])
    .map((product) => ({
      id: cryptoId(`olimpica:${product.sourceProductId}:${store.id}`),
      master_product_id: masterBySlug[product.slug].id,
      store_id: store.id,
      branch_id: null,
      sku: product.sku,
      price: product.price,
      original_price: product.originalPrice,
      available: product.available,
      stock: product.stock,
      url: product.url,
      captured_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  const existingListings = await fetchExistingListings(listingRows.map((row) => row.id));
  const changedListings = listingRows.filter((row) => listingChanged(existingListings.get(row.id), row));
  logPriceAnomalies(changedListings, existingListings, 'olimpica');
  await upsertBatch('store_products', changedListings, 'id', { returning: false });

  const historyRows = changedListings.map((row) => ({
    store_product_id: row.id,
    price: row.price,
    available: row.available,
    captured_at: row.captured_at,
  }));
  if (!SKIP_PRICE_HISTORY) await insertBatch('store_product_history', historyRows);

  console.log('Importacion Olimpica finalizada:', {
    source: rawProducts.length,
    normalized: normalized.length,
    images: imageRows.length,
    listings: listingRows.length,
    writtenListings: changedListings.length,
    skippedUnchanged: listingRows.length - changedListings.length,
    priceEvents: SKIP_PRICE_HISTORY ? 'skipped' : historyRows.length,
    store: store.slug,
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
