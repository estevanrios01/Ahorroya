import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/services/database';

function getDb() {
  return supabaseAdmin || supabase;
}

async function count(table, apply = q => q) {
  const client = getDb();
  if (!client) return 0;
  const { count: total } = await apply(client.from(table).select('*', { count: 'exact', head: true }));
  return total || 0;
}

async function getInvalidEanCount() {
  const client = getDb();
  if (!client) return 0;
  const { data } = await client.from('master_products').select('ean').not('ean', 'is', null).limit(10000);
  return (data || []).filter(row => !/^\d{8,14}$/.test(row.ean || '')).length;
}

async function getDuplicateEanCount() {
  const client = getDb();
  if (!client) return 0;
  const { data } = await client.from('master_products').select('ean').not('ean', 'is', null).limit(10000);
  const seen = new Set();
  const duplicates = new Set();
  for (const row of data || []) {
    if (!row.ean) continue;
    if (seen.has(row.ean)) duplicates.add(row.ean);
    seen.add(row.ean);
  }
  return duplicates.size;
}

async function getBrokenImageSampleCount() {
  const client = getDb();
  if (!client) return 0;
  const { data } = await client.from('product_images').select('url').not('url', 'is', null).limit(25);
  let broken = 0;
  await Promise.all((data || []).map(async ({ url }) => {
    try {
      const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(3000) });
      if (!res.ok) broken++;
    } catch {
      broken++;
    }
  }));
  return broken;
}

export async function GET() {
  const client = getDb();
  if (!client) {
    return NextResponse.json({ success: false, error: 'Supabase no configurado' }, { status: 503 });
  }

  const [
    totalProducts,
    totalStores,
    totalPrices,
    totalBrands,
    totalCategories,
    missingBrand,
    missingCategory,
    anomalousPrices,
    invalidEan,
    duplicateEan,
    brokenImages,
    latestRun,
  ] = await Promise.all([
    count('master_products', q => q.eq('status', 'active')),
    count('stores', q => q.eq('status', 'active')),
    count('store_products', q => q.eq('available', true)),
    count('brands'),
    count('categories'),
    count('master_products', q => q.eq('status', 'active').is('brand_id', null)),
    count('master_products', q => q.eq('status', 'active').is('category_id', null)),
    count('store_products', q => q.or('price.lte.0,price.gt.1000000')),
    getInvalidEanCount(),
    getDuplicateEanCount(),
    getBrokenImageSampleCount(),
    client.from('scraping_runs').select('*').order('started_at', { ascending: false }).limit(1).maybeSingle(),
  ]);

  const issues = missingBrand + missingCategory + anomalousPrices + invalidEan + duplicateEan + brokenImages;
  const completenessBase = Math.max(totalProducts, 1);
  const completeness = Math.max(0, Math.round(100 - ((missingBrand + missingCategory) / completenessBase) * 100));
  const consistency = Math.max(0, Math.round(100 - ((duplicateEan + invalidEan + anomalousPrices) / Math.max(totalPrices + totalProducts, 1)) * 100));
  const freshness = latestRun.data?.finished_at && Date.now() - new Date(latestRun.data.finished_at).getTime() < 8 * 3600000 ? 100 : 0;
  const reliability = Math.max(0, Math.round(100 - (issues / Math.max(totalProducts + totalPrices, 1)) * 100));

  return NextResponse.json({
    success: true,
    data: {
      totalProducts,
      totalStores,
      totalPrices,
      totalBrands,
      totalCategories,
      quality: {
        completeness,
        consistency,
        reliability,
        freshness,
        overall: Math.round((completeness + consistency + reliability + freshness) / 4),
      },
      issues: {
        duplicates: duplicateEan,
        anomalousPrices,
        brokenImagesSample: brokenImages,
        invalidEan,
        missingCategory,
        missingBrand,
      },
      lastScraping: latestRun.data || null,
      timestamp: new Date().toISOString(),
    },
  });
}
