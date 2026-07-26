import { NextResponse } from 'next/server';
import { db } from '@/services/database';
import { withTimeout } from '@/services/fallbackCatalog';
import { withErrorHandling } from '@/lib/api-handler';

// A product is "on promotion" when the retailer's own listed/original price
// is higher than what they're currently charging -- the same signal that
// already drives the discount badge on product cards, just surfaced as its
// own feed instead of requiring a specific product lookup.
async function handleGet(request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 20, 1), 100);
  const result = await withTimeout(db.products.listPromotions({ limit }), 1800, 'promotions timeout').catch((error) => ({ error }));
  if (result.error) {
    return NextResponse.json({ success: true, degraded: true, data: [] });
  }
  return NextResponse.json({ success: true, data: result.data });
}

export const GET = withErrorHandling(handleGet);
