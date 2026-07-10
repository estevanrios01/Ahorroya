import { NextResponse } from 'next/server';
import { getMetrics } from '@/lib/observability/metrics';

export async function GET() {
  return NextResponse.json({ success: true, data: getMetrics() });
}
