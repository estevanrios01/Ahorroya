import { NextResponse } from 'next/server';
import { db } from '../../../services/database';

export async function GET(request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Usuario no autenticado' }, { status: 401 });
  }
  const { data, error } = await db.favorites.list(userId);
  if (error) {
    return NextResponse.json({ success: false, error: 'Error al consultar favoritos' }, { status: 500 });
  }
  return NextResponse.json({ success: true, data });
}

export async function POST(request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Usuario no autenticado' }, { status: 401 });
  }
  const body = await request.json();
  const { productId } = body;
  if (!productId) {
    return NextResponse.json({ success: false, error: 'productId requerido' }, { status: 400 });
  }
  const result = await db.favorites.toggle(userId, productId);
  if (result.error) {
    return NextResponse.json({ success: false, error: 'Error al actualizar favorito' }, { status: 500 });
  }
  return NextResponse.json({ success: true, favorited: result.favorited });
}
