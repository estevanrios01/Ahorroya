import { NextResponse } from 'next/server';
import { db } from '@/services/database';
import { productSlugSchema } from '@/lib/zod';

export async function GET(request, { params }) {
  const { slug } = await params;
  const parsed = productSlugSchema.safeParse({ slug });
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Slug inválido' }, { status: 400 });
  }
  const { data: product } = await db.products.getBySlug(parsed.data.slug);
  if (!product) {
    return NextResponse.json({ success: false, error: 'Producto no encontrado' }, { status: 404 });
  }
  const { data: prices } = await db.products.getPrices(product.id);
  return NextResponse.json({ success: true, data: { ...product, prices } });
}
