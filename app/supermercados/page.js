import Link from 'next/link';
import { ArrowRight, MapPin, Store } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { BreadcrumbJsonLd, WebSiteJsonLd } from '../../components/seo/JsonLd';
import { db } from '../../services/database';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahorroya.vercel.app';

const fallbackSupermarkets = [
  { name: 'Éxito', slug: 'exito', branchCount: 120 },
  { name: 'Olímpica', slug: 'olimpica', branchCount: 95 },
  { name: 'Jumbo', slug: 'jumbo', branchCount: 42 },
  { name: 'Carulla', slug: 'carulla', branchCount: 38 },
  { name: 'D1', slug: 'd1', branchCount: 80 },
  { name: 'Ara', slug: 'ara', branchCount: 72 },
  { name: 'Makro', slug: 'makro', branchCount: 18 },
  { name: 'Metro', slug: 'metro', branchCount: 25 },
  { name: 'Super Inter', slug: 'super-inter', branchCount: 34 },
  { name: 'Surtimax', slug: 'surtimax', branchCount: 28 },
  { name: 'Mercamio', slug: 'mercamio', branchCount: 18 },
  { name: 'La Vaquita', slug: 'la-vaquita', branchCount: 16 },
];

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
  try {
    const result = await Promise.race([
      db.stores.list({ limit: 200 }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('stores timeout')), 7000)),
    ]);
    const stores = (result.data || []).filter((store) => store.category === 'Supermercado');
    if (!stores.length) return fallbackSupermarkets;
    return stores
      .map((store) => ({ ...store, branchCount: store.branches || 0 }))
      .sort((a, b) => b.branchCount - a.branchCount || a.name.localeCompare(b.name));
  } catch {
    return fallbackSupermarkets;
  }
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
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-8 pb-16 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-3xl">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-emerald-400">Cobertura nacional</p>
            <h1 className="text-3xl font-bold text-zinc-100 sm:text-4xl">Supermercados</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-500">
              Explora cadenas nacionales y regionales para comparar precios publicados por producto y ciudad.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {supermercados.map((store) => (
              <Link
                key={store.slug}
                href={`/supermercado/${store.slug}`}
                className="group rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 transition-all hover:border-emerald-500/30 hover:bg-zinc-900"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                    <Store size={22} />
                  </div>
                  <ArrowRight size={18} className="text-zinc-600 transition-colors group-hover:text-emerald-400" />
                </div>
                <h2 className="text-lg font-semibold text-zinc-100 transition-colors group-hover:text-emerald-400">{store.name}</h2>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-zinc-500">
                  <MapPin size={14} />
                  {store.branchCount || 0} sedes en seguimiento
                </p>
              </Link>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
