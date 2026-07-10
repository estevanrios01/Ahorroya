import { NextResponse } from 'next/server';
import { db } from '@/services/database';

export async function GET() {
  const result = await db.cities.list();
  if (result.error) {
    return NextResponse.json({ success: false, error: 'Error al consultar ciudades' }, { status: 500 });
  }
  return NextResponse.json({ success: true, data: result.data });
}
