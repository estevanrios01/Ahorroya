import { NextResponse } from 'next/server';
import { db } from '@/services/database';
import { getLiveFallbackProducts } from '@/services/liveFallbackProducts';
import { withTimeout } from '@/services/fallbackCatalog';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  const result = await withTimeout(db.products.search(q, { page, limit }), 1800, 'search timeout').catch((error) => ({ error }));
  if (result.error) {
    const fallback = await getLiveFallbackProducts({ q, limit }).catch(() => []);
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
