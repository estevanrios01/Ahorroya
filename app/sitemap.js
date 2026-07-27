import { fallbackStores, fallbackCategories, fallbackCities } from '../services/fallbackCatalog';

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
  // /dashboard-ejecutivo deliberately excluded: it's an internal ops
  // dashboard (scraper health, failure counts, pipeline metrics), not a
  // customer-facing page. It has no auth gate at all today, which is a
  // separate, bigger question (see security review), but actively telling
  // Google to index it is never correct regardless of how that gets
  // resolved.
  { url: '/legal', priority: 0.4, freq: 'monthly' },
  { url: '/legal/privacidad', priority: 0.3, freq: 'monthly' },
  { url: '/legal/terminos', priority: 0.3, freq: 'monthly' },
  { url: '/legal/cookies', priority: 0.3, freq: 'monthly' },
  { url: '/legal/datos', priority: 0.3, freq: 'monthly' },
  { url: '/legal/contacto', priority: 0.3, freq: 'monthly' },
];

// producto/[id] and marca/[slug] are deliberately absent: both are unbounded,
// DB-driven catalogs (real products/brands come from live scraping, not a
// fixed list) with no static set of slugs that's actually guaranteed to
// exist -- the same reasoning generateStaticParams already uses for these
// two routes. This sitemap previously hardcoded 12 invented product slugs
// and 12 invented brand slugs (things like "arroz-diana-premium", "gourmet")
// that don't correspond to real catalog rows; submitting them told Google to
// crawl URLs that 404. Everything below instead comes from the same fixed
// lists services/fallbackCatalog.js already uses for generateStaticParams,
// so the sitemap can't drift out of sync with what the site actually serves.
export default function sitemap() {
  const entries = staticRoutes.map((r) => ({
    url: `${BASE}${r.url}`,
    lastModified: new Date(),
    changeFrequency: r.freq,
    priority: r.priority,
  }));

  for (const store of fallbackStores) {
    const prefix = store.type === 'farmacia' ? '/farmacia/' : '/supermercado/';
    entries.push({
      url: `${BASE}${prefix}${store.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: store.type === 'farmacia' ? 0.8 : 0.8,
    });
  }

  for (const category of fallbackCategories) {
    entries.push({
      url: `${BASE}/categoria/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  }

  for (const city of fallbackCities) {
    entries.push({
      url: `${BASE}/ciudad/${city.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    });
  }

  const departmentSlugs = new Set();
  for (const city of fallbackCities) {
    const slug = city.department
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    if (departmentSlugs.has(slug)) continue;
    departmentSlugs.add(slug);
    entries.push({
      url: `${BASE}/departamento/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    });
  }

  return entries;
}
