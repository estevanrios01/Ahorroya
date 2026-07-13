import Link from 'next/link';
import ProductGrid from '../../components/product/ProductGrid';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import PageControls from '../../components/layout/PageControls';
import { BreadcrumbJsonLd, WebSiteJsonLd } from '../../components/seo/JsonLd';
import { db } from '../../services/database';
import { getLiveFallbackProducts } from '../../services/liveFallbackProducts';
import { fallbackCities, withTimeout } from '../../services/fallbackCatalog';

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
    storesCount: new Set(listings.map((item) => item.store_id || item.stores?.slug)).size,
    bestStore: best?.stores?.name || '',
    store_products: listings,
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
  const [{ data: cities }, result] = await Promise.allSettled([
    withTimeout(db.cities.list(), 700, 'cities timeout'),
    query || city ? withTimeout(db.products.list({ q: query, city, limit: 48 }), 1200, 'search timeout') : Promise.resolve({ data: [], pagination: { total: 0 } }),
  ]).then(async ([citiesResult, productsResult]) => {
    const cityPayload = citiesResult.status === 'fulfilled' ? citiesResult.value : { data: fallbackCities };
    const databaseResult = productsResult.status === 'fulfilled' ? productsResult.value : null;
    if (!query && !city) return [cityPayload, databaseResult || { data: [], pagination: { total: 0 } }];
    if (databaseResult && !databaseResult.error && databaseResult.data?.length) {
      return [cityPayload, productsResult.value];
    }
    const fallback = await getLiveFallbackProducts({ q: query, limit: 24 }).catch(() => []);
    return [cityPayload, {
      data: fallback,
      degraded: true,
      cityVerified: !city,
      pagination: { total: fallback.length },
    }];
  });
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
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-8 pb-16 sm:px-6 lg:px-8">
          <PageControls forwardHref="/categorias" />
          <h1 className="mb-2 text-2xl font-bold text-zinc-100 sm:text-3xl">
            {query ? `Resultados para "${query}"` : 'Buscar productos'}
          </h1>
          <p className="mb-6 text-zinc-500">Compara productos por precio, ciudad y disponibilidad en comercios cercanos.</p>

          <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 sm:p-6">
            <form action="/buscar" method="GET" className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px_auto]">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Ej: arroz, leche, acetaminofen..."
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3.5 text-sm text-zinc-100 transition-all placeholder:text-zinc-500 focus:border-emerald-500/50 focus:outline-none"
                aria-label="Buscar productos"
                autoFocus={!query}
              />
              <select
                name="city"
                defaultValue={city}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3.5 text-sm text-zinc-100 transition-all focus:border-emerald-500/50 focus:outline-none"
                aria-label="Filtrar por ciudad"
              >
                <option value="">Todas las ciudades</option>
                {(cities || []).map((item) => (
                  <option key={item.slug} value={item.name}>{item.name}</option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
              >
                Buscar
              </button>
            </form>

            {!query && !city && (
              <div className="mt-4">
                <p className="mb-2 text-xs text-zinc-500">Busquedas populares:</p>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((search) => (
                    <Link
                      key={search}
                      href={`/buscar?q=${encodeURIComponent(search)}`}
                      className="rounded-full bg-zinc-800 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
                    >
                      {search}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {(query || city) && (
            <div className="mb-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-500">
                  {total.toLocaleString('es-CO')} productos encontrados{city && result.cityVerified !== false ? ` en ${city}` : ''}
                </p>
                <Link href="/ciudades" className="text-sm text-emerald-400 hover:text-emerald-300">Ver cobertura</Link>
              </div>
              {city && result.cityVerified === false && (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                  La base por ciudad no respondio. Mostramos precios vivos disponibles, pero todavia no estan verificados especificamente para {city}.
                </div>
              )}
            </div>
          )}

          {products.length > 0 && <ProductGrid products={products} />}

          {(query || city) && products.length === 0 && (
            <div className="rounded-2xl border border-dashed border-zinc-800 py-12 text-center">
              <p className="mb-2 text-zinc-500">No encontramos productos con esos filtros.</p>
              <p className="text-sm text-zinc-600">
                Prueba con otra ciudad o explora <Link href="/categorias" className="text-emerald-500 hover:text-emerald-400">categorias</Link>.
              </p>
            </div>
          )}

          {!query && !city && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Link href="/categorias" className="group rounded-xl border border-zinc-800 bg-zinc-900/80 p-5 transition-all hover:border-emerald-500/30">
                <h3 className="font-semibold text-zinc-200 transition-colors group-hover:text-emerald-400">Categorias</h3>
                <p className="mt-1 text-sm text-zinc-500">Explora productos por categoria</p>
              </Link>
              <Link href="/marcas" className="group rounded-xl border border-zinc-800 bg-zinc-900/80 p-5 transition-all hover:border-emerald-500/30">
                <h3 className="font-semibold text-zinc-200 transition-colors group-hover:text-emerald-400">Marcas</h3>
                <p className="mt-1 text-sm text-zinc-500">Encuentra tus marcas favoritas</p>
              </Link>
              <Link href="/ciudades" className="group rounded-xl border border-zinc-800 bg-zinc-900/80 p-5 transition-all hover:border-emerald-500/30">
                <h3 className="font-semibold text-zinc-200 transition-colors group-hover:text-emerald-400">Cobertura</h3>
                <p className="mt-1 text-sm text-zinc-500">Verifica tu ciudad</p>
              </Link>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}
