import { NextResponse } from 'next/server';

export async function POST(request) {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
        return NextResponse.json({ success: false, error: 'No se recibió archivo' }, { status: 400 });
    }

    const imageId = crypto.randomUUID();
    const filename = file.name || 'sin-nombre';

    return NextResponse.json({
        success: true,
        data: {
            id: imageId,
            filename,
            size: file.size,
            mimeType: file.type,
            url: `/api/images/${imageId}`,
            versions: {
                webp: `/api/images/${imageId}/webp`,
                thumbnail: `/api/images/${imageId}/thumbnail`,
            }
        }
    });
}
