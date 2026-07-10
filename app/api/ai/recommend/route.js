import { NextResponse } from 'next/server';
import { aiRecommendSchema } from '@/lib/zod';

export async function POST(request) {
  const body = await request.json();
  const parsed = aiRecommendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 });
  }
  const { productId, productName, currentPrice } = parsed.data;
  const avgPrice = currentPrice ? currentPrice * 1.1 : 10000;
  let recommendation = 'comprar';
  let reason = 'Precio competitivo.';
  let confidence = 0.7;
  if (currentPrice && currentPrice < avgPrice * 0.85) {
    recommendation = 'comprar';
    reason = 'Precio por debajo del promedio histórico.';
    confidence = 0.9;
  } else if (currentPrice && currentPrice > avgPrice * 1.15) {
    recommendation = 'esperar';
    reason = 'Precio elevado. Podría bajar pronto.';
    confidence = 0.75;
  }
  return NextResponse.json({
    success: true,
    data: { productId, productName, currentPrice, predictedPrice: Math.round(avgPrice), recommendation, reason, confidence, alternatives: [] },
  });
}
