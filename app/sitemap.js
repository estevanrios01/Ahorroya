const BASE = 'https://ahorroya.vercel.app';

const staticRoutes = [
  { url: '/', priority: 1.0 },
  { url: '/marcas', priority: 0.8 },
  { url: '/dashboard-ejecutivo', priority: 0.5 },
];

// These could be generated from CatalogService at build time
const slugs = {
  productos: ['arroz-diana-premium', 'arroz-roa-fortificado', 'leche-entera-colanta', 'aceite-gourmet-900ml', 'pan-bimbo-artesano', 'acetaminofen-mk-500mg', 'jabon-liquido-rey', 'ibuprofeno-mk-400mg', 'detergente-fab-1kg', 'cafe-sello-rojo-500g', 'huevos-santa-reyes-x30', 'coca-cola-25l'],
  supermercados: ['exito', 'd1', 'jumbo', 'olimpica', 'ara', 'carulla', 'mercadona'],
  farmacias: ['cruz-verde', 'farmatodo', 'la-rebaja'],
  categorias: ['despensa', 'farmacia', 'lacteos', 'panaderia', 'aseo', 'medicamentos-otc', 'bebidas', 'mercado', 'carnes', 'bebes', 'mascotas'],
  marcas: ['diana', 'colanta', 'gourmet', 'bimbo', 'mk', 'roa', 'sello-rojo', 'coca-cola', 'rey', 'fab', 'santa-reyes', 'familia'],
  ciudades: ['cali', 'bogota', 'medellin', 'barranquilla', 'cartagena', 'bucaramanga', 'pereira', 'manizales', 'ibague', 'cucuta', 'villavicencio', 'santa-marta', 'neiva', 'pasto', 'armenia'],
  departamentos: ['valle-del-cauca', 'cundinamarca', 'antioquia', 'atlantico', 'bolivar', 'santander'],
};

export default function sitemap() {
  const entries = [];

  staticRoutes.forEach(r => entries.push({ url: `${BASE}${r.url}`, lastModified: new Date(), changeFrequency: 'daily', priority: r.priority }));

  slugs.productos.forEach(s => entries.push({ url: `${BASE}/producto/${s}`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 }));
  slugs.supermercados.forEach(s => entries.push({ url: `${BASE}/supermercado/${s}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 }));
  slugs.farmacias.forEach(s => entries.push({ url: `${BASE}/farmacia/${s}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 }));
  slugs.categorias.forEach(s => entries.push({ url: `${BASE}/categoria/${s}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 }));
  slugs.marcas.forEach(s => entries.push({ url: `${BASE}/marca/${s}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 }));
  slugs.ciudades.forEach(s => entries.push({ url: `${BASE}/ciudad/${s}`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 }));
  slugs.departamentos.forEach(s => entries.push({ url: `${BASE}/departamento/${s}`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 }));

  return entries;
}
