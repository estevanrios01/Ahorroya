import Link from 'next/link';
import ProductGrid from '../../components/product/ProductGrid';
import { BreadcrumbJsonLd, WebSiteJsonLd } from '../../components/seo/JsonLd';
import { db } from '../../services/database';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahorroya.vercel.app';

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const q = params?.q || '';
  const city = params?.city || '';
  return {
    metadataBase: new URL(SITE_URL),
    title: q ? `"${q}" - Resultados de busqueda | AhorroYa` : 'Buscar productos - AhorroYa',
    description: `Busca productos y compara precios en supermercados y farmacias de Colombia.${q ? ` Resultados para "${q}".` : ''}${city ? ` Filtro en ${city}.` : ''}`,
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

const popularSearches = ['Arroz', 'Leche', 'Aceite', 'Cafe', 'Huevos', 'Pan', 'Acetaminofen', 'Detergente'];

function toProductCard(product) {
  const listings = (product.store_products || []).filter((item) => item.available !== false && item.price != null);
  const ordered = [...listings].sort((a, b) => Number(a.price) - Number(b.price));
  const best = ordered[0];
  const originalPrice = best?.original_price ? Number(best.original_price) : null;

  return {
    id: product.id,
    name: product.name,
    brand: product.brands?.name || '',
    price: best ? Number(best.price) : null,
    oldPrice: originalPrice && best && originalPrice > Number(best.price) ? originalPrice : null,
    storesCount: new Set(listings.map((item) => item.store_id)).size,
    slug: product.slug,
    presentation: product.unit || product.short_name || '',
    image: product.image,
    isCheapest: ordered.length > 1,
  };
}

export default async function BuscarPage({ searchParams }) {
  const params = await searchParams;
  const query = params?.q || '';
  const city = params?.city || '';
  const [{ data: cities }, result] = await Promise.all([
    db.cities.list(),
    query || city ? db.products.list({ q: query, city, limit: 48 }) : Promise.resolve({ data: [], pagination: { total: 0 } }),
  ]);
  const products = (result.data || [])
    .map(toProductCard)
    .filter((product) => query || product.image);
  const total = result.pagination?.total || products.length;

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Inicio', url: '/' },
        { name: 'Buscar' },
      ]} />
      <WebSiteJsonLd />
      <div className="min-h-screen bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 pb-16">
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-2">
            {query ? `Resultados para "${query}"` : 'Buscar productos'}
          </h1>
          <p className="text-zinc-500 mb-6">Compara productos por precio, ciudad y disponibilidad en comercios cercanos.</p>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 sm:p-6 mb-8">
            <form action="/buscar" method="GET" className="grid grid-cols-1 md:grid-cols-[1fr_220px_auto] gap-3">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Ej: arroz, leche, acetaminofen..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-all"
                aria-label="Buscar productos"
                autoFocus={!query}
              />
              <select
                name="city"
                defaultValue={city}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500/50 transition-all"
                aria-label="Filtrar por ciudad"
              >
                <option value="">Todas las ciudades</option>
                {(cities || []).map((item) => (
                  <option key={item.slug} value={item.name}>{item.name}</option>
                ))}
              </select>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-6 py-3.5 rounded-xl transition-colors"
              >
                Buscar
              </button>
            </form>

            {!query && !city && (
              <div className="mt-4">
                <p className="text-xs text-zinc-500 mb-2">Busquedas populares:</p>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((search) => (
                    <Link
                      key={search}
                      href={`/buscar?q=${encodeURIComponent(search)}`}
                      className="text-xs bg-zinc-800 text-zinc-400 px-3 py-1.5 rounded-full hover:bg-zinc-700 hover:text-zinc-200 transition-colors"
                    >
                      {search}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {(query || city) && (
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-zinc-500">
                {total.toLocaleString('es-CO')} productos encontrados{city ? ` en ${city}` : ''}
              </p>
              <Link href="/ciudades" className="text-sm text-emerald-400 hover:text-emerald-300">Ver cobertura</Link>
            </div>
          )}

          {products.length > 0 && <ProductGrid products={products} />}

          {(query || city) && products.length === 0 && (
            <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl">
              <p className="text-zinc-500 mb-2">No encontramos productos con esos filtros.</p>
              <p className="text-sm text-zinc-600">
                Prueba con otra ciudad o explora <Link href="/categorias" className="text-emerald-500 hover:text-emerald-400">categorias</Link>.
              </p>
            </div>
          )}

          {!query && !city && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/categorias" className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 hover:border-emerald-500/30 transition-all group">
                <h3 className="font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors">Categorias</h3>
                <p className="text-sm text-zinc-500 mt-1">Explora productos por categoria</p>
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
