import { NextResponse } from 'next/server';
import { db } from '@/services/database';
import { storeSlugSchema } from '@/lib/zod';

export async function GET(request, { params }) {
  const { slug } = await params;
  const parsed = storeSlugSchema.safeParse({ slug });
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Slug inválido' }, { status: 400 });
  }
  const { data: store } = await db.stores.getBySlug(parsed.data.slug);
  if (!store) {
    return NextResponse.json({ success: false, error: 'Tienda no encontrada' }, { status: 404 });
  }
  const { data: branches } = await db.stores.getBranches(store.id);
  return NextResponse.json({ success: true, data: { ...store, branches } });
}
