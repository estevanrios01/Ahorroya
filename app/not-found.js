import Link from 'next/link';

export const metadata = {
  title: '404 - Página no encontrada | AhorroYa',
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-zinc-800 mb-4">404</div>
        <h1 className="text-2xl font-bold text-zinc-100 mb-2">Página no encontrada</h1>
        <p className="text-zinc-500 mb-8">La página que buscas no existe o ha sido movida.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
