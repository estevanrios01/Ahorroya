import { NextResponse } from 'next/server';
import { db } from '@/services/database';
import { withTimeout } from '@/services/fallbackCatalog';

export async function GET() {
  const result = await withTimeout(db.scraping.listJobs({ limit: 10 }), 1800, 'promotions timeout').catch((error) => ({ error }));
  if (result.error) {
    return NextResponse.json({ success: true, degraded: true, data: { jobs: [], promotions: [] } });
  }
  return NextResponse.json({ success: true, data: { jobs: result.data } });
}
