import { NextResponse } from 'next/server';
import { db } from '@/services/database';
import { storeSlugSchema } from '@/lib/zod';
import { getFallbackStore, withTimeout } from '@/services/fallbackCatalog';

export async function GET(request, { params }) {
  const { slug } = await params;
  const parsed = storeSlugSchema.safeParse({ slug });
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Slug inválido' }, { status: 400 });
  }
  const { data: store } = await withTimeout(db.stores.getBySlug(parsed.data.slug), 1800, 'store timeout').catch(() => ({ data: null }));
  if (!store) {
    const fallback = getFallbackStore(parsed.data.slug);
    if (fallback) return NextResponse.json({ success: true, degraded: true, data: { ...fallback, branches: [] } });
    return NextResponse.json({ success: false, error: 'Tienda no encontrada' }, { status: 404 });
  }
  const { data: branches } = await withTimeout(db.stores.getBranches(store.id), 1200, 'branches timeout').catch(() => ({ data: [] }));
  return NextResponse.json({ success: true, data: { ...store, branches } });
}
