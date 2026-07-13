import { notFound } from 'next/navigation';
import { getCategoryBySlug, getProductsByCategory } from '../../../services/catalog/CatalogService';
import { getFallbackCategory, withTimeout } from '../../../services/fallbackCatalog';
import { getLiveFallbackProducts } from '../../../services/liveFallbackProducts';
import CategoryClient from './CategoryClient';
import { CategoryJsonLd, BreadcrumbJsonLd, WebSiteJsonLd } from '../../../components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahorroya.vercel.app';
const CATEGORY_SEARCH_TERMS = {
  mercado: 'arroz',
  farmacia: 'acetaminofen',
  lacteos: 'leche',
  carnes: 'pollo',
  aseo: 'detergente',
  bebes: 'panales',
  mascotas: 'alimento perro',
  bebidas: 'agua',
};

const CATEGORY_INCLUDE_TERMS = {
  mercado: ['arroz', 'aceite', 'cafe', 'azucar', 'pasta', 'grano', 'lenteja', 'frijol'],
  farmacia: ['acetaminofen', 'ibuprofeno', 'vitamina', 'medicamento', 'pastilla', 'capsula'],
  lacteos: ['leche', 'queso', 'yogur', 'yoghurt', 'kumis', 'mantequilla', 'crema'],
  carnes: ['pollo', 'carne', 'res', 'cerdo', 'huevo', 'salchicha', 'jamon'],
  aseo: ['detergente', 'jabon', 'limpiador', 'lavaloza', 'cloro', 'suavizante'],
  bebes: ['panal', 'panales', 'formula', 'bebe', 'panito', 'panitos'],
  mascotas: ['perro', 'gato', 'mascota', 'concentrado'],
  bebidas: ['agua', 'gaseosa', 'jugo', 'bebida', 'nectar', 'te '],
};

const CATEGORY_EXCLUDE_TERMS = {
  lacteos: ['extractor', 'materna', 'biberon', 'tetero', 'chocolatina'],
  carnes: ['mascota', 'perro', 'gato'],
  farmacia: ['juguete'],
  bebes: ['pinata', 'pinatas', 'cambiador', 'pared', 'diorama', 'aventuras'],
};

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

async function loadCategory(slug) {
  const result = await withTimeout(getCategoryBySlug(slug), 500, 'category timeout').catch(() => ({ category: null }));
  return result.category || getFallbackCategory(slug);
}

async function loadCategoryProducts(slug) {
  const result = await withTimeout(getProductsByCategory(slug), 700, 'category products timeout')
    .catch(() => ({ products: [], pagination: { total: 0 } }));

  if (result.products?.length) {
    return {
      products: result.products,
      pagination: result.pagination || { total: result.products.length },
      degraded: false,
    };
  }

  const seen = new Set();
  const terms = CATEGORY_INCLUDE_TERMS[slug] || [slug];
  const excludedTerms = CATEGORY_EXCLUDE_TERMS[slug] || [];
  const liveProducts = (await getLiveFallbackProducts({
    q: CATEGORY_SEARCH_TERMS[slug] || slug,
    limit: 24,
  }).catch(() => []))
    .filter((product) => {
      const key = product.id || product.slug;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      const text = normalizeText(`${product.name || ''} ${product.brands?.name || ''}`);
      return terms.some((term) => text.includes(term)) && !excludedTerms.some((term) => text.includes(term));
    })
    .slice(0, 24);

  return {
    products: liveProducts,
    pagination: { total: liveProducts.length },
    degraded: true,
  };
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

  const { products, pagination, degraded } = await loadCategoryProducts(slug);
  const visibleProducts = products || [];
  const totalProducts = pagination?.total || category.productCount || visibleProducts.length || 0;

  return (
    <>
      <CategoryJsonLd category={category} products={visibleProducts || []} />
      <BreadcrumbJsonLd items={[
        { name: 'Inicio', url: '/' },
        { name: 'Categorias', url: '/categorias' },
        { name: category.name },
      ]} />
      <WebSiteJsonLd />
      <CategoryClient category={category} initialProducts={visibleProducts || []} initialTotal={totalProducts} degraded={degraded} />
    </>
  );
}
