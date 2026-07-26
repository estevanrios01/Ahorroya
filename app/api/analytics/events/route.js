import { NextResponse } from 'next/server';
import { db } from '@/services/database';
import { withErrorHandling } from '@/lib/api-handler';

async function handlePost(request) {
  const body = await request.json();
  const { name, properties } = body;
  if (!name || typeof name !== 'string') {
    return NextResponse.json({ success: false, error: 'Nombre del evento requerido' }, { status: 400 });
  }
  const event = {
    id: crypto.randomUUID(),
    name: name.slice(0, 100),
    properties: properties || {},
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
