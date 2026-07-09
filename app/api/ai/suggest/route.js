import { NextResponse } from 'next/server';

const corrections = {
    acetaminofen: 'Acetaminofén',
    ibuprofeno: 'Ibuprofeno',
    dole: 'Dolex',
    arros: 'Arroz',
    lche: 'Leche',
    panela: 'Panela',
    cafe: 'Café',
    gaseosa: 'Gaseosa',
};

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.toLowerCase().trim();

    if (!q || q.length < 2) {
        return NextResponse.json({ success: true, data: [] });
    }

    const suggestions = [];

    if (corrections[q]) {
        suggestions.push({ query: q, corrected: corrections[q], type: 'correction', confidence: 0.95 });
    }

    return NextResponse.json({ success: true, data: suggestions });
}
