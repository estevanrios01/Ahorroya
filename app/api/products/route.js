import { NextResponse } from 'next/server';
import { db } from '@/services/database';
import { searchSchema, sanitize } from '@/lib/zod';
import { getLiveFallbackProducts } from '@/services/liveFallbackProducts';
import { getProductsByStore } from '@/services/catalog/CatalogService';
import { withTimeout } from '@/services/fallbackCatalog';
import { cachedJson } from '@/lib/api-handler';
import logger from '@/lib/logger';

async function degradedResponse({ page = 1, limit = 20, q = '', store = '', city = '' } = {}) {
  // getLiveFallbackProducts() races up to 14 external retailer endpoints with
  // per-source timeouts of 7-8s each (Promise.allSettled waits for the
  // slowest one to settle, not the average) -- without a bound here, a
  // single slow retailer turns this "degraded" fallback response itself into
  // an 8+ second wait on top of the already-timed-out primary query. Under a
  // traffic spike where the DB is briefly struggling, every concurrent
  // request would hit this same slow path at once, tying up serverless
  // function instances for far longer than a degraded response should ever
  // take. Capped to fail fast and return an honest empty result instead.
  const fallback = await withTimeout(getLiveFallbackProducts({ q, limit, store, page }), 4000, 'live fallback timeout').catch(() => []);
  return NextResponse.json({
    success: true,
    degraded: true,
    cityVerified: !city,
    notice: city ? `La base por ciudad no respondió; estos resultados en vivo no están filtrados por ${city}.` : undefined,
    data: fallback,
    pagination: { page, limit, total: fallback.length, pages: fallback.length ? 1 : 0 },
  });
}

export async function GET(request) {
  let fallbackContext = {};
  try {
    const { searchParams } = new URL(request.url);
    const parsed = searchSchema.safeParse({
      q: searchParams.get('q') || '',
      category: searchParams.get('category') || undefined,
      city: searchParams.get('city') || undefined,
      store: searchParams.get('store') || undefined,
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Parametros invalidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { q, category, city, store, page, limit } = parsed.data;
    const sanitizedQ = sanitize(q);
    fallbackContext = { page, limit, q: sanitizedQ, store, city };
    if (store && !city && !sanitizedQ) {
      const storeResult = await withTimeout(getProductsByStore(store, { page, limit }), 1500, 'products timeout').catch(() => null);
      if (storeResult?.products?.length) {
        return cachedJson({
          success: true,
          data: storeResult.products,
          pagination: storeResult.pagination,
        });
      }
      return degradedResponse({ page, limit, store });
    }

    if (store) return degradedResponse({ page, limit, q: sanitizedQ, store, city });

    const result = await withTimeout(db.products.list({ q: sanitizedQ, category, city, page, limit }), 2500, 'products timeout');
    if (result.error) return degradedResponse({ page, limit, q: sanitizedQ, city });

    return cachedJson({ success: true, data: result.data, pagination: result.pagination });
  } catch (error) {
    await logger.error({ err: error?.message, path: '/api/products' }, 'Unhandled error, falling back to degraded response');
    return degradedResponse(fallbackContext);
  }
}
