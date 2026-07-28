import { notFound } from 'next/navigation';
import { cache } from 'react';
import { getProductBySlug } from '../../../services/catalog/CatalogService';
import { getLiveFallbackProductBySlug, getLiveFallbackProducts } from '../../../services/liveFallbackProducts';
import { withTimeout } from '../../../services/fallbackCatalog';
import ProductDetailClient from './ProductDetailClient';
import { ProductJsonLd, BreadcrumbJsonLd, WebSiteJsonLd } from '../../../components/seo/JsonLd';
import { formatPrice } from '../../../lib/formatPrice';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahorroya.vercel.app';

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function normalizeProduct(product) {
  if (!product) return null;
  const rawPrices = product.prices || product.store_products || [];
  const prices = rawPrices
    .map((price) => {
      const store = price.store || price.stores?.name || price.store_name || 'Comercio';
      const storeSlug = price.storeSlug || price.stores?.slug || price.store_id || slugify(store);
      const currentPrice = Number(price.price || 0);
      if (!currentPrice) return null;
      return {
        id: price.id,
        store,
        storeSlug,
        price: currentPrice,
        oldPrice: price.oldPrice || price.original_price || null,
        available: price.available !== false,
        url: price.url || null,
      };
    })
    .filter(Boolean);

  const sortedPrices = [...prices].sort((left, right) => left.price - right.price);
  // "Best price" must mean a price you can actually pay today -- an out-of-
  // stock listing that happens to be cheapest is not a deal, it's a dead
  // end. Only fall back to the sold-out price when every store is agotado,
  // so the page still shows a number instead of nothing.
  const availablePrices = sortedPrices.filter((price) => price.available);
  const best = availablePrices[0] || sortedPrices[0];
  const highest = sortedPrices[sortedPrices.length - 1];
  const brand = product.brand || product.brands?.name || '';
  const category = product.category || product.categories?.name || 'Mercado';
  const categorySlug = product.categorySlug || product.categories?.slug || slugify(category);
  const images = product.images?.length ? product.images : product.image ? [product.image] : [];
  const savingsPercent = best?.oldPrice && best.oldPrice > best.price
    ? Math.round(((best.oldPrice - best.price) / best.oldPrice) * 100)
    : highest?.price && best?.price && highest.price > best.price
      ? Math.round(((highest.price - best.price) / highest.price) * 100)
      : 0;

  return {
    ...product,
    brand,
    brandSlug: product.brandSlug || product.brands?.slug || slugify(brand),
    category,
    categorySlug,
    image: product.image || images[0] || null,
    images,
    prices: sortedPrices,
    bestStore: best?.store,
    bestPrice: best?.price ?? null,
    totalStores: new Set(sortedPrices.map((price) => price.storeSlug)).size,
    savingsPercent,
    presentation: { weight: product.unit || product.short_name || '' },
  };
}

const loadProduct = cache(async function loadProduct(slug) {
  const broadQuery = slug.split('-')[0];
  const [result, liveResult, broadLiveProducts] = await Promise.all([
    withTimeout(getProductBySlug(slug), 800, 'product timeout').catch(() => ({ product: null })),
    withTimeout(getLiveFallbackProductBySlug(slug), 8000, 'live product timeout').catch(() => null),
    withTimeout(getLiveFallbackProducts({ q: broadQuery, limit: 24 }), 8000, 'broad live product timeout').catch(() => []),
  ]);
  const databaseProduct = normalizeProduct(result.product);
  const broadMatch = broadLiveProducts.find((product) => product.slug === slug);
  const liveProduct = normalizeProduct(broadMatch || liveResult);

  if (!databaseProduct) return liveProduct;
  if (!liveProduct) return databaseProduct;

  const pricesByStore = new Map();
  for (const price of databaseProduct.prices || []) pricesByStore.set(price.storeSlug, price);
  for (const price of liveProduct.prices || []) pricesByStore.set(price.storeSlug, price);

  return normalizeProduct({
    ...databaseProduct,
    ...liveProduct,
    prices: [...pricesByStore.values()],
    images: [...new Set([...(liveProduct.images || []), ...(databaseProduct.images || [])])],
  });
});

export async function generateMetadata({ params }) {
  const id = (await params).id;
  const found = await loadProduct(id);
  const product = found || { name: id.replace(/-/g, ' '), slug: id, prices: [] };

  const prices = product.prices || [];
  const bestPrice = product.bestPrice ?? null;
  const priceText = bestPrice ? ` Desde ${formatPrice(bestPrice)}.` : '';

  return {
    metadataBase: new URL(SITE_URL),
    title: `${product.name} - Precio en ${prices.length} comercios | AhorroYa`,
    description: `Encuentra ${product.name} al mejor precio. Compara precios disponibles en AhorroYa.${priceText}`,
    openGraph: {
      title: `${product.name} - AhorroYa`,
      description: `Compara precios de ${product.name} en ${product.totalStores || prices.length} comercios.${priceText}`,
      type: 'website',
      locale: 'es_CO',
      siteName: 'AhorroYa',
      ...(product.image ? { images: [{ url: product.image }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} - AhorroYa`,
      description: bestPrice ? `Mejor precio: ${formatPrice(bestPrice)} en ${product.bestStore || 'AhorroYa'}` : `Compara precios de ${product.name} en AhorroYa`,
    },
    robots: found ? { index: true, follow: true } : { index: false, follow: false },
    alternates: { canonical: `${SITE_URL}/producto/${product.slug}` },
  };
}

export default async function ProductDetailPage({ params }) {
  const id = (await params).id;
  const product = await loadProduct(id);
  if (!product) notFound();

  return (
    <>
      <ProductJsonLd product={product} />
      <BreadcrumbJsonLd items={[
        { name: 'Inicio', url: '/' },
        { name: product.category, url: `/categoria/${product.category?.toLowerCase().replace(/\s+/g, '-')}` },
        { name: product.name },
      ]} />
      <WebSiteJsonLd />
      <ProductDetailClient product={product} />
    </>
  );
}
