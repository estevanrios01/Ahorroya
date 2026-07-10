import { BreadcrumbJsonLd, WebSiteJsonLd } from '../../../components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahorroya.vercel.app';

export async function generateMetadata() {
  return {
    metadataBase: new URL(SITE_URL),
    title: 'Contacto - AhorroYa',
    description: 'Ponte en contacto con el equipo de AhorroYa. Estamos aquí para ayudarte.',
    openGraph: {
      title: 'Contacto - AhorroYa',
      description: 'Comunícate con nuestro equipo.',
      locale: 'es_CO',
      siteName: 'AhorroYa',
    },
    robots: { index: true, follow: true },
    alternates: { canonical: `${SITE_URL}/legal/contacto` },
  };
}

export default function ContactoPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: 'Inicio', url: '/' }, { name: 'Legal', url: '/legal' }, { name: 'Contacto' }]} />
      <WebSiteJsonLd />
      <h1 className="text-3xl font-bold text-zinc-100 mb-2">Contacto</h1>
      <p className="text-zinc-500 mb-8">Estamos aquí para ayudarte. Elige el canal que prefieras.</p>

      <div className="space-y-4">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-zinc-200 mb-1">Atención al Usuario</h2>
          <p className="text-zinc-400 text-sm">Dudas generales, sugerencias o reportes de errores.</p>
          <p className="text-emerald-500 mt-2 font-medium">hola@ahorroya.app</p>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-zinc-200 mb-1">Privacidad y Datos</h2>
          <p className="text-zinc-400 text-sm">Para ejercer tus derechos Habeas Data o consultas de privacidad.</p>
          <p className="text-emerald-500 mt-2 font-medium">privacidad@ahorroya.app</p>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-zinc-200 mb-1">Comercial</h2>
          <p className="text-zinc-400 text-sm">Para comercios interesados en aparecer en la plataforma.</p>
          <p className="text-emerald-500 mt-2 font-medium">comercial@ahorroya.app</p>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-zinc-200 mb-1">Redes Sociales</h2>
          <p className="text-zinc-400 text-sm">Síguenos para estar al tanto de las mejores ofertas.</p>
          <p className="text-zinc-300 mt-2">@ahorroya (Twitter, Instagram, Facebook)</p>
        </div>
      </div>

      <div className="mt-8 bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-5">
        <p className="text-sm text-zinc-500">
          <strong className="text-zinc-400">Tiempo de respuesta:</strong> Nos esforzamos por responder en un plazo máximo de 24 a 48 horas hábiles.
        </p>
      </div>
    </>
  );
}
