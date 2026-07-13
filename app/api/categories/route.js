import { NextResponse } from 'next/server';
import { db } from '@/services/database';
import { fallbackCategories, withTimeout } from '@/services/fallbackCatalog';

export async function GET() {
  const result = await withTimeout(db.categories.list(), 1800, 'categories timeout').catch((error) => ({ error }));
  if (result.error) {
    return NextResponse.json({
      success: true,
      degraded: true,
      data: fallbackCategories.map((category) => ({ ...category, productCount: null })),
    });
  }
  const withCounts = await Promise.all((result.data || []).map(async (cat) => {
    const count = await withTimeout(db.categories.getProductCount(cat.id), 900, 'category count timeout').catch(() => null);
    return { ...cat, productCount: count };
  }));
  return NextResponse.json({ success: true, data: withCounts });
}
