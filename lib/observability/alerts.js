import logger from './logger';
import { getMetrics } from './metrics';

const alertRules = [
  { name: 'scraper_down', check: (m) => { const down = Object.entries(m.scrapers).filter(([, s]) => s.status === 'error' || s.lastRun === null); return down.length > 0 ? { level: 'critical', detail: `Scrapers caídos: ${down.map(([k]) => k).join(', ')}` } : null; } },
  { name: 'api_latency_high', check: (m) => m.http.avgDurationMs > 2000 ? { level: 'warning', detail: `Latencia API alta: ${m.http.avgDurationMs}ms` } : null },
  { name: 'db_errors', check: (m) => m.database.errors > 10 ? { level: 'critical', detail: `Errores de BD: ${m.database.errors}` } : null },
  { name: 'job_failures', check: (m) => m.jobs.failed > 5 ? { level: 'warning', detail: `Jobs fallidos: ${m.jobs.failed}` } : null },
  { name: 'error_spike', check: (m) => m.errors.lastMinute > 20 ? { level: 'critical', detail: `Pico de errores: ${m.errors.lastMinute} en 1 min` } : null },
];

const alertHistory = [];

export function evaluateAlerts() {
  const metrics = getMetrics();
  const alerts = [];
  for (const rule of alertRules) {
    try {
      const result = rule.check(metrics);
      if (result) {
        alerts.push({ ...result, rule: rule.name, timestamp: new Date().toISOString() });
        alertHistory.push({ ...result, rule: rule.name, timestamp: new Date().toISOString() });
      }
    } catch (e) {
      logger.error(`Error evaluando alerta ${rule.name}`, { error: e.message });
    }
  }
  const cutoff = Date.now() - 86400000;
  while (alertHistory.length > 0 && new Date(alertHistory[0].timestamp).getTime() < cutoff) {
    alertHistory.shift();
  }
  return alerts;
}

export function getAlertHistory({ limit = 100 } = {}) {
  return alertHistory.slice(-limit).reverse();
}
