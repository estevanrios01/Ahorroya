import { NextResponse } from 'next/server';
import { db } from '@/services/database';
import { searchSchema, sanitize } from '@/lib/zod';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const parsed = searchSchema.safeParse({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || undefined,
    page: searchParams.get('page') || 1,
    limit: searchParams.get('limit') || 20,
  });
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Parámetros inválidos', details: parsed.error.flatten() }, { status: 400 });
  }
  const { q, category, page, limit } = parsed.data;
  const sanitizedQ = sanitize(q);
  const result = await db.products.list({ q: sanitizedQ, category, page, limit });
  if (result.error) {
    return NextResponse.json({ success: false, error: 'Error al consultar productos' }, { status: 500 });
  }
  return NextResponse.json({ success: true, data: result.data, pagination: result.pagination });
}
