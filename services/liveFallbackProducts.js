import * as cheerio from 'cheerio';

const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map();
const DISCOVERY_QUERIES = ['arroz', 'aceite', 'leche', 'huevos', 'detergente', 'pollo'];
const PHARMACY_DISCOVERY_QUERIES = ['acetaminofen', 'ibuprofeno', 'vitamina', 'shampoo', 'crema', 'protector solar'];
const PHARMACY_SOURCE_SLUGS = new Set(['la-rebaja', 'colsubsidio', 'locatel', 'pasteur', 'farmatodo', 'cruz-verde']);
const DISCOVERY_INCLUDE_TERMS = [
  'arroz', 'aceite', 'leche', 'huevo', 'detergente', 'pollo', 'pasta', 'cafe', 'azucar',
  'galleta', 'crema', 'queso', 'yogur', 'atun', 'frijol', 'lenteja',
];
const DISCOVERY_EXCLUDE_TERMS = [
  'moto', 'motor', 'liqui moly', 'bidon', 'recolector', 'porta huevos', 'minichefs',
  'juguete', 'extractor', 'materna', 'biberon', 'tetero', 'maquina', 'accesorio',
  'organizador', 'acrilico', '2tiempos', 'semisintetico', 'sintetico',
  'hervidor', 'electrico', 'automatica', 'vapor', 'cocina rapida', 'rociador', 'spray',
  'freidora', 'dispensador', 'botella dispensadora', 'bloqueador', 'solar', 'aceite esencial',
  'almacenamiento', 'pinata', 'pinatas', 'cambiador',
  'cuchara', 'bioaqua', 'gel hidratante', 'hidratante', 'decorativa', 'decorativas', 'casas de huevos',
];
const QUERY_FILTERS = [
  { terms: ['aceite'], exclude: ['moto', 'motor', 'liqui moly', 'horquilla', 'recolector', '2tiempos', 'semisintetico', 'sintetico', 'rociador', 'spray', 'set vinagre', 'dispensador', 'freidora', 'aceite esencial', 'botella dispensadora'] },
  { terms: ['huevo', 'huevos'], exclude: ['porta huevos', 'organizador', 'acrilico', 'juguete', 'gallina porta', 'hervidor', 'electrico', 'automatica', 'vapor', 'cocina rapida'] },
  { terms: ['leche'], exclude: ['extractor', 'materna', 'biberon', 'tetero', 'chocolatina'] },
  { terms: ['arroz'], exclude: ['minichefs', 'juguete', 'cuchara', 'bioaqua', 'gel hidratante', 'hidratante', 'limpiador'] },
];

const SOURCES = [
  {
    name: 'Exito',
    slug: 'exito',
    endpoint: 'https://exitocol.vtexcommercestable.com.br/api/catalog_system/pub/products/search',
  },
  {
    name: 'D1',
    slug: 'd1',
    endpoint: 'https://www.d1.com.co/api/catalog_system/pub/products/search',
  },
  {
    name: 'Olimpica',
    slug: 'olimpica',
    endpoint: 'https://olimpica.vtexcommercestable.com.br/api/catalog_system/pub/products/search',
  },
  {
    name: 'Carulla',
    slug: 'carulla',
    endpoint: 'https://www.carulla.com/api/catalog_system/pub/products/search',
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
  {
    name: 'La Rebaja',
    slug: 'la-rebaja',
    endpoint: 'https://www.larebajavirtual.com/api/catalog_system/pub/products/search',
  },
  {
    name: 'Colsubsidio',
    slug: 'colsubsidio',
    endpoint: 'https://www.drogueriascolsubsidio.com/api/catalog_system/pub/products/search',
  },
  {
    name: 'Locatel',
    slug: 'locatel',
    endpoint: 'https://www.locatelcolombia.com/api/catalog_system/pub/products/search',
  },
  {
    name: 'Pasteur',
    slug: 'pasteur',
    endpoint: 'https://www.farmaciaspasteur.com.co/api/catalog_system/pub/products/search',
  },
  {
    kind: 'algolia',
    name: 'Farmatodo',
    slug: 'farmatodo',
    endpoint: 'https://vcojeyd2po-dsn.algolia.net/1/indexes/products-colombia/query',
  },
  {
    kind: 'cruzverde',
    name: 'Cruz Verde',
    slug: 'cruz-verde',
    endpoint: 'https://api.cruzverde.com.co/product-service/products/search',
  },
  {
    kind: 'makro',
    name: 'Makro',
    slug: 'makro',
    endpoint: 'https://makro.com.co/totem/api/?controller=product&action=getOffersByStore',
  },
  {
    kind: 'ara',
    name: 'Ara',
    slug: 'ara',
    endpoint: 'https://aratiendas.com/merca-todo/norte-2/1/',
  },
];

const FARMATODO_APP_ID = 'VCOJEYD2PO';
const FARMATODO_SEARCH_KEY = 'eb9544fe7bfe7ec4c1aa5e5bf7740feb';
let cruzVerdeSession = null;

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

function normalizeBarcode(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 14 ? digits : null;
}

function primaryItem(product) {
  return product.items?.find((item) => item.sellers?.some((seller) => seller.sellerDefault)) || product.items?.[0] || null;
}

function primaryOffer(item) {
  return item?.sellers?.find((seller) => seller.sellerDefault)?.commertialOffer || item?.sellers?.[0]?.commertialOffer || null;
}

function categoryForSource(source, rawCategory = '') {
  const categoryName = fixMojibake(
    (Array.isArray(rawCategory) ? rawCategory[0] : rawCategory)
      ?.split('/')
      .map((part) => part.trim())
      .filter(Boolean)[0] || ''
  );
  const normalized = slug(categoryName);
  if (['alimento', 'despensa', 'mercado', 'abarrote'].some((term) => normalized.includes(term))) {
    return { name: 'Mercado', slug: 'mercado' };
  }
  const mappings = [
    { terms: ['lacteo', 'leche', 'queso', 'yogur'], category: { name: 'Lacteos', slug: 'lacteos' } },
    { terms: ['bebida', 'agua', 'gaseosa', 'jugo'], category: { name: 'Bebidas', slug: 'bebidas' } },
    { terms: ['carne', 'pollo', 'pescado', 'huevo'], category: { name: 'Carnes', slug: 'carnes' } },
    { terms: ['aseo', 'limpieza', 'lavanderia'], category: { name: 'Aseo', slug: 'aseo' } },
    { terms: ['bebe', 'panal'], category: { name: 'Bebes', slug: 'bebes' } },
    { terms: ['mascota', 'perro', 'gato'], category: { name: 'Mascotas', slug: 'mascotas' } },
  ];
  return mappings.find((mapping) => mapping.terms.some((term) => normalized.includes(term)))?.category
    || (PHARMACY_SOURCE_SLUGS.has(source.slug)
      ? { name: 'Farmacia', slug: 'farmacia' }
      : { name: 'Mercado', slug: 'mercado' });
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
    barcode: normalizeBarcode(item?.ean || item?.EAN || product?.ean),
    image,
    brands: brand ? { name: brand, slug: slug(brand) } : null,
    categories: categoryForSource(source, product.categories),
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

function normalizeFarmatodoProduct(hit, source) {
  const sourceId = String(hit.id || hit.objectID || '').trim();
  const name = fixMojibake(hit.mediaDescription || hit.largeDescription || '');
  const price = Number(hit.offerPrice || hit.fullPrice || 0);
  const originalPrice = Number(hit.fullPrice || price);
  const image = hit.mediaImageUrl || hit.listUrlImages?.[0] || null;
  if (!sourceId || !name || !price || !image || hit.outofstore === true) return null;

  const id = `live-${source.slug}-${sourceId}`;
  const brand = fixMojibake(hit.marca || 'Farmatodo');
  return {
    id,
    name,
    slug: slug(`${name}-${sourceId}`),
    short_name: name,
    unit: hit.labelPum || hit.measurePum || 'unidad',
    barcode: normalizeBarcode(hit.ean || hit.barcode),
    image,
    brands: { name: brand, slug: slug(brand) },
    categories: categoryForSource(source, hit.categorie),
    store_products: [{
      id,
      price,
      original_price: originalPrice > price ? originalPrice : null,
      available: true,
      store_id: source.slug,
      stores: { name: source.name, slug: source.slug },
      url: hit.url || `https://www.farmatodo.com.co/buscar?product=${encodeURIComponent(name)}`,
    }],
  };
}

function normalizeCruzVerdeProduct(hit, source) {
  const sourceId = String(hit.productId || hit.representedProduct?.id || '').trim();
  const name = fixMojibake(hit.productName || hit.image?.title || '');
  const price = Number(hit.prices?.['price-list-col'] || 0);
  const image = hit.image?.link || hit.image?.disBaseLink || null;
  if (!sourceId || !name || !price || !image) return null;

  const id = `live-${source.slug}-${sourceId}`;
  const pageUrl = hit.pageURL
    ? `https://www.cruzverde.com.co/${hit.pageURL}/${sourceId}.html`
    : 'https://www.cruzverde.com.co/';
  const brand = fixMojibake(hit.brand || '');
  return {
    id,
    name,
    slug: slug(`${name}-${sourceId}`),
    short_name: name,
    unit: fixMojibake(hit.pum || 'unidad'),
    barcode: normalizeBarcode(hit.ean || hit.barcode || hit.representedProduct?.ean),
    image,
    brands: brand ? { name: brand, slug: slug(brand) } : null,
    categories: categoryForSource(source),
    store_products: [{
      id,
      price,
      original_price: null,
      available: hit.homeDelivery !== false || hit.storePickup !== false,
      store_id: source.slug,
      stores: { name: source.name, slug: source.slug },
      url: pageUrl,
    }],
  };
}

async function getCruzVerdeSession(timeoutMs) {
  if (cruzVerdeSession?.expiresAt > Date.now()) return cruzVerdeSession.cookie;

  const response = await fetch('https://api.cruzverde.com.co/customer-service/login', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Origin: 'https://www.cruzverde.com.co',
      Referer: 'https://www.cruzverde.com.co/',
      'User-Agent': 'Mozilla/5.0 AhorroYaLiveFallback/1.0',
    },
    body: '{}',
    signal: AbortSignal.timeout(timeoutMs),
    cache: 'no-store',
  });
  if (!response.ok) return null;

  const cookie = response.headers.get('set-cookie')?.split(';')[0] || null;
  if (cookie) cruzVerdeSession = { cookie, expiresAt: Date.now() + 20 * 60 * 1000 };
  return cookie;
}

function parseMakroPrice(value) {
  const normalized = String(value || '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^0-9.]/g, '');
  const price = Number(normalized);
  return Number.isFinite(price) ? price : 0;
}

function normalizeMakroProduct(offer, source) {
  const sourceId = String(offer.sku || '').trim();
  const name = fixMojibake(offer.name || '');
  const price = parseMakroPrice(offer.offerPrice);
  const originalPrice = parseMakroPrice(offer.originalPrice);
  if (!sourceId || !name || !price || !offer.urlImage) return null;

  const id = `live-${source.slug}-${sourceId}`;
  return {
    id,
    name,
    slug: slug(`${name}-${sourceId}`),
    short_name: name,
    unit: offer.unitPrefix || 'unidad',
    barcode: normalizeBarcode(offer.ean || offer.barcode || offer.gtin),
    image: offer.urlImage,
    brands: { name: 'Makro', slug: 'makro' },
    categories: { name: 'Ofertas Makro', slug: 'ofertas-makro' },
    store_products: [{
      id,
      price,
      original_price: originalPrice > price ? originalPrice : null,
      available: true,
      store_id: source.slug,
      stores: { name: source.name, slug: source.slug },
      url: offer.urlEndPoint || `https://www.makro.com.co/ofertas#${sourceId}`,
    }],
  };
}

function normalizeAraProduct(element, $, source) {
  const box = $(element);
  const name = fixMojibake(box.find('.producto-col .elementor-heading-title').first().text());
  const priceValues = box.find('.precio .elementor-heading-title')
    .map((_, item) => $(item).text())
    .get()
    .map(parseMakroPrice)
    .filter(Boolean);
  const imageValue = box.find('img').first().attr('src') || box.find('img').first().attr('data-src');
  const image = imageValue ? new URL(imageValue, source.endpoint).toString() : null;
  const price = priceValues[0] || 0;
  const originalPrice = priceValues.find((value) => value > price) || null;
  if (!name || !price || !image) return null;

  const sourceId = slug(`${name}-${image}`).slice(-80);
  const id = `live-${source.slug}-${sourceId}`;
  return {
    id,
    name,
    slug: slug(`${name}-${sourceId}`),
    short_name: name,
    unit: 'unidad',
    image,
    brands: { name: 'Ara', slug: 'ara' },
    categories: { name: 'Ofertas Ara', slug: 'ofertas-ara' },
    store_products: [{
      id,
      price,
      original_price: originalPrice,
      available: true,
      store_id: source.slug,
      stores: { name: source.name, slug: source.slug },
      url: source.endpoint,
    }],
  };
}

function getSourceBySlug(sourceSlug) {
  if (!sourceSlug) return null;
  const canonicalSlug = sourceSlug === 'larebaja' ? 'la-rebaja' : sourceSlug;
  return SOURCES.find((source) => source.slug === canonicalSlug) || null;
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
  if (product.barcode) return `ean-${product.barcode}`;
  return slug(`${product.brands?.name || ''}-${product.name || ''}`)
    .replace(/-(gramos?|grs?)(?=-|$)/g, '-g')
    .replace(/-(kilogramos?|kilos?|kgs?)(?=-|$)/g, '-kg')
    .replace(/-(mililitros?|mls?)(?=-|$)/g, '-ml')
    .replace(/-(litros?|lts?|lt)(?=-|$)/g, '-l')
    .replace(/-(unidades?|unds?)(?=-|$)/g, '-un')
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
  const text = slug(`${product.name || ''} ${product.brands?.name || ''}`).replace(/-/g, ' ');
  return DISCOVERY_INCLUDE_TERMS.some((term) => text.includes(term))
    && !DISCOVERY_EXCLUDE_TERMS.some((term) => text.includes(term));
}

function discoveryQueriesForSource(source) {
  if (source?.kind === 'makro' || source?.kind === 'ara') return [''];
  return PHARMACY_SOURCE_SLUGS.has(source?.slug) ? PHARMACY_DISCOVERY_QUERIES : DISCOVERY_QUERIES;
}

function getQueryFilter(query) {
  const normalized = String(query || '').toLowerCase();
  return QUERY_FILTERS.find((filter) => filter.terms.some((term) => normalized.includes(term))) || null;
}

export function matchesQueryIntent(product, query) {
  const filter = getQueryFilter(query);
  const text = slug(`${product.name || ''} ${product.brands?.name || ''}`).replace(/-/g, ' ');
  if (filter && (!filter.terms.some((term) => text.includes(term))
    || filter.exclude.some((term) => text.includes(term)))) return false;

  const queryTokens = [...tokenSet(query)];
  if (queryTokens.length === 0) return true;

  const productTokens = tokenSet(`${product.name || ''} ${product.brands?.name || ''}`);
  const numericTokens = queryTokens.filter((token) => /^\d+$/.test(token));
  if (numericTokens.length && !numericTokens.every((token) => productTokens.has(token))) return false;

  const matched = queryTokens.filter((token) => productTokens.has(token)).length;
  return matched >= Math.max(1, Math.ceil(queryTokens.length * 0.75));
}

export function filterProductsForQuery(products, query) {
  return (products || []).filter((product) => matchesQueryIntent(product, query));
}

function tokenSet(value) {
  const normalized = slug(value)
    .replace(/(\d)([a-z])/g, '$1-$2')
    .replace(/([a-z])(\d)/g, '$1-$2')
    .replace(/-(gramos?|grs?)(?=-|$)/g, '-g')
    .replace(/-(kilogramos?|kilos?|kgs?)(?=-|$)/g, '-kg')
    .replace(/-(mililitros?|mls?)(?=-|$)/g, '-ml')
    .replace(/-(litros?|lts?|lt)(?=-|$)/g, '-l')
    .replace(/-(unidades?|unds?)(?=-|$)/g, '-un');
  return new Set(normalized.split('-').filter((token) => token.length > 1 || /^\d+$/.test(token)));
}

function tokenOverlapScore(left, right) {
  const leftTokens = tokenSet(left);
  const rightTokens = tokenSet(right);
  if (!leftTokens.size || !rightTokens.size) return 0;
  let overlap = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) overlap += 1;
  }
  return overlap / Math.max(leftTokens.size, rightTokens.size);
}

export function areComparableProducts(reference, candidate) {
  if (!reference || !candidate) return false;
  if (reference.barcode && candidate.barcode) return reference.barcode === candidate.barcode;
  if (comparableKey(reference) === comparableKey(candidate)) return true;

  const referenceBrand = slug(reference.brands?.name || '');
  const candidateBrand = slug(candidate.brands?.name || '');
  if (referenceBrand && candidateBrand && referenceBrand !== candidateBrand) return false;

  const referenceTokens = tokenSet(reference.name);
  const candidateTokens = tokenSet(candidate.name);
  const referenceNumbers = [...referenceTokens].filter((token) => /^\d+$/.test(token));
  const candidateNumbers = [...candidateTokens].filter((token) => /^\d+$/.test(token));
  if (referenceNumbers.length && candidateNumbers.length
    && !referenceNumbers.some((number) => candidateNumbers.includes(number))) return false;

  return tokenOverlapScore(reference.name, candidate.name) >= 0.75;
}

function mergeProductGroup(reference, candidates) {
  const merged = { ...reference, store_products: [...(reference.store_products || [])] };
  const stores = new Set(merged.store_products.map((offer) => offer.store_id || offer.stores?.slug));
  for (const candidate of candidates) {
    if (!areComparableProducts(reference, candidate)) continue;
    for (const offer of candidate.store_products || []) {
      const storeId = offer.store_id || offer.stores?.slug;
      if (storeId && !stores.has(storeId)) {
        merged.store_products.push(offer);
        stores.add(storeId);
      }
    }
  }
  return merged;
}

async function fetchSource(source, { q, limit, offset = 0, timeoutMs = 4500 }) {
  if (source.kind === 'algolia') {
    const response = await fetch(source.endpoint, {
      method: 'POST',
      headers: {
        'x-algolia-application-id': FARMATODO_APP_ID,
        'x-algolia-api-key': FARMATODO_SEARCH_KEY,
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 AhorroYaLiveFallback/1.0',
      },
      body: JSON.stringify({
        query: q || '',
        hitsPerPage: Math.min(limit, 24),
        page: Math.floor(offset / Math.max(1, Math.min(limit, 24))),
        attributesToRetrieve: [
          'id', 'mediaDescription', 'largeDescription', 'marca', 'categorie',
          'mediaImageUrl', 'listUrlImages', 'fullPrice', 'offerPrice', 'outofstore',
          'labelPum', 'measurePum', 'url', 'ean', 'barcode',
        ],
      }),
      signal: AbortSignal.timeout(timeoutMs),
      cache: 'no-store',
    });
    if (!response.ok) return [];
    const payload = await response.json();
    return (payload.hits || []).map((hit) => normalizeFarmatodoProduct(hit, source)).filter(Boolean);
  }

  if (source.kind === 'makro') {
    const response = await fetch(source.endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 AhorroYaLiveFallback/1.0',
      },
      body: JSON.stringify({ idCountry: 'CO', idStore: 3, maxListSize: Math.max(24, limit) }),
      signal: AbortSignal.timeout(timeoutMs),
      cache: 'no-store',
    });
    if (!response.ok) return [];
    const payload = await response.json();
    return (payload.offers || [])
      .map((offer) => normalizeMakroProduct(offer, source))
      .filter(Boolean)
      .filter((product) => !q || slug(product.name).includes(slug(q)))
      .slice(offset, offset + limit);
  }

  if (source.kind === 'cruzverde') {
    const cookie = await getCruzVerdeSession(timeoutMs);
    if (!cookie) return [];
    const params = new URLSearchParams({
      limit: String(Math.min(limit, 24)),
      offset: String(offset),
      sort: '',
      q: q || 'medicamentos',
    });
    const response = await fetch(`${source.endpoint}?${params.toString()}`, {
      headers: {
        Accept: 'application/json',
        Cookie: cookie,
        Origin: 'https://www.cruzverde.com.co',
        Referer: 'https://www.cruzverde.com.co/',
        'User-Agent': 'Mozilla/5.0 AhorroYaLiveFallback/1.0',
      },
      signal: AbortSignal.timeout(timeoutMs),
      cache: 'no-store',
    });
    if (response.status === 401) cruzVerdeSession = null;
    if (!response.ok) return [];
    const payload = await response.json();
    return (payload.hits || []).map((hit) => normalizeCruzVerdeProduct(hit, source)).filter(Boolean);
  }

  if (source.kind === 'ara') {
    const response = await fetch(source.endpoint, {
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': 'Mozilla/5.0 AhorroYaLiveFallback/1.0',
      },
      signal: AbortSignal.timeout(timeoutMs),
      cache: 'no-store',
    });
    if (!response.ok) return [];
    const $ = cheerio.load(await response.text());
    return $('.mta-box')
      .map((_, element) => normalizeAraProduct(element, $, source))
      .get()
      .filter(Boolean)
      .filter((product) => !q || slug(product.name).includes(slug(q)))
      .slice(offset, offset + limit);
  }

  const params = new URLSearchParams({ _from: String(offset), _to: String(Math.max(offset, offset + limit - 1)) });
  if (q) params.set('ft', q);
  const response = await fetch(`${source.endpoint}?${params.toString()}`, {
    headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0 AhorroYaLiveFallback/1.0' },
    signal: AbortSignal.timeout(timeoutMs),
    cache: 'no-store',
  });
  if (!response.ok && response.status !== 206) return [];
  const products = await response.json();
  return (products || []).map((product) => normalizeVtexProduct(product, source)).filter(Boolean);
}

export async function getLiveFallbackProducts({ q = '', limit = 12, store = '', page = 1 } = {}) {
  const normalizedLimit = Math.max(1, Math.min(Number(limit) || 12, 24));
  const normalizedPage = Math.max(1, Number(page) || 1);
  const source = getSourceBySlug(store);
  const selectedSources = store ? (source ? [source] : []) : SOURCES;
  if (store && selectedSources.length === 0) return [];

  const cacheKey = `${store}:${q}:${normalizedLimit}:${normalizedPage}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.createdAt < CACHE_TTL_MS) return cached.products;

  const timeoutMs = store ? 8000 : 7000;
  const sourceQueries = store && source ? discoveryQueriesForSource(source) : DISCOVERY_QUERIES;
  const retailerQuery = q.trim().split(/\s+/)[0] || q;
  const queries = q
    ? [retailerQuery]
    : store
      ? sourceQueries.slice(0, source?.kind === 'makro' || source?.kind === 'ara' ? 1 : 6)
      : selectedSources.map((_, index) => DISCOVERY_QUERIES[index % DISCOVERY_QUERIES.length]);
  const batches = await Promise.allSettled(
    store && !q
      ? queries.map((query) => {
          const batchLimit = Math.max(6, Math.ceil(normalizedLimit / 2));
          return fetchSource(source, {
            q: query,
            limit: batchLimit,
            offset: (normalizedPage - 1) * batchLimit,
            timeoutMs,
          });
        })
      : selectedSources.map((item, index) => fetchSource(item, {
          q: q ? retailerQuery : (queries[index] || q),
          limit: normalizedLimit,
          offset: (normalizedPage - 1) * normalizedLimit,
          timeoutMs,
        }))
  );
  const rawProducts = store
    ? batches.flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
    : q
      ? batches.flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
      : interleaveBatches(batches, normalizedLimit);
  const scopedProducts = q
    ? filterProductsForQuery(rawProducts, q)
    : store
      ? (PHARMACY_SOURCE_SLUGS.has(source?.slug) || source?.kind === 'makro' || source?.kind === 'ara'
          ? rawProducts
          : rawProducts.filter(isDiscoveryProduct))
      : rawProducts.filter(isDiscoveryProduct);
  const products = mergeComparableProducts(scopedProducts, normalizedLimit);

  if (store && products.length === 0) {
    const retryBatches = await Promise.allSettled(SOURCES.map((item) => fetchSource(item, { q, limit: normalizedLimit, timeoutMs })));
    const scopedProducts = retryBatches
      .flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
      .filter((product) => product.store_products?.some((entry) => entry.stores?.slug === store))
      .filter((product) => !q || matchesQueryIntent(product, q))
      .slice(0, normalizedLimit);
    cache.set(cacheKey, { createdAt: Date.now(), products: scopedProducts });
    return scopedProducts;
  }

  const verifiedProducts = q ? filterProductsForQuery(products, q) : products;
  cache.set(cacheKey, { createdAt: Date.now(), products: verifiedProducts });
  return verifiedProducts;
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
    getLiveFallbackProducts({ q: readableQuery.split(' ')[0], limit: 24 }),
    getLiveFallbackProducts({ limit: 24 }),
  ]);

  const candidates = batches.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
  const exact = candidates.find((product) => product.slug === normalizedSlug);
  if (exact) {
    return mergeProductGroup(exact, candidates);
  }

  const ranked = candidates
    .map((product) => ({ product, score: tokenOverlapScore(normalizedSlug, product.slug || product.name) }))
    .sort((left, right) => right.score - left.score);
  return ranked[0]?.score >= 0.6 ? mergeProductGroup(ranked[0].product, candidates) : null;
}
