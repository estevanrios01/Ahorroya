import { NextResponse } from 'next/server';
import { db } from '@/services/database';
import { favoriteToggleSchema } from '@/lib/zod';
import { withErrorHandling } from '@/lib/api-handler';

async function handleGet(request) {
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

async function handlePost(request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Usuario no autenticado' }, { status: 401 });
  }
  const body = await request.json();
  const parsed = favoriteToggleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'productId inválido', details: parsed.error.flatten() }, { status: 400 });
  }
  const result = await db.favorites.toggle(userId, parsed.data.productId);
  if (result.error) {
    return NextResponse.json({ success: false, error: 'Error al actualizar favorito' }, { status: 500 });
  }
  return NextResponse.json({ success: true, favorited: result.favorited });
}

export const GET = withErrorHandling(handleGet);
export const POST = withErrorHandling(handlePost);
