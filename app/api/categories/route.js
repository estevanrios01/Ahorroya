import { NextResponse } from 'next/server';
import { db } from '@/services/database';

export async function GET() {
  const result = await db.categories.list();
  if (result.error) {
    return NextResponse.json({ success: false, error: 'Error al consultar categorias' }, { status: 500 });
  }
  const withCounts = await Promise.all((result.data || []).map(async (cat) => {
    const count = await db.categories.getProductCount(cat.id);
    return { ...cat, productCount: count };
  }));
  return NextResponse.json({ success: true, data: withCounts });
}
