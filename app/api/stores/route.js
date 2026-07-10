import { NextResponse } from 'next/server';
import { db } from '@/services/database';

export async function GET() {
  const result = await db.stores.list({ limit: 200 });
  if (result.error) {
    return NextResponse.json({ success: false, error: 'Error al consultar tiendas' }, { status: 500 });
  }
  return NextResponse.json({ success: true, data: result.data, pagination: result.pagination });
}
