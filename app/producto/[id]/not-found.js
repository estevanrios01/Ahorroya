import Link from 'next/link';

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-xl font-bold text-zinc-100 mb-2">Producto no encontrado</h1>
        <p className="text-zinc-500 mb-6">El producto que buscas no está disponible en nuestro catálogo.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/buscar" className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-colors">Buscar productos</Link>
          <Link href="/categorias" className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-sm font-medium rounded-xl transition-colors">Ver categorías</Link>
        </div>
      </div>
    </div>
  );
}
