import { db } from '@/services/database';
import { fallbackCategories, withTimeout } from '@/services/fallbackCatalog';
import { withErrorHandling, cachedJson } from '@/lib/api-handler';

async function handleGet() {
  const result = await withTimeout(db.categories.list(), 700, 'categories timeout').catch((error) => ({ error }));
  if (result.error || !result.data?.length) {
    return cachedJson({
      success: true,
      degraded: true,
      data: fallbackCategories.map((category) => ({ ...category, productCount: null })),
    });
  }
  const counts = await withTimeout(db.categories.getAllProductCounts(), 1200, 'category counts timeout').catch(() => null);
  const withCounts = (result.data || []).map((cat) => ({ ...cat, productCount: counts ? (counts.get(cat.id) ?? 0) : null }));
  return cachedJson({ success: true, data: withCounts });
}

export const GET = withErrorHandling(handleGet);
