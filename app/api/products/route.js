import { NextResponse } from 'next/server';
import { db } from '@/services/database';
import { searchSchema, sanitize } from '@/lib/zod';
import { getLiveFallbackProducts } from '@/services/liveFallbackProducts';

async function degradedResponse({ page = 1, limit = 20, q = '' } = {}) {
  const fallback = await getLiveFallbackProducts({ q, limit }).catch(() => []);
  return NextResponse.json({
    success: true,
    degraded: true,
    data: fallback,
    pagination: { page, limit, total: fallback.length, pages: fallback.length ? 1 : 0 },
  });
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = searchSchema.safeParse({
      q: searchParams.get('q') || '',
      category: searchParams.get('category') || undefined,
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

    const { q, category, city, page, limit } = parsed.data;
    const sanitizedQ = sanitize(q);
    const result = await db.products.list({ q: sanitizedQ, category, city, page, limit });
    if (result.error) return degradedResponse({ page, limit, q: sanitizedQ });

    return NextResponse.json({ success: true, data: result.data, pagination: result.pagination });
  } catch {
    return degradedResponse();
  }
}
