import Link from 'next/link';
import { BreadcrumbJsonLd, WebSiteJsonLd } from '../../../components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahorroya.vercel.app';

export async function generateMetadata() {
  return {
    metadataBase: new URL(SITE_URL),
    title: 'Términos y Condiciones - AhorroYa',
    description: 'Términos y condiciones de uso de AhorroYa.',
    robots: { index: true, follow: true },
    alternates: { canonical: `${SITE_URL}/legal/terminos` },
  };
}

export default function TerminosPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: 'Inicio', url: '/' }, { name: 'Términos' }]} />
      <WebSiteJsonLd />
      <div className="min-h-screen bg-zinc-950">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 pb-20">
          <h1 className="text-3xl font-bold text-zinc-100 mb-6">Términos y Condiciones</h1>
          <div className="prose prose-invert max-w-none text-zinc-400 space-y-4">
            <p>Al usar AhorroYa, aceptas estos términos y condiciones. Si no estás de acuerdo, no uses el servicio.</p>
            <h2 className="text-xl font-semibold text-zinc-200 mt-8">Uso del servicio</h2>
            <p>AhorroYa es una plataforma de comparación de precios. Los precios mostrados son informativos y pueden variar. Verifica el precio final con el comercio correspondiente.</p>
            <h2 className="text-xl font-semibold text-zinc-200 mt-8">Precisión de la información</h2>
            <p>Hacemos nuestro mejor esfuerzo por mantener los precios actualizados, pero no garantizamos que toda la información esté libre de errores.</p>
            <h2 className="text-xl font-semibold text-zinc-200 mt-8">Cuentas de usuario</h2>
            <p>Eres responsable de mantener la confidencialidad de tu cuenta y contraseña.</p>
            <h2 className="text-xl font-semibold text-zinc-200 mt-8">Modificaciones</h2>
            <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán publicados en esta página.</p>
          </div>
          <div className="mt-8">
            <Link href="/" className="text-emerald-500 hover:text-emerald-400 transition-colors">← Volver al inicio</Link>
          </div>
        </div>
      </div>
    </>
  );
}
