const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahorroya.vercel.app';

const staticRoutes = [
  { url: '/', priority: 1.0, freq: 'daily' },
  { url: '/marcas', priority: 0.9, freq: 'weekly' },
  { url: '/categorias', priority: 0.9, freq: 'weekly' },
  { url: '/supermercados', priority: 0.8, freq: 'weekly' },
  { url: '/farmacias', priority: 0.8, freq: 'weekly' },
  { url: '/ciudades', priority: 0.8, freq: 'weekly' },
  { url: '/departamentos', priority: 0.7, freq: 'weekly' },
  { url: '/buscar', priority: 0.5, freq: 'monthly' },
  { url: '/favoritos', priority: 0.3, freq: 'monthly' },
  { url: '/dashboard-ejecutivo', priority: 0.4, freq: 'weekly' },
  { url: '/admin', priority: 0.2, freq: 'monthly' },
  { url: '/legal', priority: 0.4, freq: 'monthly' },
  { url: '/legal/privacidad', priority: 0.3, freq: 'monthly' },
  { url: '/legal/terminos', priority: 0.3, freq: 'monthly' },
  { url: '/legal/cookies', priority: 0.3, freq: 'monthly' },
  { url: '/legal/datos', priority: 0.3, freq: 'monthly' },
  { url: '/legal/contacto', priority: 0.3, freq: 'monthly' },
];

const dynamicSlugs = {
  '/producto/': ['arroz-diana-premium', 'arroz-roa-fortificado', 'leche-entera-colanta', 'aceite-gourmet-900ml', 'pan-bimbo-artesano', 'acetaminofen-mk-500mg', 'jabon-liquido-rey', 'ibuprofeno-mk-400mg', 'detergente-fab-1kg', 'cafe-sello-rojo-500g', 'huevos-santa-reyes-x30', 'coca-cola-25l'],
  '/supermercado/': ['exito', 'd1', 'jumbo', 'olimpica', 'ara', 'carulla', 'makro'],
  '/farmacia/': ['cruz-verde', 'farmatodo', 'la-rebaja'],
  '/categoria/': ['despensa', 'farmacia', 'lacteos', 'panaderia', 'aseo', 'medicamentos-otc', 'bebidas', 'mercado', 'carnes', 'bebes', 'mascotas'],
  '/marca/': ['diana', 'colanta', 'gourmet', 'bimbo', 'mk', 'roa', 'sello-rojo', 'coca-cola', 'rey', 'fab', 'santa-reyes', 'familia'],
  '/ciudad/': ['cali', 'bogota', 'medellin', 'barranquilla', 'cartagena', 'bucaramanga', 'pereira', 'manizales', 'ibague', 'cucuta', 'villavicencio', 'santa-marta', 'neiva', 'pasto', 'armenia'],
  '/departamento/': ['valle-del-cauca', 'cundinamarca', 'antioquia', 'atlantico', 'bolivar', 'santander'],
};

const priorities = {
  '/producto/': 0.9, '/supermercado/': 0.8, '/farmacia/': 0.8,
  '/categoria/': 0.7, '/marca/': 0.6, '/ciudad/': 0.5, '/departamento/': 0.4,
};

const frequencies = {
  '/producto/': 'daily', '/supermercado/': 'weekly', '/farmacia/': 'weekly',
  '/categoria/': 'weekly', '/marca/': 'weekly', '/ciudad/': 'monthly', '/departamento/': 'monthly',
};

export default function sitemap() {
  const entries = staticRoutes.map(r => ({
    url: `${BASE}${r.url}`,
    lastModified: new Date(),
    changeFrequency: r.freq,
    priority: r.priority,
  }));

  for (const [prefix, slugs] of Object.entries(dynamicSlugs)) {
    for (const slug of slugs) {
      entries.push({
        url: `${BASE}${prefix}${slug}`,
        lastModified: new Date(),
        changeFrequency: frequencies[prefix],
        priority: priorities[prefix],
      });
    }
  }

  return entries;
}
