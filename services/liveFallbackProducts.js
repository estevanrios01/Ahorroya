const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map();

const SOURCES = [
  {
    name: 'Exito',
    slug: 'exito',
    endpoint: 'https://www.exito.com/api/catalog_system/pub/products/search',
  },
  {
    name: 'Olimpica',
    slug: 'olimpica',
    endpoint: 'https://www.olimpica.com/api/catalog_system/pub/products/search',
  },
];

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
  const name = product.productName || item?.nameComplete || item?.name || '';
  if (!name || !image || !price) return null;

  const id = `live-${source.slug}-${product.productId || item?.itemId || slug(name)}`;
  const originalPrice = Number(offer?.ListPrice || offer?.PriceWithoutDiscount || price);
  return {
    id,
    name,
    slug: slug(product.linkText || `${name}-${source.slug}`),
    short_name: name,
    unit: item?.measurementUnit || 'unidad',
    image,
    brands: product.brand ? { name: product.brand, slug: slug(product.brand) } : null,
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

async function fetchSource(source, { q, limit }) {
  const params = new URLSearchParams({ _from: '0', _to: String(Math.max(0, limit - 1)) });
  if (q) params.set('ft', q);
  const response = await fetch(`${source.endpoint}?${params.toString()}`, {
    headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0 AhorroYaLiveFallback/1.0' },
    signal: AbortSignal.timeout(8000),
    next: { revalidate: 300 },
  });
  if (!response.ok && response.status !== 206) return [];
  const products = await response.json();
  return (products || []).map((product) => normalizeVtexProduct(product, source)).filter(Boolean);
}

export async function getLiveFallbackProducts({ q = '', limit = 12 } = {}) {
  const normalizedLimit = Math.max(1, Math.min(Number(limit) || 12, 24));
  const cacheKey = `${q}:${normalizedLimit}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.createdAt < CACHE_TTL_MS) return cached.products;

  const batches = await Promise.allSettled(SOURCES.map((source) => fetchSource(source, { q, limit: normalizedLimit })));
  const products = batches
    .flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
    .slice(0, normalizedLimit);

  cache.set(cacheKey, { createdAt: Date.now(), products });
  return products;
}
