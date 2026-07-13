const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map();
const DISCOVERY_QUERIES = ['arroz', 'aceite', 'leche', 'huevos', 'detergente', 'pollo'];
const DISCOVERY_INCLUDE_TERMS = [
  'arroz', 'aceite', 'leche', 'huevo', 'detergente', 'pollo', 'pasta', 'cafe', 'azucar',
  'galleta', 'crema', 'queso', 'yogur', 'atun', 'frijol', 'lenteja',
];
const DISCOVERY_EXCLUDE_TERMS = [
  'moto', 'motor', 'liqui moly', 'bidon', 'recolector', 'porta huevos', 'minichefs',
  'juguete', 'extractor', 'materna', 'biberon', 'tetero', 'maquina', 'accesorio',
];

const SOURCES = [
  {
    name: 'Exito',
    slug: 'exito',
    endpoint: 'https://exitocol.vtexcommercestable.com.br/api/catalog_system/pub/products/search',
  },
  {
    name: 'Olimpica',
    slug: 'olimpica',
    endpoint: 'https://olimpica.vtexcommercestable.com.br/api/catalog_system/pub/products/search',
  },
  {
    name: 'Jumbo',
    slug: 'jumbo',
    endpoint: 'https://jumbocolombiaio.vtexcommercestable.com.br/api/catalog_system/pub/products/search',
  },
  {
    name: 'Metro',
    slug: 'metro',
    endpoint: 'https://metrocolombiaio.vtexcommercestable.com.br/api/catalog_system/pub/products/search',
  },
];

function fixMojibake(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/\u00c3\u00a1/g, '\u00e1')
    .replace(/\u00c3\u00a9/g, '\u00e9')
    .replace(/\u00c3\u00ad/g, '\u00ed')
    .replace(/\u00c3\u00b3/g, '\u00f3')
    .replace(/\u00c3\u00ba/g, '\u00fa')
    .replace(/\u00c3\u00b1/g, '\u00f1')
    .replace(/\u00c3\u0081/g, '\u00c1')
    .replace(/\u00c3\u0089/g, '\u00c9')
    .replace(/\u00c3\u008d/g, '\u00cd')
    .replace(/\u00c3\u0093/g, '\u00d3')
    .replace(/\u00c3\u009a/g, '\u00da')
    .replace(/\u00c3\u0091/g, '\u00d1')
    .replace(/\u00c2/g, '')
    .replace(/\s+/g, ' ')
    .trim();
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

function primaryItem(product) {
  return product.items?.find((item) => item.sellers?.some((seller) => seller.sellerDefault)) || product.items?.[0] || null;
}

function primaryOffer(item) {
  return item?.sellers?.find((seller) => seller.sellerDefault)?.commertialOffer || item?.sellers?.[0]?.commertialOffer || null;
}

function normalizeVtexProduct(product, source) {
  const item = primaryItem(product);
  const offer = primaryOffer(item);
  const price = Number(offer?.Price || 0);
  const image = item?.images?.[0]?.imageUrl || null;
  const name = fixMojibake(product.productName || item?.nameComplete || item?.name || '');
  if (!name || !image || !price) return null;

  const id = `live-${source.slug}-${product.productId || item?.itemId || slug(name)}`;
  const originalPrice = Number(offer?.ListPrice || offer?.PriceWithoutDiscount || price);
  const brand = fixMojibake(product.brand || '');
  return {
    id,
    name,
    slug: slug(product.linkText || `${name}-${source.slug}`),
    short_name: name,
    unit: item?.measurementUnit || 'unidad',
    image,
    brands: brand ? { name: brand, slug: slug(brand) } : null,
    categories: null,
    store_products: [{
      id,
      price,
      original_price: originalPrice > price ? originalPrice : null,
      available: offer?.IsAvailable !== false,
      store_id: source.slug,
      stores: { name: source.name, slug: source.slug },
      url: product.link || null,
    }],
  };
}

function getSourceBySlug(sourceSlug) {
  if (!sourceSlug) return null;
  return SOURCES.find((source) => source.slug === sourceSlug) || null;
}

function interleaveBatches(batches, limit) {
  const lists = batches.map((result) => (result.status === 'fulfilled' ? result.value : [])).filter((items) => items.length);
  const products = [];
  for (let index = 0; products.length < limit; index++) {
    let added = false;
    for (const list of lists) {
      if (list[index]) {
        products.push(list[index]);
        added = true;
        if (products.length >= limit) break;
      }
    }
    if (!added) break;
  }
  return products;
}

function comparableKey(product) {
  return slug(`${product.brands?.name || ''}-${product.name || ''}`)
    .replace(/-(exito|olimpica|jumbo|metro)$/g, '')
    .replace(/-x-\d+$/g, '')
    .slice(0, 140);
}

function mergeComparableProducts(products, limit) {
  const map = new Map();
  for (const product of products) {
    const key = comparableKey(product);
    if (!key) continue;
    const current = map.get(key);
    if (!current) {
      map.set(key, { ...product, store_products: [...(product.store_products || [])] });
      continue;
    }

    const existingStoreIds = new Set(current.store_products.map((item) => item.store_id || item.stores?.slug));
    for (const offer of product.store_products || []) {
      const storeId = offer.store_id || offer.stores?.slug;
      if (!existingStoreIds.has(storeId)) {
        current.store_products.push(offer);
        existingStoreIds.add(storeId);
      }
    }

    const currentBest = Math.min(...current.store_products.map((item) => Number(item.price)).filter(Boolean));
    const productBest = Math.min(...(product.store_products || []).map((item) => Number(item.price)).filter(Boolean));
    if (productBest && (!currentBest || productBest < currentBest)) {
      current.price = productBest;
      current.image = product.image || current.image;
    }
  }
  return [...map.values()].slice(0, limit);
}

function isDiscoveryProduct(product) {
  const text = `${product.name || ''} ${product.brands?.name || ''}`.toLowerCase();
  return DISCOVERY_INCLUDE_TERMS.some((term) => text.includes(term))
    && !DISCOVERY_EXCLUDE_TERMS.some((term) => text.includes(term));
}

async function fetchSource(source, { q, limit, timeoutMs = 4500 }) {
  const params = new URLSearchParams({ _from: '0', _to: String(Math.max(0, limit - 1)) });
  if (q) params.set('ft', q);
  const response = await fetch(`${source.endpoint}?${params.toString()}`, {
    headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0 AhorroYaLiveFallback/1.0' },
    signal: AbortSignal.timeout(timeoutMs),
    next: { revalidate: 300 },
  });
  if (!response.ok && response.status !== 206) return [];
  const products = await response.json();
  return (products || []).map((product) => normalizeVtexProduct(product, source)).filter(Boolean);
}

export async function getLiveFallbackProducts({ q = '', limit = 12, store = '' } = {}) {
  const normalizedLimit = Math.max(1, Math.min(Number(limit) || 12, 24));
  const source = getSourceBySlug(store);
  const selectedSources = store ? (source ? [source] : []) : SOURCES;
  if (store && selectedSources.length === 0) return [];

  const cacheKey = `${store}:${q}:${normalizedLimit}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.createdAt < CACHE_TTL_MS) return cached.products;

  const timeoutMs = store ? 8000 : 4500;
  const queries = q
    ? [q]
    : store
      ? DISCOVERY_QUERIES.slice(0, 4)
      : selectedSources.map((_, index) => DISCOVERY_QUERIES[index % DISCOVERY_QUERIES.length]);
  const batches = await Promise.allSettled(
    store && !q
      ? queries.map((query) => fetchSource(source, { q: query, limit: Math.max(6, Math.ceil(normalizedLimit / 2)), timeoutMs }))
      : selectedSources.map((item, index) => fetchSource(item, { q: queries[index] || q, limit: normalizedLimit, timeoutMs }))
  );
  const rawProducts = store
    ? batches.flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
    : interleaveBatches(batches, normalizedLimit);
  const scopedProducts = q ? rawProducts : rawProducts.filter(isDiscoveryProduct);
  const products = mergeComparableProducts(scopedProducts, normalizedLimit);

  if (store && products.length === 0) {
    const retryBatches = await Promise.allSettled(SOURCES.map((item) => fetchSource(item, { q, limit: normalizedLimit, timeoutMs })));
    const scopedProducts = retryBatches
      .flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
      .filter((product) => product.store_products?.some((entry) => entry.stores?.slug === store))
      .slice(0, normalizedLimit);
    cache.set(cacheKey, { createdAt: Date.now(), products: scopedProducts });
    return scopedProducts;
  }

  cache.set(cacheKey, { createdAt: Date.now(), products });
  return products;
}

export async function getLiveFallbackProductBySlug(productSlug) {
  const normalizedSlug = slug(productSlug);
  const readableQuery = normalizedSlug
    .replace(/-\d+$/g, '')
    .replace(/-(exito|olimpica|jumbo|carulla|d1|ara|makro|metro)$/g, '')
    .replace(/-/g, ' ')
    .trim();

  const batches = await Promise.allSettled([
    getLiveFallbackProducts({ q: readableQuery, limit: 24 }),
    getLiveFallbackProducts({ q: readableQuery.split(' ').slice(0, 3).join(' '), limit: 24 }),
    getLiveFallbackProducts({ limit: 24 }),
  ]);

  const candidates = batches.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
  return candidates.find((product) => product.slug === normalizedSlug) || candidates[0] || null;
}
