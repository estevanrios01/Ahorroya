import { NextResponse } from 'next/server';

export async function POST(request) {
    const body = await request.json();
    const { productId, productName, currentPrice } = body;

    const avgPrice = currentPrice * 1.1;
    let recommendation = 'comprar';
    let reason = 'Precio competitivo.';
    let confidence = 0.7;

    if (currentPrice < avgPrice * 0.85) {
        recommendation = 'comprar';
        reason = 'Precio por debajo del promedio histórico.';
        confidence = 0.9;
    } else if (currentPrice > avgPrice * 1.15) {
        recommendation = 'esperar';
        reason = 'Precio elevado. Podría bajar pronto.';
        confidence = 0.75;
    }

    return NextResponse.json({
        success: true,
        data: {
            productId,
            productName,
            currentPrice,
            predictedPrice: Math.round(avgPrice),
            recommendation,
            reason,
            confidence,
            alternatives: []
        }
    });
}
