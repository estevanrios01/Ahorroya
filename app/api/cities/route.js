import { NextResponse } from 'next/server';
import { db } from '@/services/database';
import { fallbackCities, withTimeout } from '@/services/fallbackCatalog';

export async function GET() {
  const result = await withTimeout(db.cities.list(), 700, 'cities timeout').catch((error) => ({ error }));
  if (result.error || !result.data?.length) {
    return NextResponse.json({ success: true, degraded: true, data: fallbackCities });
  }
  return NextResponse.json({ success: true, data: result.data });
}
