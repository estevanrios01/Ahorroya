export const fallbackStores = [
  { name: 'Exito', slug: 'exito', category: 'Supermercado', type: 'supermercado', description: 'Supermercado nacional con productos de mercado, hogar, tecnologia y farmacia.' },
  { name: 'Olimpica', slug: 'olimpica', category: 'Supermercado', type: 'supermercado', description: 'Cadena nacional de supermercados y droguerias con presencia en varias ciudades.' },
  { name: 'Jumbo', slug: 'jumbo', category: 'Supermercado', type: 'supermercado', description: 'Supermercado de gran formato con catalogo de mercado, frescos, hogar y cuidado personal.' },
  { name: 'Carulla', slug: 'carulla', category: 'Supermercado', type: 'supermercado', description: 'Supermercado premium con alimentos, productos importados y mercado diario.' },
  { name: 'D1', slug: 'd1', category: 'Supermercado', type: 'supermercado', description: 'Tienda de descuento con productos basicos de compra frecuente.' },
  { name: 'Ara', slug: 'ara', category: 'Supermercado', type: 'supermercado', description: 'Tienda de descuento con cobertura nacional y productos de alta rotacion.' },
  { name: 'Makro', slug: 'makro', category: 'Supermercado', type: 'supermercado', description: 'Comercio mayorista para mercado, hogar, negocios y abastecimiento.' },
  { name: 'Metro', slug: 'metro', category: 'Supermercado', type: 'supermercado', description: 'Supermercado con productos de mercado, frescos y hogar.' },
  { name: 'Farmatodo', slug: 'farmatodo', category: 'Farmacia', type: 'farmacia', description: 'Farmacia y tienda de conveniencia con medicamentos, dermocosmetica y cuidado personal.' },
  { name: 'Cruz Verde', slug: 'cruz-verde', category: 'Farmacia', type: 'farmacia', description: 'Farmacia nacional con medicamentos, bienestar, belleza y cuidado personal.' },
  { name: 'La Rebaja', slug: 'la-rebaja', category: 'Farmacia', type: 'farmacia', description: 'Drogueria con medicamentos, cuidado personal y productos de salud.' },
  { name: 'Locatel', slug: 'locatel', category: 'Farmacia', type: 'farmacia', description: 'Farmacia y tienda de salud con productos medicos y cuidado personal.' },
  { name: 'Pasteur', slug: 'pasteur', category: 'Farmacia', type: 'farmacia', description: 'Drogueria con cobertura regional y productos de salud.' },
  { name: 'Colsubsidio', slug: 'colsubsidio', category: 'Farmacia', type: 'farmacia', description: 'Droguerias con medicamentos, bienestar y servicios complementarios.' },
];

export const fallbackCategories = [
  { name: 'Mercado', slug: 'mercado', icon: 'ShoppingCart', description: 'Despensa, granos, aceites, cafe y basicos de compra frecuente.' },
  { name: 'Farmacia', slug: 'farmacia', icon: 'Pill', description: 'Medicamentos, cuidado personal, dermocosmetica y bienestar.' },
  { name: 'Lacteos', slug: 'lacteos', icon: 'Milk', description: 'Leche, quesos, yogures, mantequillas y derivados.' },
  { name: 'Carnes', slug: 'carnes', icon: 'Beef', description: 'Pollo, res, cerdo, huevos y proteinas refrigeradas.' },
  { name: 'Aseo', slug: 'aseo', icon: 'Home', description: 'Limpieza del hogar, lavanderia y cuidado de superficies.' },
  { name: 'Bebes', slug: 'bebes', icon: 'Baby', description: 'Panales, formulas, panitos, alimentacion y cuidado infantil.' },
  { name: 'Mascotas', slug: 'mascotas', icon: 'Dog', description: 'Alimento, higiene, snacks y accesorios para mascotas.' },
  { name: 'Bebidas', slug: 'bebidas', icon: 'Wine', description: 'Gaseosas, aguas, jugos, energizantes y bebidas de ocasion.' },
];

export const fallbackCities = [
  { name: 'Cali', slug: 'cali', department: 'Valle del Cauca' },
  { name: 'Bogota', slug: 'bogota', department: 'Cundinamarca' },
  { name: 'Medellin', slug: 'medellin', department: 'Antioquia' },
  { name: 'Barranquilla', slug: 'barranquilla', department: 'Atlantico' },
  { name: 'Cartagena', slug: 'cartagena', department: 'Bolivar' },
  { name: 'Bucaramanga', slug: 'bucaramanga', department: 'Santander' },
];

export function withTimeout(promise, ms = 2500, label = 'timeout') {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(label)), ms)),
  ]);
}

export function getFallbackStore(slug) {
  const canonicalSlug = slug === 'larebaja' ? 'la-rebaja' : slug;
  return fallbackStores.find((store) => store.slug === canonicalSlug) || null;
}

export function getFallbackCategory(slug) {
  return fallbackCategories.find((category) => category.slug === slug) || null;
}
