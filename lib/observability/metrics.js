const metrics = {
  httpRequests: { total: 0, byPath: {}, byStatus: {}, durations: [] },
  scrapers: { runs: {}, errors: {}, durations: {}, productsFound: {}, productsUpdated: {} },
  database: { queries: 0, errors: 0, avgDurationMs: 0 },
  errors: { total: 0, byType: {}, lastMinute: [] },
  users: { active: 0, total: 0 },
  jobs: { enqueued: 0, running: 0, completed: 0, failed: 0 },
};

const METRICS_WINDOW = 3600000;

export function trackHttpRequest(path, status, durationMs) {
  metrics.httpRequests.total++;
  metrics.httpRequests.byPath[path] = (metrics.httpRequests.byPath[path] || 0) + 1;
  metrics.httpRequests.byStatus[status] = (metrics.httpRequests.byStatus[status] || 0) + 1;
  metrics.httpRequests.durations.push({ path, status, durationMs, timestamp: Date.now() });
  const cutoff = Date.now() - METRICS_WINDOW;
  metrics.httpRequests.durations = metrics.httpRequests.durations.filter(d => d.timestamp > cutoff);
}

export function trackScraperRun(store, durationMs, productsFound, productsUpdated, error) {
  if (!metrics.scrapers.runs[store]) metrics.scrapers.runs[store] = [];
  metrics.scrapers.runs[store].push({ durationMs, productsFound, productsUpdated, error: !!error, timestamp: Date.now() });
  if (!metrics.scrapers.durations[store]) metrics.scrapers.durations[store] = [];
  metrics.scrapers.durations[store].push(durationMs);
  metrics.scrapers.productsFound[store] = (metrics.scrapers.productsFound[store] || 0) + productsFound;
  metrics.scrapers.productsUpdated[store] = (metrics.scrapers.productsUpdated[store] || 0) + productsUpdated;
  if (error) {
    if (!metrics.scrapers.errors[store]) metrics.scrapers.errors[store] = [];
    metrics.scrapers.errors[store].push({ message: error.message || error, timestamp: Date.now() });
  }
}

export function trackDbQuery(durationMs) {
  metrics.database.queries++;
  metrics.database.avgDurationMs = (metrics.database.avgDurationMs * (metrics.database.queries - 1) + durationMs) / metrics.database.queries;
}

export function trackDbError() {
  metrics.database.errors++;
}

export function trackError(type, error) {
  metrics.errors.total++;
  metrics.errors.byType[type] = (metrics.errors.byType[type] || 0) + 1;
  metrics.errors.lastMinute.push({ type, message: error?.message || error, timestamp: Date.now() });
  const cutoff = Date.now() - 60000;
  metrics.errors.lastMinute = metrics.errors.lastMinute.filter(e => e.timestamp > cutoff);
}

export function trackUserActivity(count) {
  metrics.users.active = count;
}

export function trackJob(type, action) {
  if (action === 'enqueue') metrics.jobs.enqueued++;
  else if (action === 'start') metrics.jobs.running++;
  else if (action === 'complete') { metrics.jobs.running--; metrics.jobs.completed++; }
  else if (action === 'fail') { metrics.jobs.running--; metrics.jobs.failed++; }
}

function avg(arr) {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function lastRun(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[arr.length - 1];
}

export function getMetrics() {
  const now = Date.now();
  const cutoff = now - METRICS_WINDOW;
  const recentDurations = metrics.httpRequests.durations.filter(d => d.timestamp > cutoff);
  const avgDuration = recentDurations.length > 0 ? avg(recentDurations.map(d => d.durationMs)) : 0;

  const scraperStatus = {};
  for (const store of Object.keys(metrics.scrapers.runs)) {
    const runs = metrics.scrapers.runs[store];
    const recent = runs.filter(r => r.timestamp > cutoff);
    const last = lastRun(runs);
    const errors = (metrics.scrapers.errors[store] || []).filter(e => e.timestamp > cutoff);
    scraperStatus[store] = {
      lastRun: last ? new Date(last.timestamp).toISOString() : null,
      lastDuration: last ? last.durationMs : null,
      lastStatus: last ? (last.error ? 'error' : 'success') : 'never',
      avgDuration: recent.length > 0 ? avg(recent.map(r => r.durationMs)) : null,
      recentErrors: errors.length,
      totalProducts: metrics.scrapers.productsFound[store] || 0,
      totalUpdates: metrics.scrapers.productsUpdated[store] || 0,
      recentRuns: recent.length,
    };
  }

  return {
    http: {
      total: metrics.httpRequests.total,
      avgDurationMs: Math.round(avgDuration),
      byStatus: metrics.httpRequests.byStatus,
      recentRequests: recentDurations.length,
    },
    database: {
      queries: metrics.database.queries,
      errors: metrics.database.errors,
      avgDurationMs: Math.round(metrics.database.avgDurationMs),
    },
    scrapers: scraperStatus,
    errors: {
      total: metrics.errors.total,
      byType: metrics.errors.byType,
      lastMinute: metrics.errors.lastMinute.length,
    },
    users: metrics.users,
    jobs: metrics.jobs,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
}

export function resetMetrics() {
  metrics.httpRequests = { total: 0, byPath: {}, byStatus: {}, durations: [] };
  metrics.database = { queries: 0, errors: 0, avgDurationMs: 0 };
  metrics.errors = { total: 0, byType: {}, lastMinute: [] };
}
