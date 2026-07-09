import { NextResponse } from 'next/server';

const branches = [
    { id: 1, store: 'Tiendas D1', address: 'Carrera 100 # 11-60', lat: 3.4516, lng: -76.5320, distance: 0.5 },
    { id: 2, store: 'Almacenes Éxito', address: 'Calle 5 # 38D-35', lat: 3.4520, lng: -76.5350, distance: 1.2 },
    { id: 3, store: 'Supermercados Olímpica', address: 'Avenida Pasoancho # 50-12', lat: 3.4480, lng: -76.5280, distance: 2.1 },
    { id: 4, store: 'Cruz Verde', address: 'Carrera 66 # 5-20', lat: 3.4550, lng: -76.5300, distance: 0.3 },
    { id: 5, store: 'Ara', address: 'Calle 5 # 42-10', lat: 3.4530, lng: -76.5330, distance: 0.8 },
];

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '3.4516');
    const lng = parseFloat(searchParams.get('lng') || '-76.5320');
    const radius = parseFloat(searchParams.get('radius') || '5');

    const nearby = branches
        .filter(b => b.distance <= radius)
        .sort((a, b) => a.distance - b.distance);

    return NextResponse.json({ success: true, data: nearby, total: nearby.length });
}
