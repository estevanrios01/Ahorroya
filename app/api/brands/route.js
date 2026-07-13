import { NextResponse } from 'next/server';
import { db } from '@/services/database';
import { getLiveFallbackProducts } from '@/services/liveFallbackProducts';
import { withTimeout } from '@/services/fallbackCatalog';

export async function GET() {
  const result = await withTimeout(db.brands.list(), 700, 'brands timeout').catch((error) => ({ error }));
  if (result.error || !result.data?.length) {
    const products = await getLiveFallbackProducts({ limit: 24 }).catch(() => []);
    const brands = [...new Map(products
      .map((product) => product.brands)
      .filter((brand) => brand?.name && brand?.slug)
      .map((brand) => [brand.slug, { ...brand, productCount: null }])).values()];
    return NextResponse.json({ success: true, degraded: true, data: brands });
  }
  const withCounts = await Promise.all((result.data || []).map(async (brand) => {
    const count = await withTimeout(db.brands.getProductCount(brand.id), 900, 'brand count timeout').catch(() => null);
    return { ...brand, productCount: count };
  }));
  return NextResponse.json({ success: true, data: withCounts });
}
