import { NextResponse } from 'next/server';
import { getSchedulerStatus } from '@/services/scrapers/scheduler';
import { db, supabaseAdmin } from '@/services/database';
import { withTimeout } from '@/services/fallbackCatalog';

export async function GET() {
  const [scheduler, jobs, runs] = await Promise.allSettled([
    Promise.resolve(getSchedulerStatus()),
    withTimeout(db.scraping.listJobs({ limit: 50 }), 1500, 'scraper jobs timeout'),
    supabaseAdmin
      ? withTimeout(supabaseAdmin.from('scraping_runs').select('*').order('started_at', { ascending: false }).limit(50), 1500, 'scraper runs timeout')
      : Promise.resolve({ data: [] }),
  ]);
  return NextResponse.json({
    success: true,
    data: {
      scheduler: scheduler.status === 'fulfilled' ? scheduler.value : null,
      recentJobs: jobs.status === 'fulfilled' ? (jobs.value.data || []) : [],
      recentRuns: runs.status === 'fulfilled' ? (runs.value.data || []) : [],
      timestamp: new Date().toISOString(),
    },
  });
}
