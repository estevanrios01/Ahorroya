import { notFound } from 'next/navigation';
import { getCity } from '../../../services/catalog/CatalogService';
import CityClient from './CityClient';
import { BreadcrumbJsonLd, WebSiteJsonLd } from '../../../components/seo/JsonLd';

export async function generateMetadata({ params }) {
  const slug = (await params).slug;
  const city = await getCity(slug);
  if (!city) return { title: 'No encontrado - AhorroYa' };

  return {
    title: `${city.name} - Compara precios en supermercados y farmacias | AhorroYa`,
    description: city.description,
    openGraph: {
      title: `${city.name} - AhorroYa`,
      description: city.description,
      locale: 'es_CO',
      siteName: 'AhorroYa',
    },
    robots: { index: true, follow: true },
    alternates: { canonical: `https://ahorroya.vercel.app/ciudad/${city.slug}` },
  };
}

export default async function CityPage({ params }) {
  const slug = (await params).slug;
  const city = await getCity(slug);
  if (!city) notFound();

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Inicio', url: '/' },
        { name: 'Ciudades', url: '/ciudades' },
        { name: city.name },
      ]} />
      <WebSiteJsonLd />
      <CityClient city={city} />
    </>
  );
}
