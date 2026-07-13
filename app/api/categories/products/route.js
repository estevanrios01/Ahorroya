import { NextResponse } from 'next/server';
import { getProductsByCategory } from '../../../../services/catalog/CatalogService';
import { getLiveFallbackProducts } from '../../../../services/liveFallbackProducts';
import { withTimeout } from '../../../../services/fallbackCatalog';

const CATEGORY_SEARCH_TERMS = {
  mercado: '',
  farmacia: 'acetaminofen',
  lacteos: 'leche',
  carnes: 'pollo',
  aseo: 'detergente',
  bebes: 'pañales',
  mascotas: 'perro',
  bebidas: 'agua',
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '24');

  if (!slug) {
    return NextResponse.json({ success: false, error: 'slug requerido' }, { status: 400 });
  }

  const { products } = await withTimeout(getProductsByCategory(slug, { page, limit }), 1800, 'category products timeout')
    .catch(() => ({ products: [] }));
  if (!products?.length) {
    const fallback = await getLiveFallbackProducts({ q: CATEGORY_SEARCH_TERMS[slug] || slug, limit }).catch(() => []);
    return NextResponse.json({ success: true, degraded: true, data: fallback });
  }
  return NextResponse.json({ success: true, data: products });
}
