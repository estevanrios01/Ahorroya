import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: { totalProducts: 0, totalStores: 0, totalPrices: 0, quality: { completeness: 0, consistency: 0, reliability: 0, freshness: 0, overall: 0 }, lastScraping: {} },
  });
}
