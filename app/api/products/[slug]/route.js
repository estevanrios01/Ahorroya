import { NextResponse } from 'next/server';

const productDetail = {
    'arroz-diana-premium': {
        id: 1, name: 'Arroz Diana Premium', slug: 'arroz-diana-premium', brand: 'Diana',
        category: 'Despensa', barcode: '7702010000011', description: 'Arroz blanco premium 1kg',
        prices: [
            { store: 'Almacenes Éxito', price: 4200, distance: 1.2, available: true },
            { store: 'Tiendas D1', price: 3800, distance: 0.5, available: true },
            { store: 'Supermercados Olímpica', price: 4500, distance: 2.1, available: true },
            { store: 'Ara', price: 3950, distance: 0.8, available: true },
        ]
    },
    'acetaminofen-mk-500mg': {
        id: 6, name: 'Acetaminofén MK 500mg', slug: 'acetaminofen-mk-500mg', brand: 'MK',
        category: 'Farmacia', barcode: '7702010000066', description: 'Acetaminofén 500mg x 30 tabletas',
        prices: [
            { store: 'Cruz Verde', price: 2850, distance: 0.3, available: true },
            { store: 'Farmatodo', price: 2980, distance: 0.7, available: true },
            { store: 'La Rebaja', price: 3120, distance: 1.1, available: true },
            { store: 'Almacenes Éxito', price: 3200, distance: 1.2, available: true },
        ]
    }
};

export async function GET(request, { params }) {
    const { slug } = await params;
    const product = productDetail[slug];

    if (!product) {
        const generic = { id: slug, name: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), prices: [] };
        return NextResponse.json({ success: true, data: generic });
    }

    return NextResponse.json({ success: true, data: product });
}
