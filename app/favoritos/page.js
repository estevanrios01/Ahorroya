import Link from 'next/link';
import { BreadcrumbJsonLd, WebSiteJsonLd } from '../../components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahorroya.vercel.app';

export async function generateMetadata() {
  return {
    metadataBase: new URL(SITE_URL),
    title: 'Mis favoritos - AhorroYa',
    description: 'Tus productos favoritos guardados en AhorroYa.',
    robots: { index: false, follow: true },
    alternates: { canonical: `${SITE_URL}/favoritos` },
  };
}

export default function FavoritosPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Inicio', url: '/' },
        { name: 'Favoritos' },
      ]} />
      <WebSiteJsonLd />
      <div className="min-h-screen bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 pb-16">
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-2">Mis favoritos</h1>
          <p className="text-zinc-500 mb-8">Inicia sesión para guardar tus productos favoritos.</p>
          <Link href="/" className="text-emerald-500 hover:text-emerald-400 transition-colors">← Volver al inicio</Link>
        </div>
      </div>
    </>
  );
}
