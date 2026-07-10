import { BreadcrumbJsonLd, WebSiteJsonLd } from '../../../components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahorroya.vercel.app';

export async function generateMetadata() {
  return {
    metadataBase: new URL(SITE_URL),
    title: 'Protección de Datos - Habeas Data - AhorroYa',
    description: 'Cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013. Conoce tus derechos Habeas Data en Colombia.',
    openGraph: {
      title: 'Protección de Datos - AhorroYa',
      description: 'Cumplimiento Habeas Data y protección de datos personales.',
      locale: 'es_CO',
      siteName: 'AhorroYa',
    },
    robots: { index: true, follow: true },
    alternates: { canonical: `${SITE_URL}/legal/datos` },
  };
}

export default function DatosPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: 'Inicio', url: '/' }, { name: 'Legal', url: '/legal' }, { name: 'Protección de Datos' }]} />
      <WebSiteJsonLd />
      <h1 className="text-3xl font-bold text-zinc-100 mb-6">Protección de Datos Personales</h1>
      <p className="text-sm text-zinc-500 mb-8">Cumplimiento Habeas Data - Ley 1581 de 2012 y Decreto 1377 de 2013</p>
      <div className="text-zinc-400 space-y-5 leading-relaxed">
        <p>En cumplimiento de la Ley Estatutaria 1581 de 2012 &quot;Por la cual se dictan disposiciones generales para la protección de datos personales&quot; y el Decreto Reglamentario 1377 de 2013, AhorroYa presenta la siguiente información sobre el tratamiento de datos personales.</p>

        <h2 className="text-xl font-semibold text-zinc-200 mt-8">Autorización</h2>
        <p>Al utilizar nuestros servicios y proporcionar tus datos personales, nos autorizas de manera libre, previa, expresa e inequívoca para tratar tus datos conforme a lo establecido en nuestra <a href="/legal/privacidad" className="text-emerald-500 hover:text-emerald-400">Política de Privacidad</a>.</p>

        <h2 className="text-xl font-semibold text-zinc-200 mt-8">Derechos Habeas Data</h2>
        <p>La Ley 1581 de 2012 reconoce los siguientes derechos a los titulares de datos personales:</p>
        <ol className="list-decimal pl-5 space-y-2">
          <li><strong>Acceso:</strong> Conocer qué datos personales tenemos y cómo los tratamos.</li>
          <li><strong>Actualización:</strong> Solicitar la corrección de datos inexactos o incompletos.</li>
          <li><strong>Rectificación:</strong> Modificar datos cuando sean incorrectos.</li>
          <li><strong>Supresión:</strong> Solicitar la eliminación de tus datos cuando no sean necesarios.</li>
          <li><strong>Revocación:</strong> Revocar la autorización para el tratamiento de datos.</li>
          <li><strong>Información:</strong> Ser informado sobre el uso de tus datos.</li>
          <li><strong>Oposición:</strong> Oponerte al tratamiento de datos para fines específicos.</li>
        </ol>

        <h2 className="text-xl font-semibold text-zinc-200 mt-8">Procedimiento para Ejercer tus Derechos</h2>
        <p>Para ejercer cualquiera de tus derechos, envía una solicitud escrita a:</p>
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 my-4">
          <p className="text-zinc-300"><strong>Email:</strong> privacidad@ahorroya.app</p>
          <p className="text-zinc-300 mt-2"><strong>Asunto:</strong> Solicitud Habeas Data</p>
          <p className="text-zinc-300 mt-2"><strong>Información requerida:</strong> Nombre completo, identificación, correo electrónico registrado, descripción clara de la solicitud.</p>
        </div>
        <p>Responderemos tu solicitud en un plazo máximo de <strong>15 días hábiles</strong>. Si la solicitud resulta compleja, te informaremos antes del vencimiento del plazo inicial.</p>

        <h2 className="text-xl font-semibold text-zinc-200 mt-8">Reclamos ante la SIC</h2>
        <p>Si consideras que tus derechos no han sido atendidos, puedes presentar una queja ante la <strong>Superintendencia de Industria y Comercio (SIC)</strong>:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Sitio web: <a href="https://www.sic.gov.co" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-400">www.sic.gov.co</a></li>
          <li>Línea gratuita nacional: 01-8000-910-165</li>
          <li>Bogotá: 601 587 0000</li>
        </ul>

        <h2 className="text-xl font-semibold text-zinc-200 mt-8">Políticas de Tratamiento</h2>
        <p>Nuestras políticas de tratamiento de datos personales están disponibles en:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><a href="/legal/privacidad" className="text-emerald-500 hover:text-emerald-400">Política de Privacidad</a></li>
          <li><a href="/legal/cookies" className="text-emerald-500 hover:text-emerald-400">Política de Cookies</a></li>
          <li><a href="/legal/terminos" className="text-emerald-500 hover:text-emerald-400">Términos y Condiciones</a></li>
        </ul>

        <h2 className="text-xl font-semibold text-zinc-200 mt-8">Vigencia</h2>
        <p>Esta política de tratamiento de datos personales rige a partir de Julio de 2026 y se mantendrá vigente mientras AhorroYa preste sus servicios, salvo modificaciones que serán debidamente comunicadas.</p>
      </div>
    </>
  );
}
