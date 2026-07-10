import { NextResponse } from 'next/server';
import { db } from '@/services/database';

export async function GET() {
  const result = await db.brands.list();
  if (result.error) {
    return NextResponse.json({ success: false, error: 'Error al consultar marcas' }, { status: 500 });
  }
  const withCounts = await Promise.all((result.data || []).map(async (brand) => {
    const count = await db.brands.getProductCount(brand.id);
    return { ...brand, productCount: count };
  }));
  return NextResponse.json({ success: true, data: withCounts });
}
