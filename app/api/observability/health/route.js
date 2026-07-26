import { NextResponse } from 'next/server';
import { runHealthCheck } from '@/lib/observability/health';
import { withErrorHandling } from '@/lib/api-handler';

async function handleGet() {
  const health = await runHealthCheck();
  return NextResponse.json({ success: true, data: health });
}

export const GET = withErrorHandling(handleGet);
