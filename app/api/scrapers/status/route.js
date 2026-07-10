import { NextResponse } from 'next/server';
import { getSchedulerStatus } from '@/services/scrapers/scheduler';
import { db } from '@/services/database';

export async function GET() {
  const [scheduler, jobs, runs] = await Promise.allSettled([
    Promise.resolve(getSchedulerStatus()),
    db.scraping.listJobs({ limit: 50 }),
    db.scraping.listJobs({ limit: 50 }),
  ]);
  return NextResponse.json({
    success: true,
    data: {
      scheduler: scheduler.status === 'fulfilled' ? scheduler.value : null,
      recentJobs: jobs.status === 'fulfilled' ? (jobs.value.data || []) : [],
      timestamp: new Date().toISOString(),
    },
  });
}
