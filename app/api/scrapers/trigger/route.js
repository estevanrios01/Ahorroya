import { NextResponse } from 'next/server';
import { enqueueJob, getSchedulerStatus } from '@/services/scrapers/scheduler';
import { RETAILER_CONFIGS, createScraper } from '@/services/scrapers/config';

const PARSERS = {};

export async function POST(request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Autenticación requerida' }, { status: 401 });
  }
  const body = await request.json();
  const { store, query, category, limit } = body;
  if (store && !RETAILER_CONFIGS.find(c => c.name === store)) {
    return NextResponse.json({ success: false, error: `Comercio no válido: ${store}` }, { status: 400 });
  }
  if (store) {
    enqueueJob(store, { query, category, limit });
    return NextResponse.json({ success: true, data: { message: `Scraper ${store} encolado`, store } });
  }
  for (const config of RETAILER_CONFIGS) {
    enqueueJob(config.name, { query, category, limit });
  }
  return NextResponse.json({ success: true, data: { message: `Scrapers encolados: ${RETAILER_CONFIGS.length}` } });
}

export async function GET() {
  const status = getSchedulerStatus();
  return NextResponse.json({ success: true, data: status });
}
