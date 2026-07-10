import Link from 'next/link';
import { BreadcrumbJsonLd, WebSiteJsonLd } from '../../components/seo/JsonLd';
import { getAllCities } from '../../services/catalog/CatalogService';
import CiudadesClient from './CiudadesClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahorroya.vercel.app';

export async function generateMetadata() {
  return {
    metadataBase: new URL(SITE_URL),
    title: 'Cobertura AhorroYa - Todas las ciudades de Colombia',
    description: 'AhorroYa tiene cobertura en las principales ciudades de Colombia. Encuentra supermercados, farmacias y compara precios en tu ciudad.',
    openGraph: {
      title: 'Cobertura AhorroYa - Ciudades',
      description: 'Encuentra los mejores precios en supermercados y farmacias cerca de ti.',
      locale: 'es_CO',
      siteName: 'AhorroYa',
    },
    robots: { index: true, follow: true },
    alternates: { canonical: `${SITE_URL}/ciudades` },
  };
}

export default async function CiudadesPage() {
  const ciudades = await getAllCities();

  const totalStores = ciudades.reduce((acc, c) => acc + c.stores, 0);
  const totalProducts = ciudades.reduce((acc, c) => acc + c.products, 0);
  const supermarketCount = ciudades.reduce((acc, c) => acc + Math.round(c.stores * 0.7), 0);
  const pharmacyCount = ciudades.reduce((acc, c) => acc + Math.round(c.stores * 0.3), 0);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Ciudades con cobertura - AhorroYa',
    description: 'Lista de ciudades colombianas donde AhorroYa compara precios de supermercados y farmacias.',
    url: `${SITE_URL}/ciudades`,
    numberOfItems: ciudades.length,
    itemListElement: ciudades.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'City',
        name: c.name,
        url: `${SITE_URL}/ciudad/${c.slug}`,
        containedInPlace: { '@type': 'State', name: c.department },
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BreadcrumbJsonLd items={[
        { name: 'Inicio', url: '/' },
        { name: 'Ciudades' },
      ]} />
      <WebSiteJsonLd />
      <div className="min-h-screen bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 pb-16">
          <div className="flex items-center gap-2 text-xs text-zinc-600 mb-4">
            <Link href="/" className="hover:text-zinc-400 transition-colors">Inicio</Link>
            <span>/</span>
            <span className="text-zinc-400">Ciudades</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-zinc-100">Cobertura nacional</h1>
              <p className="text-zinc-500 mt-2 text-lg">
                Comparamos precios en <span className="text-emerald-400 font-semibold">{ciudades.length} ciudades</span> de Colombia
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-emerald-400">{ciudades.length}</div>
              <div className="text-xs text-zinc-500 mt-1">Ciudades</div>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-emerald-400">{supermarketCount.toLocaleString('es-CO')}</div>
              <div className="text-xs text-zinc-500 mt-1">Supermercados</div>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-emerald-400">{pharmacyCount.toLocaleString('es-CO')}</div>
              <div className="text-xs text-zinc-500 mt-1">Farmacias</div>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-emerald-400">{totalProducts.toLocaleString('es-CO')}</div>
              <div className="text-xs text-zinc-500 mt-1">Productos</div>
            </div>
          </div>

          <CiudadesClient ciudades={ciudades} />
        </div>
      </div>
    </>
  );
}
