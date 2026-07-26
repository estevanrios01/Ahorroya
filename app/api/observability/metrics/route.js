import { NextResponse } from 'next/server';
import { getMetrics } from '@/lib/observability/metrics';
import { withErrorHandling } from '@/lib/api-handler';

async function handleGet() {
  return NextResponse.json({ success: true, data: getMetrics() });
}

export const GET = withErrorHandling(handleGet);
