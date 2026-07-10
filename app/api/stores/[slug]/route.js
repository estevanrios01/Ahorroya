import { NextResponse } from 'next/server';

const stores = [
  { id: 1, name: 'Almacenes Éxito', slug: 'exito', category: 'Supermercado', logo: null, description: 'Cadena de supermercados líder en Colombia.', phone: '01-8000-123-456', schedule: 'Lun-Dom 7:00-22:00' },
  { id: 2, name: 'Tiendas D1', slug: 'd1', category: 'Supermercado', logo: null, description: 'Tiendas de descuento con precios bajos todos los días.', phone: null, schedule: 'Lun-Dom 8:00-21:00' },
  { id: 3, name: 'Supermercados Olímpica', slug: 'olimpica', category: 'Supermercado', logo: null, description: 'Supermercados con variedad en productos y promociones.', phone: '01-8000-789-012', schedule: 'Lun-Dom 7:00-22:00' },
  { id: 4, name: 'Jumbo', slug: 'jumbo', category: 'Supermercado', logo: null, description: 'Hipermercado con gran variedad de productos nacionales e importados.', phone: null, schedule: 'Lun-Dom 7:00-22:00' },
  { id: 5, name: 'Ara', slug: 'ara', category: 'Supermercado', logo: null, description: 'Tiendas de cercanía con precios competitivos.', phone: null, schedule: 'Lun-Dom 7:00-21:00' },
  { id: 6, name: 'Cruz Verde', slug: 'cruz-verde', category: 'Farmacia', logo: null, description: 'Cadena de farmacias con cobertura nacional.', phone: '01-8000-345-678', schedule: 'Lun-Dom 24h' },
  { id: 7, name: 'Farmatodo', slug: 'farmatodo', category: 'Farmacia', logo: null, description: 'Farmacias con productos de cuidado personal y medicamentos.', phone: null, schedule: 'Lun-Dom 7:00-22:00' },
  { id: 8, name: 'Carulla', slug: 'carulla', category: 'Supermercado', logo: null, description: 'Supermercado con productos frescos y gourmet.', phone: '01-8000-567-890', schedule: 'Lun-Dom 7:00-22:00' },
  { id: 9, name: 'Makro', slug: 'makro', category: 'Supermercado', logo: null, description: 'Supermercado mayorista para empresas y hogares.', phone: null, schedule: 'Lun-Dom 6:00-20:00' },
  { id: 10, name: 'La Rebaja', slug: 'la-rebaja', category: 'Farmacia', logo: null, description: 'Farmacias con precios bajos en medicamentos y cuidado personal.', phone: null, schedule: 'Lun-Dom 7:00-21:00' },
];

export async function GET(_, { params }) {
  const { slug } = await params;
  const store = stores.find(s => s.slug === slug);

  if (!store) {
    return NextResponse.json({ success: false, error: 'Store not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: store });
}
