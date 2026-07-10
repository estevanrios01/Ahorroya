import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { id } = await params;
  return NextResponse.json({ success: true, data: { id, url: `/images/${id}`, width: 800, height: 800, format: 'webp' } });
}

export async function DELETE(request, { params }) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Usuario no autenticado' }, { status: 401 });
  }
  const { id } = await params;
  return NextResponse.json({ success: true, message: 'Imagen eliminada', id });
}
