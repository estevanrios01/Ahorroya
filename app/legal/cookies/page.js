import { BreadcrumbJsonLd, WebSiteJsonLd } from '../../../components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahorroya.vercel.app';

export async function generateMetadata() {
  return {
    metadataBase: new URL(SITE_URL),
    title: 'Política de Cookies - AhorroYa',
    description: 'Política de cookies de AhorroYa. Conoce cómo usamos cookies y tecnologías similares en nuestra plataforma.',
    openGraph: {
      title: 'Política de Cookies - AhorroYa',
      description: 'Uso de cookies en la plataforma de comparación de precios.',
      locale: 'es_CO',
      siteName: 'AhorroYa',
    },
    robots: { index: true, follow: true },
    alternates: { canonical: `${SITE_URL}/legal/cookies` },
  };
}

export default function CookiesPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: 'Inicio', url: '/' }, { name: 'Legal', url: '/legal' }, { name: 'Cookies' }]} />
      <WebSiteJsonLd />
      <h1 className="text-3xl font-bold text-zinc-100 mb-6">Política de Cookies</h1>
      <p className="text-sm text-zinc-500 mb-8">Última actualización: Julio 2026</p>
      <div className="text-zinc-400 space-y-5 leading-relaxed">
        <p>En AhorroYa utilizamos cookies y tecnologías similares para mejorar tu experiencia de navegación, analizar el uso de la plataforma y ofrecerte contenido relevante. Esta política explica qué son las cookies, cómo las usamos y cómo puedes gestionarlas.</p>

        <h2 className="text-xl font-semibold text-zinc-200 mt-8">1. ¿Qué son las Cookies?</h2>
        <p>Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Permiten que el sitio recuerde tus preferencias y acciones durante un período de tiempo.</p>

        <h2 className="text-xl font-semibold text-zinc-200 mt-8">2. Tipos de Cookies que Usamos</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Cookies Esenciales:</strong> Necesarias para el funcionamiento básico del sitio. No pueden ser desactivadas. Ej: mantener tu sesión activa.</li>
          <li><strong>Cookies de Rendimiento:</strong> Nos ayudan a entender cómo los usuarios interactúan con la plataforma, qué páginas son más visitadas y si hay errores.</li>
          <li><strong>Cookies de Funcionalidad:</strong> Permiten recordar tus preferencias (como ciudad o productos favoritos) para ofrecerte una experiencia personalizada.</li>
        </ul>

        <h2 className="text-xl font-semibold text-zinc-200 mt-8">3. Cookies Específicas</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-left py-2 pr-4 text-zinc-300">Cookie</th>
                <th className="text-left py-2 pr-4 text-zinc-300">Tipo</th>
                <th className="text-left py-2 text-zinc-300">Propósito</th>
              </tr>
            </thead>
            <tbody className="text-zinc-400">
              <tr className="border-b border-zinc-800">
                <td className="py-2 pr-4">session</td>
                <td className="py-2 pr-4">Esencial</td>
                <td className="py-2">Mantener la sesión del usuario</td>
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="py-2 pr-4">favorites</td>
                <td className="py-2 pr-4">Funcionalidad</td>
                <td className="py-2">Guardar productos favoritos</td>
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="py-2 pr-4">city</td>
                <td className="py-2 pr-4">Funcionalidad</td>
                <td className="py-2">Recordar tu ciudad seleccionada</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-xl font-semibold text-zinc-200 mt-8">4. Gestión de Cookies</h2>
        <p>Puedes gestionar las cookies desde la configuración de tu navegador. La mayoría de navegadores te permiten bloquear o eliminar cookies. Sin embargo, al desactivar cookies esenciales, algunas funcionalidades del sitio pueden verse afectadas.</p>
        <p>Para más información sobre cómo gestionar cookies, visita:</p>
        <ul className="list-disc pl-5 space-y-1 text-emerald-500">
          <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400">Google Chrome</a></li>
          <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400">Mozilla Firefox</a></li>
          <li><a href="https://support.apple.com/es-co/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400">Safari</a></li>
          <li><a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-cookies-en-microsoft-edge" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400">Microsoft Edge</a></li>
        </ul>

        <h2 className="text-xl font-semibold text-zinc-200 mt-8">5. Cookies de Terceros</h2>
        <p>No utilizamos cookies de terceros para publicidad comportamental. Las únicas cookies de terceros son las de servicios esenciales como Supabase (autenticación).</p>

        <h2 className="text-xl font-semibold text-zinc-200 mt-8">6. Contacto</h2>
        <p>Si tienes preguntas sobre esta política, contáctanos en <strong>privacidad@ahorroya.app</strong>.</p>
      </div>
    </>
  );
}
