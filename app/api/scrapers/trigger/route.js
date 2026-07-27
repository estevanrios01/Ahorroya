import { NextResponse } from 'next/server';
import { enqueueJob, getSchedulerStatus } from '@/services/scrapers/scheduler';
import { RETAILER_CONFIGS } from '@/services/scrapers/config';
import { scraperTriggerSchema } from '@/lib/zod';
import { withErrorHandling } from '@/lib/api-handler';

async function handlePost(request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Autenticación requerida' }, { status: 401 });
  }
  // This triggers real scraping jobs against external retailer sites --
  // an operator action, not something any signed-up customer should be
  // able to do. proxy.js already forwards x-user-role from the verified
  // token's app_metadata.role, but nothing in the app ever checked it, so
  // any authenticated user could hit this. No user currently has
  // app_metadata.role set to "admin" (nothing in this codebase sets it),
  // which means this fails closed until that's configured on purpose in
  // Supabase, rather than the previous fail-open "any logged-in user" state.
  if (request.headers.get('x-user-role') !== 'admin') {
    return NextResponse.json({ success: false, error: 'Permisos insuficientes' }, { status: 403 });
  }
  const body = await request.json();
  const parsed = scraperTriggerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 });
  }
  const { store, query, category, limit } = parsed.data;
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

async function handleGet() {
  const status = getSchedulerStatus();
  return NextResponse.json({ success: true, data: status });
}

export const POST = withErrorHandling(handlePost);
export const GET = withErrorHandling(handleGet);
