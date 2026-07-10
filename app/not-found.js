import Link from 'next/link';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export const metadata = {
  title: '404 - Página no encontrada | AhorroYa',
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Header />
      <div className="flex items-center justify-center px-4 py-24">
        <div className="text-center max-w-lg">
          <div className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-emerald-600 to-zinc-800 leading-none mb-6">
            404
          </div>
          <div className="w-16 h-1 bg-emerald-600 rounded-full mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-zinc-100 mb-3">Página no encontrada</h1>
          <p className="text-zinc-500 mb-8 max-w-sm mx-auto leading-relaxed">
            La página que buscas no existe, fue movida o está temporalmente fuera de servicio.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-colors shadow-lg shadow-emerald-600/20"
            >
              Volver al inicio
            </Link>
            <Link
              href="/buscar"
              className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-medium rounded-xl transition-colors"
            >
              Buscar productos
            </Link>
          </div>
          <div className="mt-12 flex items-center justify-center gap-6 text-xs text-zinc-700">
            <Link href="/categorias" className="hover:text-zinc-500 transition-colors">Categorías</Link>
            <Link href="/marcas" className="hover:text-zinc-500 transition-colors">Marcas</Link>
            <Link href="/ciudades" className="hover:text-zinc-500 transition-colors">Ciudades</Link>
            <Link href="/legal/contacto" className="hover:text-zinc-500 transition-colors">Contacto</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
