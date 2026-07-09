import { NextResponse } from 'next/server';

const promotions = [
    { id: 1, product: 'Aceite Gourmet Familia', store: 'Almacenes Éxito', originalPrice: 14000, price: 12500, discount: 11, endDate: '2026-07-15' },
    { id: 2, product: 'Arroz Diana Premium', store: 'Tiendas D1', originalPrice: 4200, price: 3800, discount: 10, endDate: '2026-07-20' },
    { id: 3, product: 'Ibuprofeno Genfar 400mg', store: 'Cruz Verde', originalPrice: 5200, price: 4500, discount: 13, endDate: '2026-07-18' },
    { id: 4, product: 'Leche Entera Colanta', store: 'Ara', originalPrice: 3200, price: 2800, discount: 13, endDate: '2026-07-12' },
];

export async function GET() {
    const active = promotions.filter(p => new Date(p.endDate) > new Date());
    return NextResponse.json({ success: true, data: active, total: active.length });
}
