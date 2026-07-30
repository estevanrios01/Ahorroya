import { db } from '@/services/database';
import { getLiveFallbackProducts } from '@/services/liveFallbackProducts';
import { withTimeout } from '@/services/fallbackCatalog';
import { withErrorHandling, cachedJson } from '@/lib/api-handler';

async function handleGet() {
  const result = await withTimeout(db.brands.list(), 700, 'brands timeout').catch((error) => ({ error }));
  if (result.error || !result.data?.length) {
    const products = await withTimeout(getLiveFallbackProducts({ limit: 24 }), 4000, 'live fallback timeout').catch(() => []);
    const brands = [...new Map(products
      .map((product) => product.brands)
      .filter((brand) => brand?.name && brand?.slug)
      .map((brand) => [brand.slug, { ...brand, productCount: null }])).values()];
    return cachedJson({ success: true, degraded: true, data: brands });
  }
  const counts = await withTimeout(db.brands.getAllProductCounts(), 1200, 'brand counts timeout').catch(() => null);
  const withCounts = (result.data || []).map((brand) => ({ ...brand, productCount: counts ? (counts.get(brand.id) ?? 0) : null }));
  return cachedJson({ success: true, data: withCounts });
}

export const GET = withErrorHandling(handleGet);
