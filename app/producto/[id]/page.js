import { notFound } from 'next/navigation';
import { getProductBySlug } from '../../../services/catalog/CatalogService';
import { getLiveFallbackProductBySlug } from '../../../services/liveFallbackProducts';
import { withTimeout } from '../../../services/fallbackCatalog';
import ProductDetailClient from './ProductDetailClient';
import { ProductJsonLd, BreadcrumbJsonLd, WebSiteJsonLd } from '../../../components/seo/JsonLd';

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
  const best = sortedPrices[0];
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
    totalStores: new Set(sortedPrices.map((price) => price.storeSlug)).size,
    savingsPercent,
    presentation: product.presentation || product.unit || product.short_name || '',
  };
}

async function loadProduct(slug) {
  const result = await withTimeout(getProductBySlug(slug), 800, 'product timeout').catch(() => ({ product: null }));
  if (result.product) return normalizeProduct(result.product);
  const liveProduct = await withTimeout(getLiveFallbackProductBySlug(slug), 3000, 'live product timeout').catch(() => null);
  return normalizeProduct(liveProduct);
}

export async function generateMetadata({ params }) {
  const id = (await params).id;
  const result = await withTimeout(getProductBySlug(id), 700, 'product metadata timeout').catch(() => ({ product: null }));
  const product = normalizeProduct(result.product) || { name: id.replace(/-/g, ' '), slug: id, prices: [] };
  if (!product) return { title: 'Producto no encontrado - AhorroYa' };

  const prices = product.prices || [];
  const bestPrice = prices.length > 0 ? Math.min(...prices.map(p => p.price)) : null;
  const formatPrice = (v) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v);
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
    robots: { index: true, follow: true },
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
