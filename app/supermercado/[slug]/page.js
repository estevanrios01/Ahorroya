import { notFound } from 'next/navigation';
import { getStoreBySlug, getProductsByStore } from '../../../services/catalog/CatalogService';
import { getFallbackStore, withTimeout } from '../../../services/fallbackCatalog';
import StoreClient from './StoreClient';
import { StoreJsonLd, BreadcrumbJsonLd, WebSiteJsonLd } from '../../../components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahorroya.vercel.app';

async function loadStore(slug) {
  const result = await withTimeout(getStoreBySlug(slug), 800, 'store timeout').catch(() => ({ store: null }));
  return result.store || getFallbackStore(slug);
}

export async function generateMetadata({ params }) {
  const slug = (await params).slug;
  const store = getFallbackStore(slug) || await loadStore(slug);
  if (!store) return { title: 'No encontrado - AhorroYa' };

  return {
    metadataBase: new URL(SITE_URL),
    title: `${store.name} - Precios y productos | AhorroYa`,
    description: store.description || `Encuentra los mejores precios en ${store.name}. Compara productos, ofertas y ahorra en tus compras.`,
    openGraph: {
      title: `${store.name} - AhorroYa`,
      description: store.description || `Compara precios en ${store.name}.`,
      locale: 'es_CO',
      siteName: 'AhorroYa',
    },
    robots: { index: true, follow: true },
    alternates: { canonical: `${SITE_URL}/${store.type}/${store.slug}` },
  };
}

export default async function StorePage({ params }) {
  const slug = (await params).slug;
  const store = await loadStore(slug);
  if (!store) notFound();

  const { products, pagination } = await withTimeout(getProductsByStore(slug), 250, 'store products timeout').catch(() => ({ products: [], pagination: { total: 0 } }));
  const visibleProducts = products || [];

  const loadMore = async (page) => {
    'use server';
    const { products: more } = await getProductsByStore(slug, { page, limit: 24 });
    return more;
  };

  return (
    <>
      <StoreJsonLd store={store} />
      <BreadcrumbJsonLd items={[
        { name: 'Inicio', url: '/' },
        { name: store.type === 'farmacia' ? 'Farmacias' : 'Supermercados', url: `/${store.type === 'farmacia' ? 'farmacias' : 'supermercados'}` },
        { name: store.name },
      ]} />
      <WebSiteJsonLd />
      <StoreClient key={slug} store={store} products={visibleProducts || []} totalProducts={pagination?.total || visibleProducts.length || 0} loadMore={loadMore} degraded={!products?.length} />
    </>
  );
}
