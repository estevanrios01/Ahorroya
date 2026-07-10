import Link from 'next/link';
import { BreadcrumbJsonLd, WebSiteJsonLd } from '../../components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahorroya.vercel.app';

export async function generateMetadata() {
  return {
    metadataBase: new URL(SITE_URL),
    title: 'Mis favoritos - AhorroYa',
    description: 'Tus productos favoritos guardados en AhorroYa.',
    openGraph: {
      title: 'Mis favoritos - AhorroYa',
      description: 'Guarda y compara tus productos favoritos.',
      locale: 'es_CO',
      siteName: 'AhorroYa',
    },
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
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 pb-16">
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-2">Mis favoritos</h1>
          <p className="text-zinc-500 mb-8">Guardá tus productos para comparar precios fácilmente</p>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 sm:p-12 text-center">
            <div className="text-6xl mb-4">❤️</div>
            <h2 className="text-xl font-semibold text-zinc-200 mb-2">Tu lista de favoritos está vacía</h2>
            <p className="text-zinc-500 mb-6 max-w-sm mx-auto">
              Inicia sesión para guardar tus productos favoritos y recibe notificaciones cuando bajen de precio.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/auth" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-colors shadow-lg shadow-emerald-600/20">
                Iniciar sesión
              </Link>
              <Link href="/buscar" className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-medium rounded-xl transition-colors">
                Explorar productos
              </Link>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-semibold text-zinc-400 mb-3">¿Por qué guardar favoritos?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-zinc-500">
              <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-4">
                <div className="text-emerald-400 font-semibold mb-1">Recibe alertas</div>
                <p>Te notificamos cuando tus productos favoritos bajen de precio.</p>
              </div>
              <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-4">
                <div className="text-emerald-400 font-semibold mb-1">Compara rápido</div>
                <p>Accede a todos tus productos guardados desde un solo lugar.</p>
              </div>
              <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-4">
                <div className="text-emerald-400 font-semibold mb-1">Ahorra tiempo</div>
                <p>No pierdas tiempo buscando los mismos productos una y otra vez.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
