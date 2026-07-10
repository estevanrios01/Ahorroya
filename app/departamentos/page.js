import Link from 'next/link';
import { BreadcrumbJsonLd, WebSiteJsonLd } from '../../components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahorroya.vercel.app';

const departamentos = [
  { name: 'Valle del Cauca', slug: 'valle-del-cauca' },
  { name: 'Cundinamarca', slug: 'cundinamarca' },
  { name: 'Antioquia', slug: 'antioquia' },
  { name: 'Atlántico', slug: 'atlantico' },
  { name: 'Bolívar', slug: 'bolivar' },
  { name: 'Santander', slug: 'santander' },
];

export async function generateMetadata() {
  return {
    metadataBase: new URL(SITE_URL),
    title: 'Departamentos - Cobertura AhorroYa',
    description: 'AhorroYa tiene cobertura en los principales departamentos de Colombia.',
    robots: { index: true, follow: true },
    alternates: { canonical: `${SITE_URL}/departamentos` },
  };
}

export default function DepartamentosPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Inicio', url: '/' },
        { name: 'Departamentos' },
      ]} />
      <WebSiteJsonLd />
      <div className="min-h-screen bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 pb-16">
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-2">Departamentos</h1>
          <p className="text-zinc-500 mb-8">Departamentos donde AhorroYa tiene cobertura</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {departamentos.map((d) => (
              <Link key={d.slug} href={`/departamento/${d.slug}`} className="block bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all group">
                <h2 className="text-lg font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors">{d.name}</h2>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
