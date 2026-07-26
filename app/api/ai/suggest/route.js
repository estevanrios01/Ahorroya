import { NextResponse } from 'next/server';
import { aiSuggestSchema, sanitize } from '@/lib/zod';
import { withErrorHandling } from '@/lib/api-handler';

const corrections = {
  acetaminofen: 'Acetaminofén', ibuprofeno: 'Ibuprofeno', dole: 'Dolex', dolex: 'Dolex',
  arros: 'Arroz', lche: 'Leche', panela: 'Panela', cafe: 'Café', gaseosa: 'Gaseosa',
};

// Ported from services/ai-engine/application/suggestions.ts, which had this
// feature but was never wired into any route -- the connected endpoint only
// had spell correction, not synonym suggestions.
const synonyms = {
  dolor: ['Acetaminofén', 'Ibuprofeno', 'Naproxeno'],
  fiebre: ['Acetaminofén', 'Ibuprofeno'],
  cabeza: ['Acetaminofén', 'Dolex'],
  desayuno: ['Café', 'Pan', 'Leche'],
  aseo: ['Jabón', 'Shampoo', 'Detergente'],
};

async function handleGet(request) {
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
  for (const [key, values] of Object.entries(synonyms)) {
    if (query.includes(key) || key.includes(query)) {
      for (const value of values.slice(0, 3)) {
        suggestions.push({ query, corrected: value, type: 'synonym', confidence: 0.7 });
      }
    }
  }
  return NextResponse.json({ success: true, data: suggestions });
}

export const GET = withErrorHandling(handleGet);
