import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/services/database';
import { withTimeout } from '@/services/fallbackCatalog';

function getDb() {
  return supabaseAdmin || supabase;
}

async function safeCount(client, table, apply = (query) => query) {
  try {
    const { count, error } = await withTimeout(
      apply(client.from(table).select('*', { count: 'planned', head: true })),
      1200,
      `${table} count timeout`
    );
    if (error) return 0;
    return count || 0;
  } catch {
    return 0;
  }
}

async function getLatestPriceCapturedAt(client) {
  try {
    const { data } = await withTimeout(
      client.from('store_products').select('captured_at').order('captured_at', { ascending: false }).limit(1).maybeSingle(),
      1200,
      'latest price timeout'
    );
    return data?.captured_at || null;
  } catch {
    return null;
  }
}

function computeQuality(summary) {
  const issues = summary.issues || {};
  const totalProducts = Number(summary.totalProducts || 0);
  const totalPrices = Number(summary.totalPrices || 0);
  const missingBrand = Number(issues.missingBrand || 0);
  const missingCategory = Number(issues.missingCategory || 0);
  const anomalousPrices = Number(issues.anomalousPrices || 0);
  const imageIssues = Number(issues.imageIssues || 0);
  const totalIssues = missingBrand + missingCategory + anomalousPrices + imageIssues;
  const freshness = summary.latestPriceCapturedAt && Date.now() - new Date(summary.latestPriceCapturedAt).getTime() < 8 * 3600000 ? 100 : 0;
  const completeness = Math.max(0, Math.round(100 - ((missingBrand + missingCategory) / Math.max(totalProducts, 1)) * 100));
  const consistency = Math.max(0, Math.round(100 - (anomalousPrices / Math.max(totalPrices, 1)) * 100));
  const reliability = Math.max(0, Math.round(100 - (totalIssues / Math.max(totalProducts + totalPrices, 1)) * 100));

  return {
    completeness,
    consistency,
    reliability,
    freshness,
    overall: Math.round((completeness + consistency + reliability + freshness) / 4),
  };
}

export async function GET() {
  const client = getDb();
  if (!client) {
    return NextResponse.json({ success: false, error: 'Supabase no configurado' }, { status: 503 });
  }

  const { data: cached } = await withTimeout(
    client.from('operational_metrics').select('payload, updated_at').eq('key', 'quality_report').maybeSingle(),
    1200,
    'quality cache timeout'
  ).catch(() => ({ data: null }));

  if (cached?.payload) {
    const summary = cached.payload;
    return NextResponse.json({
      success: true,
      data: {
        ...summary,
        quality: computeQuality(summary),
        metricsUpdatedAt: cached.updated_at,
        timestamp: new Date().toISOString(),
      },
    });
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
    imageIssues,
    latestPriceCapturedAt,
  ] = await Promise.all([
    safeCount(client, 'master_products', (query) => query.eq('status', 'active')),
    safeCount(client, 'stores', (query) => query.eq('status', 'active')),
    safeCount(client, 'store_products', (query) => query.eq('available', true)),
    safeCount(client, 'brands'),
    safeCount(client, 'categories'),
    safeCount(client, 'master_products', (query) => query.eq('status', 'active').is('brand_id', null)),
    safeCount(client, 'master_products', (query) => query.eq('status', 'active').is('category_id', null)),
    safeCount(client, 'store_products', (query) => query.or('price.lte.0,price.gt.1000000')),
    safeCount(client, 'product_images', (query) => query.is('url', null)),
    getLatestPriceCapturedAt(client),
  ]);

  const summary = {
    totalProducts,
    totalStores,
    totalPrices,
    totalBrands,
    totalCategories,
    latestPriceCapturedAt,
    issues: {
      duplicates: 0,
      anomalousPrices,
      imageIssues,
      invalidEan: 0,
      missingCategory,
      missingBrand,
    },
    lastScraping: null,
  };

  return NextResponse.json({
    success: true,
    data: {
      ...summary,
      quality: computeQuality(summary),
      timestamp: new Date().toISOString(),
    },
  });
}
