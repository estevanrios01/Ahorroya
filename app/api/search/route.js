import { NextResponse } from 'next/server';
import { db } from '@/services/database';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || undefined;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const result = await db.products.search(q, { page, limit });
  if (result.error) {
    return NextResponse.json({ success: false, error: 'Error en la búsqueda' }, { status: 500 });
  }
  return NextResponse.json({ query: q, results: result.data, total: result.total });
}
