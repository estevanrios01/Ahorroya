import { db } from '@/services/database';
import { fallbackCities, withTimeout } from '@/services/fallbackCatalog';
import { withErrorHandling, cachedJson } from '@/lib/api-handler';

async function handleGet() {
  const result = await withTimeout(db.departments.list(), 700, 'departments timeout').catch((error) => ({ error }));
  if (result.error || !result.data?.length) {
    const departments = [...new Map(fallbackCities.map((city) => [
      city.department,
      {
        name: city.department,
        slug: city.department.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      },
    ])).values()];
    return cachedJson({ success: true, degraded: true, data: departments });
  }
  return cachedJson({ success: true, data: result.data });
}

export const GET = withErrorHandling(handleGet);
