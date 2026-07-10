import Link from 'next/link';
import { BreadcrumbJsonLd, WebSiteJsonLd } from '../../components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahorroya.vercel.app';

const ciudades = [
  { name: 'Cali', slug: 'cali', dept: 'Valle del Cauca' },
  { name: 'Bogotá', slug: 'bogota', dept: 'Cundinamarca' },
  { name: 'Medellín', slug: 'medellin', dept: 'Antioquia' },
  { name: 'Barranquilla', slug: 'barranquilla', dept: 'Atlántico' },
  { name: 'Cartagena', slug: 'cartagena', dept: 'Bolívar' },
  { name: 'Bucaramanga', slug: 'bucaramanga', dept: 'Santander' },
  { name: 'Pereira', slug: 'pereira', dept: 'Risaralda' },
  { name: 'Manizales', slug: 'manizales', dept: 'Caldas' },
  { name: 'Ibagué', slug: 'ibague', dept: 'Tolima' },
  { name: 'Cúcuta', slug: 'cucuta', dept: 'Norte de Santander' },
  { name: 'Villavicencio', slug: 'villavicencio', dept: 'Meta' },
  { name: 'Santa Marta', slug: 'santa-marta', dept: 'Magdalena' },
  { name: 'Neiva', slug: 'neiva', dept: 'Huila' },
  { name: 'Pasto', slug: 'pasto', dept: 'Nariño' },
  { name: 'Armenia', slug: 'armenia', dept: 'Quindío' },
];

export async function generateMetadata() {
  return {
    metadataBase: new URL(SITE_URL),
    title: 'Todas las ciudades - Cobertura AhorroYa',
    description: 'AhorroYa tiene cobertura en las principales ciudades de Colombia. Encuentra precios en tu ciudad.',
    robots: { index: true, follow: true },
    alternates: { canonical: `${SITE_URL}/ciudades` },
  };
}

export default function CiudadesPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Inicio', url: '/' },
        { name: 'Ciudades' },
      ]} />
      <WebSiteJsonLd />
      <div className="min-h-screen bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 pb-16">
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-2">Cobertura</h1>
          <p className="text-zinc-500 mb-8">Ciudades donde AhorroYa tiene cobertura</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ciudades.map((c) => (
              <Link key={c.slug} href={`/ciudad/${c.slug}`} className="block bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all group">
                <h2 className="text-lg font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors">{c.name}</h2>
                <p className="text-sm text-zinc-500 mt-1">{c.dept}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
