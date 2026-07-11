import Link from 'next/link';
import { getAllBrands } from '../../services/catalog/CatalogService';
import { BreadcrumbJsonLd, WebSiteJsonLd } from '../../components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahorroya.vercel.app';

export async function generateMetadata() {
  return {
    metadataBase: new URL(SITE_URL),
    title: 'Todas las marcas - Compara precios | AhorroYa',
    description: 'Encuentra productos de todas las marcas en supermercados y farmacias de Colombia. Compara precios y ahorra en tus compras.',
    openGraph: {
      title: 'Todas las marcas - AhorroYa',
      description: 'Compara precios de todas las marcas en Colombia.',
      locale: 'es_CO',
      siteName: 'AhorroYa',
    },
    robots: { index: true, follow: true },
    alternates: { canonical: `${SITE_URL}/marcas` },
  };
}

export default async function MarcasPage() {
  const { brands } = await getAllBrands();

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Inicio', url: '/' },
        { name: 'Marcas' },
      ]} />
      <WebSiteJsonLd />
      <div className="min-h-screen bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 pb-16">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Inicio</Link>
              <span className="text-xs text-zinc-600">/</span>
              <span className="text-xs text-zinc-400">Marcas</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 mt-2">Todas las marcas</h1>
            <p className="text-zinc-500 mt-1">Explora productos por marca y encuentra los mejores precios</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {brands.map((brand) => (
              <Link
                key={brand.slug}
                href={`/marca/${brand.slug}`}
                className="flex items-center gap-4 bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 hover:bg-zinc-900 transition-all group"
              >
                <div className="h-14 w-14 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-zinc-400 uppercase">{brand.name.slice(0, 2)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors truncate">{brand.name}</h2>
                  <p className="text-sm text-zinc-500">{(brand.productCount || 0).toLocaleString('es-CO')} productos</p>
                </div>
                <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors">&rarr;</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
