import { NextResponse } from 'next/server';

export async function GET(request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Usuario no autenticado' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  if (!query || query.length > 200) {
    return NextResponse.json({ error: 'Parámetro de búsqueda inválido' }, { status: 400 });
  }
  return NextResponse.json({ success: true, message: 'Scraping iniciado', query, store: request.headers.get('x-store') || 'general' });
}
