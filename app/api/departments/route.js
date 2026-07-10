import { NextResponse } from 'next/server';
import { db } from '@/services/database';

export async function GET() {
  const result = await db.departments.list();
  if (result.error) {
    return NextResponse.json({ success: false, error: 'Error al consultar departamentos' }, { status: 500 });
  }
  return NextResponse.json({ success: true, data: result.data });
}
