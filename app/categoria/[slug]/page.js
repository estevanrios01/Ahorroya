import { notFound } from 'next/navigation';
import { getCategoryBySlug, getProductsByCategory } from '../../../services/catalog/CatalogService';
import { getFallbackCategory, withTimeout } from '../../../services/fallbackCatalog';
import CategoryClient from './CategoryClient';
import { CategoryJsonLd, BreadcrumbJsonLd, WebSiteJsonLd } from '../../../components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahorroya.vercel.app';

async function loadCategory(slug) {
  const result = await withTimeout(getCategoryBySlug(slug), 800, 'category timeout').catch(() => ({ category: null }));
  return result.category || getFallbackCategory(slug);
}

export async function generateMetadata({ params }) {
  const slug = (await params).slug;
  const category = getFallbackCategory(slug) || await loadCategory(slug);
  if (!category) return { title: 'No encontrado - AhorroYa' };

  return {
    metadataBase: new URL(SITE_URL),
    title: `${category.name} - Compara precios | AhorroYa`,
    description: category.description || `Encuentra los mejores precios en ${category.name}. Compara productos de supermercados y farmacias.`,
    openGraph: {
      title: `${category.name} - AhorroYa`,
      description: category.description || `Compara precios en ${category.name}.`,
      locale: 'es_CO',
      siteName: 'AhorroYa',
    },
    robots: { index: true, follow: true },
    alternates: { canonical: `${SITE_URL}/categoria/${category.slug}` },
  };
}

export default async function CategoryPage({ params }) {
  const slug = (await params).slug;
  const category = await loadCategory(slug);
  if (!category) notFound();

  const { products, pagination } = await withTimeout(getProductsByCategory(slug), 250, 'category products timeout').catch(() => ({ products: [], pagination: { total: 0 } }));
  const visibleProducts = products || [];
  const totalProducts = pagination?.total || category.productCount || visibleProducts.length || 0;

  return (
    <>
      <CategoryJsonLd category={category} products={visibleProducts || []} />
      <BreadcrumbJsonLd items={[
        { name: 'Inicio', url: '/' },
        { name: 'Categorías', url: '/categorias' },
        { name: category.name },
      ]} />
      <WebSiteJsonLd />
      <CategoryClient category={category} initialProducts={visibleProducts || []} initialTotal={totalProducts} degraded={!products?.length} />
    </>
  );
}
