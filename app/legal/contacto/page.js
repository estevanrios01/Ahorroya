import Link from 'next/link';
import { BreadcrumbJsonLd, WebSiteJsonLd } from '../../../components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahorroya.vercel.app';

export async function generateMetadata() {
  return {
    metadataBase: new URL(SITE_URL),
    title: 'Contacto - AhorroYa',
    description: 'Ponte en contacto con el equipo de AhorroYa.',
    robots: { index: true, follow: true },
    alternates: { canonical: `${SITE_URL}/legal/contacto` },
  };
}

export default function ContactoPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: 'Inicio', url: '/' }, { name: 'Contacto' }]} />
      <WebSiteJsonLd />
      <div className="min-h-screen bg-zinc-950">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 pb-20">
          <h1 className="text-3xl font-bold text-zinc-100 mb-6">Contacto</h1>
          <p className="text-zinc-400 mb-8">¿Tienes preguntas, sugerencias o necesitas ayuda? Escríbenos.</p>
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 mb-8">
            <p className="text-zinc-300 mb-2"><strong>Email:</strong> hola@ahorroya.app</p>
            <p className="text-zinc-300"><strong>Redes:</strong> @ahorroya</p>
          </div>
          <Link href="/" className="text-emerald-500 hover:text-emerald-400 transition-colors">← Volver al inicio</Link>
        </div>
      </div>
    </>
  );
}
