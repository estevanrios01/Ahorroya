import { notFound } from 'next/navigation';
import { getBrand, getProductsByBrand } from '../../../services/catalog/CatalogService';
import BrandClient from './BrandClient';
import { BreadcrumbJsonLd, WebSiteJsonLd } from '../../../components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahorroya.vercel.app';

export async function generateMetadata({ params }) {
  const slug = (await params).slug;
  const brand = await getBrand(slug);
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
  const brand = await getBrand(slug);
  if (!brand) notFound();

  const products = await getProductsByBrand(brand.name);

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Inicio', url: '/' },
        { name: 'Marcas', url: '/marcas' },
        { name: brand.name },
      ]} />
      <WebSiteJsonLd />
      <BrandClient brand={brand} products={products} />
    </>
  );
}
