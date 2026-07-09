import ExecutiveDashboardClient from './ExecutiveDashboardClient';

export async function generateMetadata() {
  return {
    title: 'Dashboard Ejecutivo - AhorroYa KPIs',
    description: 'Indicadores clave de rendimiento de la plataforma nacional de precios de Colombia.',
  };
}

export default function DashboardEjecutivoPage() {
  return <ExecutiveDashboardClient />;
}
