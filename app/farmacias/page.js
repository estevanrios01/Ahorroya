import Link from 'next/link';
import { BreadcrumbJsonLd, WebSiteJsonLd } from '../../components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahorroya.vercel.app';

const farmacias = [
  { name: 'Cruz Verde', slug: 'cruz-verde', description: 'Cadena de farmacias con cobertura nacional 24h' },
  { name: 'Farmatodo', slug: 'farmatodo', description: 'Farmacias con productos de cuidado personal' },
  { name: 'La Rebaja', slug: 'la-rebaja', description: 'Farmacias con precios bajos en medicamentos' },
];

export async function generateMetadata() {
  return {
    metadataBase: new URL(SITE_URL),
    title: 'Farmacias en Colombia - Compara precios | AhorroYa',
    description: 'Compara precios en las principales farmacias de Colombia: Cruz Verde, Farmatodo, La Rebaja y más.',
    robots: { index: true, follow: true },
    alternates: { canonical: `${SITE_URL}/farmacias` },
  };
}

export default function FarmaciasPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Inicio', url: '/' },
        { name: 'Farmacias' },
      ]} />
      <WebSiteJsonLd />
      <div className="min-h-screen bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 pb-16">
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-2">Farmacias</h1>
          <p className="text-zinc-500 mb-8">Compara precios en las farmacias de Colombia</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {farmacias.map((f) => (
              <Link key={f.slug} href={`/farmacia/${f.slug}`} className="block bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all group">
                <h2 className="text-lg font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors">{f.name}</h2>
                <p className="text-sm text-zinc-500 mt-1">{f.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
