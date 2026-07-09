import { NextResponse } from 'next/server';

const favorites = new Map();

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default';
    const userFavs = favorites.get(userId) || [];
    return NextResponse.json({ success: true, data: userFavs });
}

export async function POST(request) {
    const body = await request.json();
    const { userId = 'default', productId, productName, productSlug, brand } = body;
    const userFavs = favorites.get(userId) || [];
    const exists = userFavs.find(f => f.productId === productId);

    if (exists) {
        favorites.set(userId, userFavs.filter(f => f.productId !== productId));
        return NextResponse.json({ success: true, favorited: false });
    }

    userFavs.push({
        id: crypto.randomUUID(),
        userId,
        productId,
        productName,
        productSlug,
        brand,
        createdAt: new Date().toISOString()
    });
    favorites.set(userId, userFavs);

    return NextResponse.json({ success: true, favorited: true });
}
