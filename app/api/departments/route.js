import { NextResponse } from 'next/server';
import { db } from '@/services/database';
import { fallbackCities, withTimeout } from '@/services/fallbackCatalog';

export async function GET() {
  const result = await withTimeout(db.departments.list(), 1800, 'departments timeout').catch((error) => ({ error }));
  if (result.error) {
    const departments = [...new Map(fallbackCities.map((city) => [
      city.department,
      {
        name: city.department,
        slug: city.department.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      },
    ])).values()];
    return NextResponse.json({ success: true, degraded: true, data: departments });
  }
  return NextResponse.json({ success: true, data: result.data });
}
