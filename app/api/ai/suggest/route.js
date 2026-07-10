import { NextResponse } from 'next/server';
import { aiSuggestSchema, sanitize } from '@/lib/zod';

const corrections = {
  acetaminofen: 'Acetaminofén', ibuprofeno: 'Ibuprofeno', dole: 'Dolex',
  arros: 'Arroz', lche: 'Leche', panela: 'Panela', cafe: 'Café', gaseosa: 'Gaseosa',
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const parsed = aiSuggestSchema.safeParse({ q });
  if (!parsed.success) {
    return NextResponse.json({ success: true, data: [] });
  }
  const query = sanitize(parsed.data.q.toLowerCase().trim());
  if (!query || query.length < 2) {
    return NextResponse.json({ success: true, data: [] });
  }
  const suggestions = [];
  if (corrections[query]) {
    suggestions.push({ query, corrected: corrections[query], type: 'correction', confidence: 0.95 });
  }
  return NextResponse.json({ success: true, data: suggestions });
}
