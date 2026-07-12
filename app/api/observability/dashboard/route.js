import { NextResponse } from 'next/server';
import { getMetrics } from '@/lib/observability/metrics';
import { runHealthCheck } from '@/lib/observability/health';
import { getAlertHistory } from '@/lib/observability/alerts';
import { getSchedulerStatus } from '@/services/scrapers/scheduler';
import { db, supabaseAdmin } from '@/services/database';

async function count(table, apply = q => q) {
  if (!supabaseAdmin) return 0;
  const { count: total } = await apply(supabaseAdmin.from(table).select('*', { count: 'exact', head: true }));
  return total || 0;
}

async function getProductionSummary() {
  if (!supabaseAdmin) return null;
  const [products, prices, stores, branches, images, missingImages, latestPrice, latestRun, activeRuns, failedRuns, insertedRuns, priceChangeRuns, branchRows] = await Promise.all([
    count('master_products', q => q.eq('status', 'active')),
    count('store_products', q => q.eq('available', true)),
    count('stores', q => q.eq('status', 'active')),
    count('branches', q => q.eq('status', 'active')),
    count('product_images'),
    count('master_products', q => q.eq('status', 'active').is('image', null)),
    supabaseAdmin.from('store_products').select('captured_at').eq('available', true).order('captured_at', { ascending: false }).limit(1).maybeSingle(),
    supabaseAdmin.from('scraping_runs').select('*').order('started_at', { ascending: false }).limit(1).maybeSingle(),
    count('scraping_jobs', q => q.eq('status', 'running')),
    count('scraping_jobs', q => q.eq('status', 'failed')),
    supabaseAdmin.from('scraping_runs').select('products_inserted').order('started_at', { ascending: false }).limit(25),
    supabaseAdmin.from('scraping_runs').select('price_changes').order('started_at', { ascending: false }).limit(25),
    supabaseAdmin.from('branches').select('city,department').eq('status', 'active'),
  ]);

  const cities = new Set((branchRows.data || []).map((row) => row.city).filter(Boolean)).size;
  const departments = new Set((branchRows.data || []).map((row) => row.department).filter(Boolean)).size;

  return {
    totalProducts: products,
    totalPrices: prices,
    totalStores: stores,
    totalBranches: branches,
    totalImages: images,
    productsWithoutImage: missingImages,
    cities,
    departments,
    lastUpdate: latestPrice.data?.captured_at || latestRun.data?.finished_at || null,
    activeScrapers: activeRuns,
    failedScrapers: failedRuns,
    newProducts: (insertedRuns.data || []).reduce((sum, row) => sum + (row.products_inserted || 0), 0),
    detectedChanges: (priceChangeRuns.data || []).reduce((sum, row) => sum + (row.price_changes || 0), 0),
  };
}

export async function GET() {
  const [metrics, health, alerts, scheduler, scrapingData, production] = await Promise.allSettled([
    Promise.resolve(getMetrics()),
    runHealthCheck(),
    Promise.resolve(getAlertHistory({ limit: 50 })),
    Promise.resolve(getSchedulerStatus()),
    db.scraping.listJobs({ limit: 100 }),
    getProductionSummary(),
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
