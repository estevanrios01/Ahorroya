import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCategory, getProductsByCategory, getAllProducts } from '../../../services/catalog/CatalogService';
import CategoryClient from './CategoryClient';
import { CategoryJsonLd, BreadcrumbJsonLd, WebSiteJsonLd } from '../../../components/seo/JsonLd';
import { slugify } from '../../../services/catalog/CatalogService';

export async function generateMetadata({ params }) {
  const slug = (await params).slug;
  const category = await getCategory(slug);
  if (!category) return { title: 'No encontrado - AhorroYa' };

  return {
    title: `${category.name} - Compara precios | AhorroYa`,
    description: category.description,
    openGraph: {
      title: `${category.name} - AhorroYa`,
      description: category.description,
      locale: 'es_CO',
      siteName: 'AhorroYa',
    },
    robots: { index: true, follow: true },
    alternates: { canonical: `https://ahorroya.vercel.app/categoria/${category.slug}` },
  };
}

export default async function CategoryPage({ params }) {
  const slug = (await params).slug;
  const category = await getCategory(slug);
  if (!category) notFound();

  const products = await getProductsByCategory(slug);

  return (
    <>
      <CategoryJsonLd category={category} products={products} />
      <BreadcrumbJsonLd items={[
        { name: 'Inicio', url: '/' },
        { name: 'Categorías', url: '/categorias' },
        { name: category.name },
      ]} />
      <WebSiteJsonLd />
      <CategoryClient category={category} products={products} />
    </>
  );
}
