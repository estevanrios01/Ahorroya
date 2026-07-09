import { NextResponse } from 'next/server';

const images = new Map();

export async function GET(request, { params }) {
    const { id } = await params;
    const image = images.get(id) || {
        id,
        url: `https://cdn.ahorroya.com/images/${id}/original`,
        width: 800,
        height: 800,
        format: 'webp',
        createdAt: new Date().toISOString()
    };

    return NextResponse.json({ success: true, data: image });
}

export async function DELETE(request, { params }) {
    const { id } = await params;
    images.delete(id);
    return NextResponse.json({ success: true, message: 'Imagen eliminada' });
}
