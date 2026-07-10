import Link from 'next/link';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahorroya.vercel.app';

export async function generateMetadata() {
  return {
    metadataBase: new URL(SITE_URL),
    title: 'Panel de Administración - AhorroYa',
    description: 'Panel de administración de AhorroYa. Gestión de productos, precios, scrapers, calidad y configuración.',
    robots: { index: false, follow: false },
  };
}

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-zinc-100 mb-2">Panel de Administración</h1>
        <p className="text-zinc-500 mb-6">El panel de administración se encuentra en una aplicación separada.</p>
        <p className="text-zinc-500 mb-8">Accede a través del subdominio admin.ahorroya.app</p>
        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-colors">Volver al inicio</Link>
      </div>
    </div>
  );
}
