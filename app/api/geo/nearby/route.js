import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');
  if (!lat || !lng) {
    return NextResponse.json({ success: false, error: 'Parámetros lat y lng requeridos' }, { status: 400 });
  }
  return NextResponse.json({ success: true, data: { center: { lat, lng }, stores: [] } });
}
