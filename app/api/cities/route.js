import { db } from '@/services/database';
import { fallbackCities, withTimeout } from '@/services/fallbackCatalog';
import { withErrorHandling, cachedJson } from '@/lib/api-handler';

async function handleGet() {
  const result = await withTimeout(db.cities.list(), 700, 'cities timeout').catch((error) => ({ error }));
  if (result.error || !result.data?.length) {
    return cachedJson({ success: true, degraded: true, data: fallbackCities });
  }
  return cachedJson({ success: true, data: result.data });
}

export const GET = withErrorHandling(handleGet);
