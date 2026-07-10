import Link from 'next/link';
import { BreadcrumbJsonLd, WebSiteJsonLd } from '../../components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahorroya.vercel.app';

export async function generateMetadata({ searchParams }) {
  const q = (await searchParams)?.q || '';
  return {
    metadataBase: new URL(SITE_URL),
    title: q ? `"${q}" - Resultados de búsqueda | AhorroYa` : 'Buscar productos - AhorroYa',
    description: `Busca productos y compara precios en supermercados y farmacias de Colombia.${q ? ` Resultados para "${q}".` : ''}`,
    openGraph: {
      title: q ? `"${q}" - AhorroYa` : 'Buscar productos - AhorroYa',
      description: 'Encuentra los mejores precios en supermercados y farmacias de Colombia.',
      locale: 'es_CO',
      siteName: 'AhorroYa',
    },
    robots: { index: false, follow: true },
    alternates: { canonical: `${SITE_URL}/buscar` },
  };
}

const popularSearches = ['Arroz', 'Leche', 'Aceite', 'Café', 'Huevos', 'Pan', 'Acetaminofén', 'Detergente'];

export default async function BuscarPage({ searchParams }) {
  const { q } = await searchParams;
  const query = q || '';

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Inicio', url: '/' },
        { name: 'Buscar' },
      ]} />
      <WebSiteJsonLd />
      <div className="min-h-screen bg-zinc-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 pb-16">
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-2">
            {query ? `Resultados para "${query}"` : 'Buscar productos'}
          </h1>
          <p className="text-zinc-500 mb-6">Encuentra productos y compara precios en supermercados y farmacias</p>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 mb-8">
            <form action="/buscar" method="GET" className="relative">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Ej: arroz, leche, acetaminofén..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-4 pr-24 py-3.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-all"
                aria-label="Buscar productos"
                autoFocus={!query}
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
              >
                Buscar
              </button>
            </form>

            {!query && (
              <div className="mt-4">
                <p className="text-xs text-zinc-500 mb-2">Búsquedas populares:</p>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((s) => (
                    <Link
                      key={s}
                      href={`/buscar?q=${encodeURIComponent(s)}`}
                      className="text-xs bg-zinc-800 text-zinc-400 px-3 py-1.5 rounded-full hover:bg-zinc-700 hover:text-zinc-200 transition-colors"
                    >
                      {s}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {query && (
            <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl">
              <p className="text-zinc-500 mb-2">La búsqueda en tiempo real estará disponible próximamente.</p>
              <p className="text-sm text-zinc-600">
                Mientras tanto, explora nuestras <Link href="/categorias" className="text-emerald-500 hover:text-emerald-400">categorías</Link> o <Link href="/marcas" className="text-emerald-500 hover:text-emerald-400">marcas</Link>.
              </p>
            </div>
          )}

          {!query && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/categorias" className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 hover:border-emerald-500/30 transition-all group">
                <h3 className="font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors">Categorías</h3>
                <p className="text-sm text-zinc-500 mt-1">Explora productos por categoría</p>
              </Link>
              <Link href="/marcas" className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 hover:border-emerald-500/30 transition-all group">
                <h3 className="font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors">Marcas</h3>
                <p className="text-sm text-zinc-500 mt-1">Encuentra tus marcas favoritas</p>
              </Link>
              <Link href="/ciudades" className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 hover:border-emerald-500/30 transition-all group">
                <h3 className="font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors">Cobertura</h3>
                <p className="text-sm text-zinc-500 mt-1">Verifica tu ciudad</p>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
