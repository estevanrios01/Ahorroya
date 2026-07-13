import { supabase, supabaseAdmin } from '../../services/database';

function withTimeout(promise, ms = 1500) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('health timeout')), ms)),
  ]);
}

const healthStatus = {
  api: { status: 'healthy', lastCheck: null },
  database: { status: 'unknown', lastCheck: null, latencyMs: null },
  supabase: { status: 'unknown', lastCheck: null, latencyMs: null },
  redis: { status: 'unknown', lastCheck: null },
  scrapers: {},
  workers: { status: 'unknown', lastCheck: null },
};

async function checkSupabase() {
  const start = Date.now();
  try {
    if (!supabase) throw new Error('Supabase client not configured');
    const { error } = await withTimeout(supabase.from('master_products').select('id', { count: 'planned', head: true }).limit(1));
    const latency = Date.now() - start;
    healthStatus.supabase = { status: error ? 'degraded' : 'healthy', lastCheck: new Date().toISOString(), latencyMs: latency };
    return !error;
  } catch (e) {
    healthStatus.supabase = { status: 'down', lastCheck: new Date().toISOString(), latencyMs: Date.now() - start, error: e.message };
    return false;
  }
}

async function checkDatabase() {
  if (!supabaseAdmin) {
    healthStatus.database = { status: 'unknown', lastCheck: new Date().toISOString(), latencyMs: null };
    return false;
  }
  const start = Date.now();
  try {
    const { error } = await withTimeout(supabaseAdmin.from('stores').select('id', { count: 'planned', head: true }).limit(1));
    const latency = Date.now() - start;
    healthStatus.database = { status: error ? 'degraded' : 'healthy', lastCheck: new Date().toISOString(), latencyMs: latency };
    return !error;
  } catch (e) {
    healthStatus.database = { status: 'down', lastCheck: new Date().toISOString(), latencyMs: Date.now() - start, error: e.message };
    return false;
  }
}

async function checkScrapers() {
  try {
    if (!supabase) throw new Error('Supabase client not configured');
    const { data } = await withTimeout(
      supabase.from('scraping_jobs').select('store, status, updated_at').order('created_at', { ascending: false }).limit(50),
      1500
    );
    const storeStatus = {};
    for (const job of data || []) {
      if (!storeStatus[job.store] || new Date(job.updated_at) > new Date(storeStatus[job.store].updated_at)) {
        storeStatus[job.store] = { status: job.status, updatedAt: job.updated_at };
      }
    }
    for (const store of ['exito', 'd1', 'jumbo', 'ara', 'carulla', 'olimpica', 'makro', 'farmatodo', 'cruz-verde', 'la-rebaja']) {
      const s = storeStatus[store];
      const sinceLastRun = s ? (Date.now() - new Date(s.updatedAt).getTime()) / 3600000 : 999;
      healthStatus.scrapers[store] = {
        status: !s ? 'never' : sinceLastRun > 24 ? 'stale' : s.status === 'failed' ? 'error' : 'healthy',
        lastRun: s?.updatedAt || null,
        lastStatus: s?.status || null,
      };
    }
  } catch {
    // ignore
  }
}

export async function runHealthCheck() {
  const results = await Promise.allSettled([checkSupabase(), checkDatabase(), checkScrapers()]);
  const allOk = results.every(r => r.status === 'fulfilled' && r.value !== false);
  return {
    status: allOk ? 'healthy' : 'degraded',
    checks: {
      api: { status: 'healthy', lastCheck: new Date().toISOString() },
      supabase: healthStatus.supabase,
      database: healthStatus.database,
      scrapers: healthStatus.scrapers,
    },
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
}

export function getHealth() {
  return healthStatus;
}
