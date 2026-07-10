import { NextResponse } from 'next/server';
import { getProductsByCategory } from '../../../../services/catalog/CatalogService';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '24');

  if (!slug) {
    return NextResponse.json({ success: false, error: 'slug requerido' }, { status: 400 });
  }

  const { products } = await getProductsByCategory(slug, { page, limit });
  return NextResponse.json({ success: true, data: products });
}
