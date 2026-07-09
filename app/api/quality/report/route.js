import { NextResponse } from 'next/server';

export async function GET() {
    const report = {
        totalProducts: 12450,
        totalStores: 48,
        totalPrices: 89200,
        quality: {
            completeness: 87,
            consistency: 92,
            reliability: 78,
            freshness: 83,
            overall: 85
        },
        duplicates: {
            products: 124,
            stores: 3,
            brands: 8
        },
        lastScraping: {
            exito: { status: 'completed', products: 12430, duration: '3m 42s' },
            d1: { status: 'completed', products: 8210, duration: '2m 15s' },
            jumbo: { status: 'in_progress', products: 5340, duration: '1m 58s' },
            olimpica: { status: 'pending', products: 0, duration: '0s' },
            ara: { status: 'completed', products: 6340, duration: '2m 30s' }
        }
    };

    return NextResponse.json({ success: true, data: report });
}
