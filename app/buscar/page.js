import { BreadcrumbJsonLd, WebSiteJsonLd } from '../../components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahorroya.vercel.app';

export async function generateMetadata({ searchParams }) {
  const q = (await searchParams)?.q || '';
  return {
    metadataBase: new URL(SITE_URL),
    title: q ? `"${q}" - Resultados de búsqueda | AhorroYa` : 'Buscar productos - AhorroYa',
    description: `Busca productos y compara precios en supermercados y farmacias de Colombia.${q ? ` Resultados para "${q}".` : ''}`,
    robots: { index: false, follow: true },
    alternates: { canonical: `${SITE_URL}/buscar` },
  };
}

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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 pb-16">
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-2">
            {query ? `Resultados para "${query}"` : 'Buscar productos'}
          </h1>
          <p className="text-zinc-500 mb-8">Función de búsqueda próximamente disponible.</p>
        </div>
      </div>
    </>
  );
}
