import { NextResponse } from 'next/server';
import { getMetrics } from '@/lib/observability/metrics';
import { runHealthCheck } from '@/lib/observability/health';
import { getAlertHistory } from '@/lib/observability/alerts';
import { getSchedulerStatus } from '@/services/scrapers/scheduler';
import { db } from '@/services/database';

export async function GET() {
  const [metrics, health, alerts, scheduler, scrapingData] = await Promise.allSettled([
    Promise.resolve(getMetrics()),
    runHealthCheck(),
    Promise.resolve(getAlertHistory({ limit: 50 })),
    Promise.resolve(getSchedulerStatus()),
    db.scraping.listJobs({ limit: 100 }),
  ]);
  return NextResponse.json({
    success: true,
    data: {
      metrics: metrics.status === 'fulfilled' ? metrics.value : null,
      health: health.status === 'fulfilled' ? health.value : null,
      alerts: alerts.status === 'fulfilled' ? alerts.value : [],
      scheduler: scheduler.status === 'fulfilled' ? scheduler.value : null,
      recentJobs: scrapingData.status === 'fulfilled' ? (scrapingData.value.data || []) : [],
      timestamp: new Date().toISOString(),
    },
  });
}
