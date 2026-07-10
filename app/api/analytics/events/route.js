import { NextResponse } from 'next/server';
import { db } from '@/services/database';

export async function POST(request) {
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

export async function GET() {
  return NextResponse.json({ success: true, data: { message: 'Analytics endpoint activo' } });
}
