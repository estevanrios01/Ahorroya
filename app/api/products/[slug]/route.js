import { NextResponse } from 'next/server';
import { db } from '@/services/database';
import { productSlugSchema } from '@/lib/zod';
import { getLiveFallbackProductBySlug } from '@/services/liveFallbackProducts';
import { withTimeout } from '@/services/fallbackCatalog';

export async function GET(request, { params }) {
  const { slug } = await params;
  const parsed = productSlugSchema.safeParse({ slug });
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Slug inválido' }, { status: 400 });
  }
  const { data: product } = await withTimeout(db.products.getBySlug(parsed.data.slug), 1800, 'product timeout').catch(() => ({ data: null }));
  if (!product) {
    const fallback = await getLiveFallbackProductBySlug(parsed.data.slug).catch(() => null);
    if (fallback) {
      return NextResponse.json({ success: true, degraded: true, data: { ...fallback, prices: fallback.store_products || [] } });
    }
    return NextResponse.json({ success: false, error: 'Producto no encontrado' }, { status: 404 });
  }
  const { data: prices } = await withTimeout(db.products.getPrices(product.id), 1800, 'prices timeout').catch(() => ({ data: [] }));
  return NextResponse.json({ success: true, data: { ...product, prices } });
}
