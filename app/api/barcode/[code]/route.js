import { NextResponse } from 'next/server';

const catalog = {
    '7702010000011': { name: 'Arroz Diana Premium', brand: 'Diana', category: 'Despensa' },
    '7702010000028': { name: 'Aceite Gourmet Familia', brand: 'Familia', category: 'Despensa' },
    '7702010000035': { name: 'Leche Entera Colanta', brand: 'Colanta', category: 'Lácteos' },
    '7702010000042': { name: 'Pan Bimbo Integral', brand: 'Bimbo', category: 'Panadería' },
};

export async function GET(request, { params }) {
    const { code } = await params;
    const product = catalog[code] || null;

    return NextResponse.json({
        success: true,
        data: {
            code,
            product,
            verified: product !== null,
            source: product ? 'Catálogo Nacional' : 'No encontrado'
        }
    });
}
