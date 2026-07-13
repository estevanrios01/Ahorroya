import { NextResponse } from 'next/server';
import { db } from '@/services/database';
import { searchSchema, sanitize } from '@/lib/zod';
import { getLiveFallbackProducts } from '@/services/liveFallbackProducts';

function withTimeout(promise, ms = 2500) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('products timeout')), ms)),
  ]);
}

async function degradedResponse({ page = 1, limit = 20, q = '', store = '', city = '' } = {}) {
  const fallback = await getLiveFallbackProducts({ q, limit, store }).catch(() => []);
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
    if (store) return degradedResponse({ page, limit, q: sanitizedQ, store, city });

    const result = await withTimeout(db.products.list({ q: sanitizedQ, category, city, page, limit }));
    if (result.error) return degradedResponse({ page, limit, q: sanitizedQ, city });

    return NextResponse.json({ success: true, data: result.data, pagination: result.pagination });
  } catch {
    return degradedResponse(fallbackContext);
  }
}
