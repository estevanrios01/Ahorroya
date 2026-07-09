import { NextResponse } from 'next/server';

const products = [
    { id: 1, name: 'Arroz Diana Premium', slug: 'arroz-diana-premium', brand: 'Diana', category: 'Despensa', barcode: '7702010000011' },
    { id: 2, name: 'Arroz Roa Fortificado', slug: 'arroz-roa-fortificado', brand: 'Roa', category: 'Despensa', barcode: '7702010000028' },
    { id: 3, name: 'Aceite Gourmet Familia', slug: 'aceite-gourmet-familia', brand: 'Familia', category: 'Despensa', barcode: '7702010000035' },
    { id: 4, name: 'Leche Entera Colanta', slug: 'leche-entera-colanta', brand: 'Colanta', category: 'Lácteos', barcode: '7702010000042' },
    { id: 5, name: 'Pan Bimbo Integral', slug: 'pan-bimbo-integral', brand: 'Bimbo', category: 'Panadería', barcode: '7702010000059' },
    { id: 6, name: 'Acetaminofén MK 500mg', slug: 'acetaminofen-mk-500mg', brand: 'MK', category: 'Farmacia', barcode: '7702010000066' },
    { id: 7, name: 'Ibuprofeno Genfar 400mg', slug: 'ibuprofeno-genfar-400mg', brand: 'Genfar', category: 'Farmacia', barcode: '7702010000073' },
    { id: 8, name: 'Jabón Rey Barra', slug: 'jabon-rey-barra', brand: 'Rey', category: 'Aseo', barcode: '7702010000080' },
    { id: 9, name: 'Shampoo Pantene Pro-V', slug: 'shampoo-pantene-pro-v', brand: 'Pantene', category: 'Aseo', barcode: '7702010000097' },
    { id: 10, name: 'Café Sello Rojo 500g', slug: 'cafe-sello-rojo-500g', brand: 'Sello Rojo', category: 'Despensa', barcode: '7702010000103' },
];

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.toLowerCase();
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let filtered = [...products];

    if (q) {
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.barcode.includes(q)
        );
    }

    if (category) {
        filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return NextResponse.json({
        success: true,
        data: paginated,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
}
