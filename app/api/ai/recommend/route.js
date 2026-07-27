import { NextResponse } from 'next/server';
import { db } from '@/services/database';
import { aiRecommendSchema } from '@/lib/zod';
import { withErrorHandling } from '@/lib/api-handler';

async function handlePost(request) {
  const body = await request.json();
  const parsed = aiRecommendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Datos inválidos', details: parsed.error.flatten() }, { status: 400 });
  }
  const { productId, productName, currentPrice } = parsed.data;

  // Deriving "average price" from currentPrice itself (avgPrice = currentPrice
  // * 1.1) made both comparison branches below mathematically unreachable --
  // currentPrice < currentPrice * 1.1 * 0.85 is never true for a positive
  // price, so this always returned the same generic "comprar" verdict no
  // matter the input. Comparing against the product's real price history
  // instead makes the recommendation reflect an actual signal.
  let avgPrice = null;
  if (productId) {
    const { data: history } = await db.products.getPriceHistory(productId).catch(() => ({ data: [] }));
    const validPrices = (history || []).map((entry) => Number(entry.price)).filter((price) => price > 0);
    if (validPrices.length > 0) {
      avgPrice = validPrices.reduce((sum, price) => sum + price, 0) / validPrices.length;
    }
  }

  if (avgPrice == null || !currentPrice) {
    return NextResponse.json({
      success: true,
      data: {
        productId, productName, currentPrice,
        predictedPrice: null,
        recommendation: null,
        reason: 'Historial de precios insuficiente para una recomendación.',
        confidence: 0,
        alternatives: [],
      },
    });
  }

  let recommendation = 'comprar';
  let reason = 'Precio competitivo respecto al historial.';
  let confidence = 0.6;
  if (currentPrice < avgPrice * 0.9) {
    recommendation = 'comprar';
    reason = 'Precio por debajo del promedio histórico.';
    confidence = 0.85;
  } else if (currentPrice > avgPrice * 1.1) {
    recommendation = 'esperar';
    reason = 'Precio elevado respecto al historial. Podría bajar pronto.';
    confidence = 0.7;
  }

  return NextResponse.json({
    success: true,
    data: { productId, productName, currentPrice, predictedPrice: Math.round(avgPrice), recommendation, reason, confidence, alternatives: [] },
  });
}

export const POST = withErrorHandling(handlePost);
