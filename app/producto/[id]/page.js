import { notFound } from 'next/navigation';
import { getProductBySlug } from '../../../services/catalog/CatalogService';
import ProductDetailClient from './ProductDetailClient';
import { ProductJsonLd, BreadcrumbJsonLd, WebSiteJsonLd } from '../../../components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahorroya.vercel.app';

export async function generateMetadata({ params }) {
  const id = (await params).id;
  const { product } = await getProductBySlug(id);
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
  const { product } = await getProductBySlug(id);
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
