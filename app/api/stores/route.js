import { NextResponse } from 'next/server';
import { db } from '@/services/database';
import { fallbackStores, withTimeout } from '@/services/fallbackCatalog';

export async function GET() {
  const result = await withTimeout(db.stores.list({ limit: 200 }), 700, 'stores timeout').catch((error) => ({ error }));
  if (result.error || !result.data?.length) {
    return NextResponse.json({
      success: true,
      degraded: true,
      data: fallbackStores,
      pagination: { page: 1, limit: fallbackStores.length, total: fallbackStores.length, pages: 1 },
    });
  }
  return NextResponse.json({ success: true, data: result.data, pagination: result.pagination });
}
