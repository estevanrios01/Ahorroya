import { NextResponse } from 'next/server';
import { db } from '@/services/database';

export async function GET() {
  const result = await db.scraping.listJobs({ limit: 10 });
  if (result.error) {
    return NextResponse.json({ success: false, error: 'Error al consultar scraping' }, { status: 500 });
  }
  return NextResponse.json({ success: true, data: { jobs: result.data } });
}
