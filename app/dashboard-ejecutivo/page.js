import ExecutiveDashboardClient from './ExecutiveDashboardClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahorroya.vercel.app';

export async function generateMetadata() {
  return {
    metadataBase: new URL(SITE_URL),
    title: 'Dashboard Ejecutivo - AhorroYa KPIs',
    description: 'Indicadores clave de rendimiento de la plataforma nacional de precios de Colombia.',
    openGraph: {
      title: 'Dashboard Ejecutivo - AhorroYa',
      description: 'Indicadores clave de rendimiento de la plataforma nacional de precios de Colombia.',
      locale: 'es_CO',
      siteName: 'AhorroYa',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Dashboard Ejecutivo - AhorroYa KPIs',
      description: 'Indicadores clave de rendimiento.',
    },
    robots: { index: false, follow: false },
    alternates: { canonical: `${SITE_URL}/dashboard-ejecutivo` },
  };
}

export default function DashboardEjecutivoPage() {
  return <ExecutiveDashboardClient />;
}
