import { BreadcrumbJsonLd, WebSiteJsonLd } from '../../../components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahorroya.vercel.app';

export async function generateMetadata() {
  return {
    metadataBase: new URL(SITE_URL),
    title: 'Política de Privacidad - AhorroYa',
    description: 'Política de privacidad de AhorroYa. Conoce cómo recopilamos, usamos y protegemos tus datos personales en cumplimiento de la Ley 1581 de 2012.',
    openGraph: {
      title: 'Política de Privacidad - AhorroYa',
      description: 'Protección de datos personales en AhorroYa.',
      locale: 'es_CO',
      siteName: 'AhorroYa',
    },
    robots: { index: true, follow: true },
    alternates: { canonical: `${SITE_URL}/legal/privacidad` },
  };
}

export default function PrivacidadPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: 'Inicio', url: '/' }, { name: 'Legal', url: '/legal' }, { name: 'Privacidad' }]} />
      <WebSiteJsonLd />
      <h1 className="text-3xl font-bold text-zinc-100 mb-6">Política de Privacidad</h1>
      <p className="text-sm text-zinc-500 mb-8">Última actualización: Julio 2026</p>
      <div className="text-zinc-400 space-y-5 leading-relaxed">
        <p>En AhorroYa, la protección de tu privacidad es una prioridad. Esta política describe cómo recopilamos, usamos, almacenamos y protegemos tu información personal, en cumplimiento de la Ley Estatutaria 1581 de 2012 (Colombia) y el Decreto Reglamentario 1377 de 2013.</p>

        <h2 className="text-xl font-semibold text-zinc-200 mt-8">1. Responsable del Tratamiento</h2>
        <p>AhorroYa, con domicilio en Colombia, es el responsable del tratamiento de tus datos personales. Para cualquier consulta, escríbenos a privacidad@ahorroya.app.</p>

        <h2 className="text-xl font-semibold text-zinc-200 mt-8">2. Datos que Recopilamos</h2>
        <p>Recopilamos la siguiente información:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Datos de identificación: nombre, correo electrónico (cuando creas una cuenta).</li>
          <li>Datos de navegación: páginas visitadas, productos consultados, preferencias de búsqueda.</li>
          <li>Datos de dispositivo: dirección IP, tipo de navegador, sistema operativo.</li>
          <li>Cookies y tecnologías similares (ver nuestra <a href="/legal/cookies" className="text-emerald-500 hover:text-emerald-400">Política de Cookies</a>).</li>
        </ul>

        <h2 className="text-xl font-semibold text-zinc-200 mt-8">3. Finalidad del Tratamiento</h2>
        <p>Tus datos son utilizados para:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Proporcionar el servicio de comparación de precios.</li>
          <li>Personalizar tu experiencia y mostrarte información relevante.</li>
          <li>Enviar notificaciones sobre cambios de precios (si lo autorizas).</li>
          <li>Mejorar nuestros servicios mediante análisis de uso.</li>
          <li>Cumplir con obligaciones legales y regulatorias.</li>
        </ul>

        <h2 className="text-xl font-semibold text-zinc-200 mt-8">4. Derechos del Titular (Habeas Data)</h2>
        <p>De acuerdo con la Ley 1581 de 2012, tienes los siguientes derechos sobre tus datos:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Acceder</strong> a tus datos personales.</li>
          <li><strong>Conocer</strong> las actualizaciones y modificaciones de esta política.</li>
          <li><strong>Solicitar</strong> la corrección de datos inexactos o incompletos.</li>
          <li><strong>Solicitar</strong> la eliminación de tus datos cuando no sean necesarios.</li>
          <li><strong>Revocar</strong> la autorización para el tratamiento de datos.</li>
          <li><strong>Presentar</strong> quejas ante la Superintendencia de Industria y Comercio (SIC).</li>
        </ul>
        <p>Para ejercer estos derechos, contáctanos en <strong>privacidad@ahorroya.app</strong>. Responderemos en un plazo máximo de 15 días hábiles.</p>

        <h2 className="text-xl font-semibold text-zinc-200 mt-8">5. Seguridad de la Información</h2>
        <p>Implementamos medidas técnicas y organizativas para proteger tus datos contra acceso no autorizado, pérdida o destrucción. Usamos cifrado SSL/TLS, firewalls y controles de acceso estrictos.</p>

        <h2 className="text-xl font-semibold text-zinc-200 mt-8">6. Transferencia de Datos</h2>
        <p>No compartimos tus datos personales con terceros sin tu consentimiento, excepto cuando sea requerido por ley o para la prestación del servicio (proveedores de infraestructura cloud).</p>

        <h2 className="text-xl font-semibold text-zinc-200 mt-8">7. Conservación de Datos</h2>
        <p>Conservamos tus datos mientras sean necesarios para las finalidades descritas o mientras exista un deber legal de hacerlo. Una vez cumplida la finalidad, serán eliminados de forma segura.</p>

        <h2 className="text-xl font-semibold text-zinc-200 mt-8">8. Cambios a esta Política</h2>
        <p>Nos reservamos el derecho de modificar esta política en cualquier momento. Los cambios serán publicados en esta página con la fecha de actualización correspondiente.</p>
      </div>
    </>
  );
}
