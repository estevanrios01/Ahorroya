import Link from 'next/link';
import { BreadcrumbJsonLd, WebSiteJsonLd } from '../../../components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahorroya.vercel.app';

export async function generateMetadata() {
  return {
    metadataBase: new URL(SITE_URL),
    title: 'Política de Privacidad - AhorroYa',
    description: 'Política de privacidad de AhorroYa. Conoce cómo manejamos tus datos.',
    robots: { index: true, follow: true },
    alternates: { canonical: `${SITE_URL}/legal/privacidad` },
  };
}

export default function PrivacidadPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: 'Inicio', url: '/' }, { name: 'Privacidad' }]} />
      <WebSiteJsonLd />
      <div className="min-h-screen bg-zinc-950">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 pb-20">
          <h1 className="text-3xl font-bold text-zinc-100 mb-6">Política de Privacidad</h1>
          <div className="prose prose-invert max-w-none text-zinc-400 space-y-4">
            <p>En AhorroYa, nos tomamos muy en serio tu privacidad. Esta política describe cómo recopilamos, usamos y protegemos tu información.</p>
            <h2 className="text-xl font-semibold text-zinc-200 mt-8">Información que recopilamos</h2>
            <p>Recopilamos información que nos proporcionas directamente, como tu correo electrónico al crear una cuenta, e información de uso como productos que buscas y precios que consultas.</p>
            <h2 className="text-xl font-semibold text-zinc-200 mt-8">Uso de la información</h2>
            <p>Usamos tu información para mostrarte precios relevantes, mejorar nuestros servicios y enviarte notificaciones sobre cambios de precios si lo solicitas.</p>
            <h2 className="text-xl font-semibold text-zinc-200 mt-8">Cookies</h2>
            <p>Utilizamos cookies esenciales para el funcionamiento del sitio. No usamos cookies de rastreo de terceros sin tu consentimiento.</p>
            <h2 className="text-xl font-semibold text-zinc-200 mt-8">Contacto</h2>
            <p>Si tienes preguntas sobre esta política, contáctanos en privacidad@ahorroya.app</p>
          </div>
          <div className="mt-8">
            <Link href="/" className="text-emerald-500 hover:text-emerald-400 transition-colors">← Volver al inicio</Link>
          </div>
        </div>
      </div>
    </>
  );
}
