import { NextResponse } from 'next/server';
import { db } from '@/services/database';
import { barcodeSchema } from '@/lib/zod';

export async function GET(request, { params }) {
  const { code } = await params;
  const parsed = barcodeSchema.safeParse({ code });
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Codigo de barras invalido' }, { status: 400 });
  }

  const result = await db.products.getByBarcode(parsed.data.code);
  if (result.error) {
    return NextResponse.json({ success: false, error: 'Error al consultar el catalogo' }, { status: 500 });
  }

  if (!result.data) {
    return NextResponse.json({ success: false, error: 'Producto no encontrado para este codigo' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: { code: parsed.data.code, ...result.data } });
}
