import Link from 'next/link';
import { BreadcrumbJsonLd, WebSiteJsonLd } from '../../components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahorroya.vercel.app';

const supermercados = [
  { name: 'Éxito', slug: 'exito', description: 'Cadena líder de supermercados en Colombia' },
  { name: 'D1', slug: 'd1', description: 'Tiendas de descuento con precios bajos' },
  { name: 'Jumbo', slug: 'jumbo', description: 'Hipermercado con gran variedad de productos' },
  { name: 'Olímpica', slug: 'olimpica', description: 'Supermercados con promociones frecuentes' },
  { name: 'Ara', slug: 'ara', description: 'Tiendas de cercanía con precios competitivos' },
  { name: 'Carulla', slug: 'carulla', description: 'Supermercado con productos frescos y gourmet' },
  { name: 'Makro', slug: 'makro', description: 'Supermercado mayorista' },
];

export async function generateMetadata() {
  return {
    metadataBase: new URL(SITE_URL),
    title: 'Supermercados en Colombia - Compara precios | AhorroYa',
    description: 'Compara precios en los principales supermercados de Colombia: Éxito, D1, Jumbo, Olímpica, Ara, Carulla y más.',
    robots: { index: true, follow: true },
    alternates: { canonical: `${SITE_URL}/supermercados` },
  };
}

export default function SupermercadosPage() {
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
          <p className="text-zinc-500 mb-8">Compara precios en los supermercados de Colombia</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {supermercados.map((s) => (
              <Link key={s.slug} href={`/supermercado/${s.slug}`} className="block bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all group">
                <h2 className="text-lg font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors">{s.name}</h2>
                <p className="text-sm text-zinc-500 mt-1">{s.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
