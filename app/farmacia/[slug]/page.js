import { notFound } from 'next/navigation';
import { getStoreBySlug, getProductsByStore } from '../../../services/catalog/CatalogService';
import { getFallbackStore, withTimeout } from '../../../services/fallbackCatalog';
import StoreClient from '../../supermercado/[slug]/StoreClient';
import { StoreJsonLd, BreadcrumbJsonLd, WebSiteJsonLd } from '../../../components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahorroya.vercel.app';

async function loadStore(slug) {
  const result = await withTimeout(getStoreBySlug(slug), 800, 'pharmacy timeout').catch(() => ({ store: null }));
  return result.store || getFallbackStore(slug);
}

export async function generateMetadata({ params }) {
  const slug = (await params).slug;
  const store = getFallbackStore(slug) || await loadStore(slug);
  if (!store) return { title: 'No encontrado - AhorroYa' };

  return {
    metadataBase: new URL(SITE_URL),
    title: `${store.name} - Precios y productos | AhorroYa`,
    description: store.description || `Encuentra los mejores precios en ${store.name}. Compara medicamentos, cuidado personal y ahorra.`,
    openGraph: {
      title: `${store.name} - AhorroYa`,
      description: store.description || `Compara precios en ${store.name}.`,
      locale: 'es_CO',
      siteName: 'AhorroYa',
    },
    robots: { index: true, follow: true },
    alternates: { canonical: `${SITE_URL}/farmacia/${store.slug}` },
  };
}

export default async function FarmaciaPage({ params }) {
  const slug = (await params).slug;
  const store = await loadStore(slug);
  if (!store) notFound();

  const { products, pagination } = await withTimeout(getProductsByStore(slug), 250, 'pharmacy products timeout').catch(() => ({ products: [], pagination: { total: 0 } }));
  const visibleProducts = products || [];

  return (
    <>
      <StoreJsonLd store={store} />
      <BreadcrumbJsonLd items={[
        { name: 'Inicio', url: '/' },
        { name: 'Farmacias', url: '/farmacias' },
        { name: store.name },
      ]} />
      <WebSiteJsonLd />
      <StoreClient store={store} products={visibleProducts || []} totalProducts={pagination?.total || visibleProducts.length || 0} degraded={!products?.length} />
    </>
  );
}
