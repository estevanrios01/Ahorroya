import { NextResponse } from 'next/server';
import { barcodeScanSchema } from '@/lib/zod';

export async function POST(request) {
  const body = await request.json();
  const parsed = barcodeScanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 });
  }
  const { code, format } = parsed.data;
  const scan = { id: crypto.randomUUID(), code, format, valid: /^\d{8,13}$/.test(code), scannedAt: new Date().toISOString() };
  return NextResponse.json({ success: true, data: scan });
}

export async function GET() {
  return NextResponse.json({ success: true, data: [] });
}
