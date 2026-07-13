import { notFound } from 'next/navigation';
import { cache } from 'react';
import { getBrand, getProductsByBrand } from '../../../services/catalog/CatalogService';
import { getLiveFallbackProducts } from '../../../services/liveFallbackProducts';
import { withTimeout } from '../../../services/fallbackCatalog';
import BrandClient from './BrandClient';
import { BreadcrumbJsonLd, WebSiteJsonLd } from '../../../components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahorroya.vercel.app';

function toCardProduct(product) {
  const offers = (product.store_products || [])
    .filter((offer) => offer.available !== false && Number(offer.price) > 0)
    .sort((left, right) => Number(left.price) - Number(right.price));
  const best = offers[0];
  return {
    ...product,
    brand: product.brand || product.brands?.name || '',
    category: product.category || product.categories?.name || 'Mercado',
    price: best ? Number(best.price) : product.price,
    oldPrice: best?.original_price ? Number(best.original_price) : product.oldPrice,
    bestStore: best?.stores?.name || '',
    storesCount: new Set(offers.map((offer) => offer.store_id || offer.stores?.slug)).size,
    presentation: product.presentation || product.unit || product.short_name || '',
  };
}

const loadBrandData = cache(async (slug) => {
  const [{ brand }, { products }] = await Promise.all([
    withTimeout(getBrand(slug), 700, 'brand timeout').catch(() => ({ brand: null })),
    withTimeout(getProductsByBrand(slug), 900, 'brand products timeout').catch(() => ({ products: [] })),
  ]);
  if (brand && products?.length) return { brand, products: products.map(toCardProduct) };

  const liveProducts = await getLiveFallbackProducts({ q: slug.replace(/-/g, ' '), limit: 24 }).catch(() => []);
  const matchingProducts = liveProducts
    .filter((product) => product.brands?.slug === slug)
    .map(toCardProduct);
  const liveBrand = matchingProducts[0]?.brands;
  return {
    brand: brand || (liveBrand ? { ...liveBrand, description: `Productos ${liveBrand.name} con precios publicados por comercios disponibles.` } : null),
    products: matchingProducts,
  };
});

export async function generateMetadata({ params }) {
  const slug = (await params).slug;
  const { brand } = await loadBrandData(slug);
  if (!brand) return { title: 'No encontrado - AhorroYa' };

  return {
    metadataBase: new URL(SITE_URL),
    title: `${brand.name} - Productos y precios | AhorroYa`,
    description: brand.description,
    openGraph: {
      title: `${brand.name} - AhorroYa`,
      description: brand.description,
      locale: 'es_CO',
      siteName: 'AhorroYa',
    },
    robots: { index: true, follow: true },
    alternates: { canonical: `${SITE_URL}/marca/${brand.slug}` },
  };
}

export default async function BrandPage({ params }) {
  const slug = (await params).slug;
  const { brand, products } = await loadBrandData(slug);
  if (!brand) notFound();

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Inicio', url: '/' },
        { name: 'Marcas', url: '/marcas' },
        { name: brand.name },
      ]} />
      <WebSiteJsonLd />
      <BrandClient brand={brand} products={products || []} />
    </>
  );
}
