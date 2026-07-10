import { NextResponse } from 'next/server';
import { runHealthCheck } from '@/lib/observability/health';

export async function GET() {
  const health = await runHealthCheck();
  return NextResponse.json({ success: true, data: health });
}
