import { NextResponse } from 'next/server';
import { db } from '@/services/database';
import { getLiveFallbackProducts } from '@/services/liveFallbackProducts';
import { withTimeout } from '@/services/fallbackCatalog';
import { withErrorHandling } from '@/lib/api-handler';
import { searchSchema, sanitize } from '@/lib/zod';

async function handleGet(request) {
  const { searchParams } = new URL(request.url);
  const parsed = searchSchema.safeParse({
    q: searchParams.get('q') || '',
    page: searchParams.get('page') || 1,
    limit: searchParams.get('limit') || 20,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Parametros invalidos', details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { page, limit } = parsed.data;
  const q = sanitize(parsed.data.q);

  const result = await withTimeout(db.products.search(q, { page, limit }), 900, 'search timeout').catch((error) => ({ error }));
  if (result.error || (q && !result.data?.length)) {
    const fallback = await getLiveFallbackProducts({ q, limit, page }).catch(() => []);
    return NextResponse.json({
      success: true,
      degraded: true,
      query: q,
      results: fallback,
      total: fallback.length,
    });
  }

  return NextResponse.json({ success: true, query: q, results: result.data, total: result.total });
}

export const GET = withErrorHandling(handleGet);
