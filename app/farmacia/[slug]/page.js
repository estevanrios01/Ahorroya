import { notFound } from 'next/navigation';
import { getStore, getProductsByStore } from '../../../services/catalog/CatalogService';
import StoreClient from '../../supermercado/[slug]/StoreClient';
import { StoreJsonLd, BreadcrumbJsonLd, WebSiteJsonLd } from '../../../components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahorroya.vercel.app';

export async function generateMetadata({ params }) {
  const slug = (await params).slug;
  const store = await getStore(slug);
  if (!store) return { title: 'No encontrado - AhorroYa' };

  return {
    metadataBase: new URL(SITE_URL),
    title: `${store.name} - Precios y productos | AhorroYa`,
    description: store.description,
    openGraph: {
      title: `${store.name} - AhorroYa`,
      description: store.description,
      locale: 'es_CO',
      siteName: 'AhorroYa',
    },
    robots: { index: true, follow: true },
    alternates: { canonical: `${SITE_URL}/farmacia/${store.slug}` },
  };
}

export default async function FarmaciaPage({ params }) {
  const slug = (await params).slug;
  const store = await getStore(slug);
  if (!store) notFound();

  const products = await getProductsByStore(slug);

  return (
    <>
      <StoreJsonLd store={store} />
      <BreadcrumbJsonLd items={[
        { name: 'Inicio', url: '/' },
        { name: 'Farmacias', url: '/farmacias' },
        { name: store.name },
      ]} />
      <WebSiteJsonLd />
      <StoreClient store={store} products={products} />
    </>
  );
}
