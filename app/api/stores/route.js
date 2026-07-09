import { NextResponse } from 'next/server';

const stores = [
    { id: 1, name: 'Almacenes Éxito', slug: 'exito', category: 'Supermercado', logo: null },
    { id: 2, name: 'Tiendas D1', slug: 'd1', category: 'Supermercado', logo: null },
    { id: 3, name: 'Supermercados Olímpica', slug: 'olimpica', category: 'Supermercado', logo: null },
    { id: 4, name: 'Jumbo', slug: 'jumbo', category: 'Supermercado', logo: null },
    { id: 5, name: 'Ara', slug: 'ara', category: 'Supermercado', logo: null },
    { id: 6, name: 'Cruz Verde', slug: 'cruz-verde', category: 'Farmacia', logo: null },
    { id: 7, name: 'Farmatodo', slug: 'farmatodo', category: 'Farmacia', logo: null },
    { id: 8, name: 'Carulla', slug: 'carulla', category: 'Supermercado', logo: null },
    { id: 9, name: 'Makro', slug: 'makro', category: 'Supermercado', logo: null },
    { id: 10, name: 'La Rebaja', slug: 'la-rebaja', category: 'Farmacia', logo: null },
];

export async function GET() {
    return NextResponse.json({ success: true, data: stores, total: stores.length });
}
