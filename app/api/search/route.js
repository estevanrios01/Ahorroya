import { NextResponse } from 'next/server';
import { db } from '@/services/database';
import { getLiveFallbackProducts } from '@/services/liveFallbackProducts';
import { withTimeout } from '@/services/fallbackCatalog';
import { withErrorHandling, cachedJson } from '@/lib/api-handler';
import { searchSchema, sanitize } from '@/lib/zod';

async function handleGet(request) {
  const { searchParams } = new URL(request.url);
  const parsed = searchSchema.safeParse({
    q: searchParams.get('q') || '',
    city: searchParams.get('city') || undefined,
    page: searchParams.get('page') || 1,
    limit: searchParams.get('limit') || 20,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Parametros invalidos', details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { page, limit, city } = parsed.data;
  const q = sanitize(parsed.data.q);

  // Delegates to the same db.products.list() /api/products uses (city-aware
  // via search_products_by_city, includes store_products pricing) instead of
  // the old db.products.search(), which ignored `city` entirely and never
  // joined pricing/store data even on a successful (non-degraded) response --
  // worse than its own fallback branch.
  const result = await withTimeout(db.products.list({ q, city, page, limit }), 2500, 'search timeout').catch((error) => ({ error }));
  if (result.error || (q && !result.data?.length)) {
    const fallback = await getLiveFallbackProducts({ q, limit, page }).catch(() => []);
    return NextResponse.json({
      success: true,
      degraded: true,
      cityVerified: !city,
      query: q,
      results: fallback,
      total: fallback.length,
    });
  }

  return cachedJson({ success: true, query: q, results: result.data, total: result.pagination?.total ?? result.data.length });
}

export const GET = withErrorHandling(handleGet);
