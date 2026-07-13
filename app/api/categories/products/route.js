import { NextResponse } from 'next/server';
import { getProductsByCategory } from '../../../../services/catalog/CatalogService';
import { getLiveFallbackProducts } from '../../../../services/liveFallbackProducts';
import { withTimeout } from '../../../../services/fallbackCatalog';

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
  bebes: ['panal', 'pañal', 'formula', 'bebe', 'pañito', 'panito'],
  mascotas: ['perro', 'gato', 'mascota', 'concentrado'],
  bebidas: ['agua', 'gaseosa', 'jugo', 'bebida', 'nectar', 'te '],
};

const CATEGORY_EXCLUDE_TERMS = {
  lacteos: ['extractor', 'materna', 'biberon', 'tetero', 'chocolatina'],
  carnes: ['mascota', 'perro', 'gato'],
  farmacia: ['juguete'],
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
    const seen = new Set();
    const terms = CATEGORY_INCLUDE_TERMS[slug] || [slug];
    const excludedTerms = CATEGORY_EXCLUDE_TERMS[slug] || [];
    const fallback = (await getLiveFallbackProducts({
      q: CATEGORY_SEARCH_TERMS[slug] || slug,
      limit,
    }).catch(() => []))
      .filter((product) => {
        const key = product.id || product.slug;
        if (!key || seen.has(key)) return false;
        seen.add(key);
        const text = `${product.name || ''} ${product.brands?.name || ''}`.toLowerCase();
        return terms.some((term) => text.includes(term)) && !excludedTerms.some((term) => text.includes(term));
      })
      .slice(0, limit);
    return NextResponse.json({ success: true, degraded: true, data: fallback });
  }
  return NextResponse.json({ success: true, data: products });
}
