import { NextResponse } from 'next/server';
import { db } from '@/services/database';
import { withErrorHandling } from '@/lib/api-handler';
import { analyticsEventSchema } from '@/lib/zod';

async function handlePost(request) {
  const body = await request.json();
  const parsed = analyticsEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Evento inválido' }, { status: 400 });
  }
  const event = {
    id: crypto.randomUUID(),
    name: parsed.data.name,
    properties: parsed.data.properties,
    timestamp: new Date().toISOString(),
  };
  await db.analytics.track(event);
  return NextResponse.json({ success: true, data: event });
}

async function handleGet() {
  return NextResponse.json({ success: true, data: { message: 'Analytics endpoint activo' } });
}

export const POST = withErrorHandling(handlePost);
export const GET = withErrorHandling(handleGet);
