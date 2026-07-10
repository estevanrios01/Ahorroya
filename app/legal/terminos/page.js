import { BreadcrumbJsonLd, WebSiteJsonLd } from '../../../components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahorroya.vercel.app';

export async function generateMetadata() {
  return {
    metadataBase: new URL(SITE_URL),
    title: 'Términos y Condiciones - AhorroYa',
    description: 'Términos y condiciones de uso de la plataforma AhorroYa. Al usar nuestro servicio aceptas estos términos.',
    openGraph: {
      title: 'Términos y Condiciones - AhorroYa',
      description: 'Condiciones de uso de la plataforma de comparación de precios.',
      locale: 'es_CO',
      siteName: 'AhorroYa',
    },
    robots: { index: true, follow: true },
    alternates: { canonical: `${SITE_URL}/legal/terminos` },
  };
}

export default function TerminosPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: 'Inicio', url: '/' }, { name: 'Legal', url: '/legal' }, { name: 'Términos' }]} />
      <WebSiteJsonLd />
      <h1 className="text-3xl font-bold text-zinc-100 mb-6">Términos y Condiciones</h1>
      <p className="text-sm text-zinc-500 mb-8">Última actualización: Julio 2026</p>
      <div className="text-zinc-400 space-y-5 leading-relaxed">
        <p>Bienvenido a AhorroYa. Al acceder y usar esta plataforma, aceptas los siguientes términos y condiciones. Si no estás de acuerdo, por favor no uses el servicio.</p>

        <h2 className="text-xl font-semibold text-zinc-200 mt-8">1. Descripción del Servicio</h2>
        <p>AhorroYa es una plataforma tecnológica que permite a los usuarios comparar precios de productos en supermercados y farmacias de Colombia. La información de precios es proporcionada con fines informativos y puede no reflejar el precio exacto al momento de la compra.</p>

        <h2 className="text-xl font-semibold text-zinc-200 mt-8">2. Precisión de la Información</h2>
        <p>Hacemos nuestro mejor esfuerzo por mantener los precios actualizados. Sin embargo, los precios pueden variar sin previo aviso. Te recomendamos verificar el precio final directamente con el comercio. AhorroYa no se hace responsable por diferencias entre los precios mostrados y los precios reales.</p>

        <h2 className="text-xl font-semibold text-zinc-200 mt-8">3. Registro de Cuenta</h2>
        <p>Para acceder a ciertas funcionalidades, puedes crear una cuenta. Eres responsable de mantener la confidencialidad de tus credenciales y de todas las actividades realizadas con tu cuenta. Notifica inmediatamente cualquier uso no autorizado.</p>

        <h2 className="text-xl font-semibold text-zinc-200 mt-8">4. Uso Aceptable</h2>
        <p>Te comprometes a usar la plataforma de manera legal y ética. No está permitido:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Realizar scraping automatizado sin autorización.</li>
          <li>Publicar información falsa o engañosa.</li>
          <li>Intentar acceder a sistemas o datos no autorizados.</li>
          <li>Usar el servicio para fines ilegales o fraudulentos.</li>
        </ul>

        <h2 className="text-xl font-semibold text-zinc-200 mt-8">5. Propiedad Intelectual</h2>
        <p>Todos los derechos de propiedad intelectual de la plataforma (código, diseño, marca) pertenecen a AhorroYa. No está permitida la reproducción, distribución o modificación sin autorización expresa.</p>

        <h2 className="text-xl font-semibold text-zinc-200 mt-8">6. Limitación de Responsabilidad</h2>
        <p>AhorroYa no será responsable por daños directos, indirectos, incidentales o consecuentes derivados del uso o la imposibilidad de usar el servicio. La plataforma se proporciona &ldquo;tal cual&rdquo; sin garantías de disponibilidad continua.</p>

        <h2 className="text-xl font-semibold text-zinc-200 mt-8">7. Modificaciones</h2>
        <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán publicados en esta página con la fecha de actualización. El uso continuado del servicio después de los cambios constituye la aceptación de los nuevos términos.</p>

        <h2 className="text-xl font-semibold text-zinc-200 mt-8">8. Legislación Aplicable</h2>
        <p>Estos términos se rigen por las leyes de la República de Colombia. Cualquier controversia será sometida a los jueces y tribunales de Cali, Colombia.</p>
      </div>
    </>
  );
}
