import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { id } = await params;
  return NextResponse.json({ success: true, data: { id, status: 'pending', message: 'El procesamiento de imágenes requiere un storage backend configurado.' } });
}

export async function DELETE(request, { params }) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Usuario no autenticado' }, { status: 401 });
  }
  const { id } = await params;
  return NextResponse.json({
    success: false,
    error: 'Storage backend no configurado',
    id,
  }, { status: 501 });
}
