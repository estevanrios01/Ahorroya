import Link from 'next/link';
import { ArrowRight, MapPin, Pill } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { BreadcrumbJsonLd, WebSiteJsonLd } from '../../components/seo/JsonLd';
import { db } from '../../services/database';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahorroya.vercel.app';

const fallbackPharmacies = [
  { name: 'Farmatodo', slug: 'farmatodo', branchCount: 85 },
  { name: 'Cruz Verde', slug: 'cruz-verde', branchCount: 110 },
  { name: 'La Rebaja', slug: 'larebaja', branchCount: 74 },
  { name: 'Locatel', slug: 'locatel', branchCount: 26 },
  { name: 'Pasteur', slug: 'pasteur', branchCount: 34 },
  { name: 'Colsubsidio', slug: 'colsubsidio', branchCount: 32 },
  { name: 'Droguerías Cafam', slug: 'cafam', branchCount: 24 },
  { name: 'Medipiel', slug: 'medipiel', branchCount: 18 },
  { name: 'Bella Piel', slug: 'bellapiel', branchCount: 14 },
];

export async function generateMetadata() {
  return {
    metadataBase: new URL(SITE_URL),
    title: 'Farmacias en Colombia - Compara precios | AhorroYa',
    description: 'Compara precios en farmacias y droguerías de Colombia con sedes activas y productos publicados.',
    robots: { index: true, follow: true },
    alternates: { canonical: `${SITE_URL}/farmacias` },
  };
}

async function getPharmacies() {
  try {
    const result = await Promise.race([
      db.stores.list({ limit: 200 }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('stores timeout')), 7000)),
    ]);
    const stores = (result.data || []).filter((store) => ['Farmacia', 'Drogueria', 'Droguería'].includes(store.category));
    if (!stores.length) return fallbackPharmacies;
    return stores
      .map((store) => ({ ...store, branchCount: store.branches || 0 }))
      .sort((a, b) => b.branchCount - a.branchCount || a.name.localeCompare(b.name));
  } catch {
    return fallbackPharmacies;
  }
}

export default async function FarmaciasPage() {
  const farmacias = await getPharmacies();

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Inicio', url: '/' },
        { name: 'Farmacias' },
      ]} />
      <WebSiteJsonLd />
      <div className="min-h-screen bg-zinc-950">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-8 pb-16 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-3xl">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-emerald-400">Medicamentos y cuidado personal</p>
            <h1 className="text-3xl font-bold text-zinc-100 sm:text-4xl">Farmacias</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-500">
              Revisa farmacias y droguerías con cobertura nacional para comparar precios de productos de salud, bienestar y cuidado personal.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {farmacias.map((store) => (
              <Link
                key={store.slug}
                href={`/farmacia/${store.slug}`}
                className="group rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 transition-all hover:border-emerald-500/30 hover:bg-zinc-900"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                    <Pill size={22} />
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
