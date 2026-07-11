import { NextResponse } from 'next/server';
import { getSchedulerStatus } from '@/services/scrapers/scheduler';
import { db, supabaseAdmin } from '@/services/database';

export async function GET() {
  const [scheduler, jobs, runs] = await Promise.allSettled([
    Promise.resolve(getSchedulerStatus()),
    db.scraping.listJobs({ limit: 50 }),
    supabaseAdmin ? supabaseAdmin.from('scraping_runs').select('*').order('started_at', { ascending: false }).limit(50) : Promise.resolve({ data: [] }),
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
