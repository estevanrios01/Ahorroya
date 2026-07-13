import { NextResponse } from 'next/server';
import { getMetrics } from '@/lib/observability/metrics';
import { runHealthCheck } from '@/lib/observability/health';
import { getAlertHistory } from '@/lib/observability/alerts';
import { getSchedulerStatus } from '@/services/scrapers/scheduler';
import { db, supabaseAdmin } from '@/services/database';
import { withTimeout } from '@/services/fallbackCatalog';

async function count(table, apply = q => q) {
  if (!supabaseAdmin) return 0;
  const { count: total } = await withTimeout(
    apply(supabaseAdmin.from(table).select('*', { count: 'planned', head: true })),
    1200,
    `${table} count timeout`
  );
  return total || 0;
}

async function getProductionSummary() {
  if (!supabaseAdmin) return null;
  const [products, prices, stores, branches, images, missingImages, latestPrice, latestRun, activeRuns, failedRuns, insertedRuns, priceChangeRuns, branchRows] = await Promise.allSettled([
    count('master_products', q => q.eq('status', 'active')),
    count('store_products', q => q.eq('available', true)),
    count('stores', q => q.eq('status', 'active')),
    count('branches', q => q.eq('status', 'active')),
    count('product_images'),
    count('master_products', q => q.eq('status', 'active').is('image', null)),
    withTimeout(supabaseAdmin.from('store_products').select('captured_at').eq('available', true).order('captured_at', { ascending: false }).limit(1).maybeSingle(), 1200, 'latest price timeout'),
    withTimeout(supabaseAdmin.from('scraping_runs').select('*').order('started_at', { ascending: false }).limit(1).maybeSingle(), 1200, 'latest run timeout'),
    count('scraping_jobs', q => q.eq('status', 'running')),
    count('scraping_jobs', q => q.eq('status', 'failed')),
    withTimeout(supabaseAdmin.from('scraping_runs').select('products_inserted').order('started_at', { ascending: false }).limit(25), 1200, 'inserted runs timeout'),
    withTimeout(supabaseAdmin.from('scraping_runs').select('price_changes').order('started_at', { ascending: false }).limit(25), 1200, 'price changes timeout'),
    withTimeout(supabaseAdmin.from('branches').select('city,department').eq('status', 'active'), 1200, 'branches timeout'),
  ]);

  const value = (result, fallback = 0) => result.status === 'fulfilled' ? result.value : fallback;
  const queryData = (result) => result.status === 'fulfilled' ? (result.value.data || []) : [];
  const latestPriceData = value(latestPrice, { data: null }).data;
  const latestRunData = value(latestRun, { data: null }).data;
  const branchData = queryData(branchRows);
  const cities = new Set(branchData.map((row) => row.city).filter(Boolean)).size;
  const departments = new Set(branchData.map((row) => row.department).filter(Boolean)).size;

  return {
    totalProducts: value(products),
    totalPrices: value(prices),
    totalStores: value(stores),
    totalBranches: value(branches),
    totalImages: value(images),
    productsWithoutImage: value(missingImages),
    cities,
    departments,
    lastUpdate: latestPriceData?.captured_at || latestRunData?.finished_at || null,
    activeScrapers: value(activeRuns),
    failedScrapers: value(failedRuns),
    newProducts: queryData(insertedRuns).reduce((sum, row) => sum + (row.products_inserted || 0), 0),
    detectedChanges: queryData(priceChangeRuns).reduce((sum, row) => sum + (row.price_changes || 0), 0),
  };
}

export async function GET() {
  const [metrics, health, alerts, scheduler, scrapingData, production] = await Promise.allSettled([
    Promise.resolve(getMetrics()),
    runHealthCheck(),
    Promise.resolve(getAlertHistory({ limit: 50 })),
    Promise.resolve(getSchedulerStatus()),
    withTimeout(db.scraping.listJobs({ limit: 100 }), 1500, 'scraping jobs timeout'),
    withTimeout(getProductionSummary(), 2500, 'production summary timeout'),
  ]);
  return NextResponse.json({
    success: true,
    data: {
      metrics: metrics.status === 'fulfilled' ? metrics.value : null,
      health: health.status === 'fulfilled' ? health.value : null,
      alerts: alerts.status === 'fulfilled' ? alerts.value : [],
      scheduler: scheduler.status === 'fulfilled' ? scheduler.value : null,
      recentJobs: scrapingData.status === 'fulfilled' ? (scrapingData.value.data || []) : [],
      production: production.status === 'fulfilled' ? production.value : null,
      timestamp: new Date().toISOString(),
    },
  });
}
