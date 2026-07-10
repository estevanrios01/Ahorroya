import { NextResponse } from 'next/server';

export async function POST(request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Usuario no autenticado' }, { status: 401 });
  }
  const formData = await request.formData();
  const file = formData.get('file');
  if (!file) {
    return NextResponse.json({ success: false, error: 'No se recibió archivo' }, { status: 400 });
  }
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ success: false, error: 'Tipo de archivo no permitido. Use JPEG, PNG, WebP o AVIF.' }, { status: 400 });
  }
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return NextResponse.json({ success: false, error: 'Archivo demasiado grande. Máximo 10MB.' }, { status: 400 });
  }
  const imageId = crypto.randomUUID();
  return NextResponse.json({
    success: true,
    data: { id: imageId, filename: file.name || 'sin-nombre', size: file.size, mimeType: file.type, url: `/api/images/${imageId}` },
  });
}
