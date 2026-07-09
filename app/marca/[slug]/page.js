import { notFound } from 'next/navigation';
import { getBrand, getProductsByBrand } from '../../../services/catalog/CatalogService';
import BrandClient from './BrandClient';
import { BreadcrumbJsonLd, WebSiteJsonLd } from '../../../components/seo/JsonLd';

export async function generateMetadata({ params }) {
  const slug = (await params).slug;
  const brand = await getBrand(slug);
  if (!brand) return { title: 'No encontrado - AhorroYa' };

  return {
    title: `${brand.name} - Productos y precios | AhorroYa`,
    description: brand.description,
    openGraph: {
      title: `${brand.name} - AhorroYa`,
      description: brand.description,
      locale: 'es_CO',
      siteName: 'AhorroYa',
    },
    robots: { index: true, follow: true },
    alternates: { canonical: `https://ahorroya.vercel.app/marca/${brand.slug}` },
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
