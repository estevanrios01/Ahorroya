import Link from 'next/link';
import { BreadcrumbJsonLd, WebSiteJsonLd } from '../../components/seo/JsonLd';
import { db } from '../../services/database';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahorroya.vercel.app';

export async function generateMetadata() {
  return {
    metadataBase: new URL(SITE_URL),
    title: 'Supermercados en Colombia - Compara precios | AhorroYa',
    description: 'Compara precios en supermercados y tiendas de Colombia con sedes activas y productos publicados.',
    robots: { index: true, follow: true },
    alternates: { canonical: `${SITE_URL}/supermercados` },
  };
}

async function getSupermarkets() {
  const result = await db.stores.list({ limit: 200 });
  const stores = (result.data || []).filter((store) => store.category === 'Supermercado');
  const enriched = await Promise.all(stores.map(async (store) => {
    const branches = await db.stores.getBranches(store.id);
    return { ...store, branchCount: branches.data?.length || 0 };
  }));
  return enriched.sort((a, b) => b.branchCount - a.branchCount || a.name.localeCompare(b.name));
}

export default async function SupermercadosPage() {
  const supermercados = await getSupermarkets();

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Inicio', url: '/' },
        { name: 'Supermercados' },
      ]} />
      <WebSiteJsonLd />
      <div className="min-h-screen bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 pb-16">
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-2">Supermercados</h1>
          <p className="text-zinc-500 mb-8">
            {supermercados.length} cadenas y comercios con sedes activas para comparar precios en Colombia
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {supermercados.map((store) => (
              <Link
                key={store.slug}
                href={`/supermercado/${store.slug}`}
                className="block bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all group"
              >
                <h2 className="text-lg font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors">
                  {store.name}
                </h2>
                <p className="text-sm text-zinc-500 mt-1">{store.branchCount} sedes activas en la base nacional</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
