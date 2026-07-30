import { NextResponse } from 'next/server';
import { db } from '@/services/database';
import { productSlugSchema } from '@/lib/zod';
import { getLiveFallbackProductBySlug } from '@/services/liveFallbackProducts';
import { withTimeout } from '@/services/fallbackCatalog';
import { withErrorHandling, cachedJson } from '@/lib/api-handler';

async function handleGet(request, { params }) {
  const { slug } = await params;
  const parsed = productSlugSchema.safeParse({ slug });
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Slug inválido' }, { status: 400 });
  }
  const { data: product } = await withTimeout(db.products.getBySlug(parsed.data.slug), 1800, 'product timeout').catch(() => ({ data: null }));
  if (!product) {
    // getLiveFallbackProductBySlug() internally races 4 parallel
    // getLiveFallbackProducts() calls, each of which can itself take up to
    // 7s (see app/api/products/route.js's degradedResponse() for the full
    // reasoning) -- unbounded here, a not-found slug (a stale link, a bot
    // probing a made-up URL -- both are routine on a public product route)
    // would hang this request for 7+ seconds before returning 404. 8000ms
    // matches the same function's existing bound in
    // app/producto/[id]/page.js, which needs the same headroom since it's
    // the same 4-parallel-call internal shape.
    const fallback = await withTimeout(getLiveFallbackProductBySlug(parsed.data.slug), 8000, 'live fallback timeout').catch(() => null);
    if (fallback) {
      return NextResponse.json({ success: true, degraded: true, data: { ...fallback, prices: fallback.store_products || [] } });
    }
    return NextResponse.json({ success: false, error: 'Producto no encontrado' }, { status: 404 });
  }
  const [{ data: prices }, { data: history }] = await Promise.all([
    withTimeout(db.products.getPrices(product.id), 1800, 'prices timeout').catch(() => ({ data: [] })),
    withTimeout(db.products.getPriceHistory(product.id), 1800, 'history timeout').catch(() => ({ data: [] })),
  ]);
  return cachedJson({ success: true, data: { ...product, prices, history } });
}

export const GET = withErrorHandling(handleGet);
