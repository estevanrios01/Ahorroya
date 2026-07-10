import { NextResponse } from 'next/server';
import { barcodeSchema } from '@/lib/zod';

const mockCatalog = {
  '7702010000011': { name: 'Arroz Diana Premium', brand: 'Diana', category: 'Despensa' },
  '7702010000028': { name: 'Arroz Roa Fortificado', brand: 'Roa', category: 'Despensa' },
  '7702010000035': { name: 'Aceite Gourmet Familia', brand: 'Familia', category: 'Despensa' },
  '7702010000042': { name: 'Leche Entera Colanta', brand: 'Colanta', category: 'Lácteos' },
  '7702010000059': { name: 'Pan Bimbo Integral', brand: 'Bimbo', category: 'Panadería' },
  '7702010000066': { name: 'Acetaminofén MK 500mg', brand: 'MK', category: 'Farmacia' },
  '7702010000073': { name: 'Ibuprofeno Genfar 400mg', brand: 'Genfar', category: 'Farmacia' },
  '7702010000080': { name: 'Jabón Rey Barra', brand: 'Rey', category: 'Aseo' },
  '7702010000097': { name: 'Shampoo Pantene Pro-V', brand: 'Pantene', category: 'Aseo' },
  '7702010000103': { name: 'Café Sello Rojo 500g', brand: 'Sello Rojo', category: 'Despensa' },
};

export async function GET(request, { params }) {
  const { code } = await params;
  const parsed = barcodeSchema.safeParse({ code });
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Código de barras inválido' }, { status: 400 });
  }
  const product = mockCatalog[parsed.data.code] || null;
  if (!product) {
    return NextResponse.json({ success: false, error: 'Producto no encontrado para este código' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: { code: parsed.data.code, ...product } });
}
