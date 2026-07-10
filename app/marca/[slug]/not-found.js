import Link from 'next/link';

export default function BrandNotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🏷️</div>
        <h1 className="text-xl font-bold text-zinc-100 mb-2">Marca no encontrada</h1>
        <p className="text-zinc-500 mb-6">La marca que buscas no está disponible en nuestro catálogo.</p>
        <Link href="/marcas" className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-colors">Ver todas las marcas</Link>
      </div>
    </div>
  );
}
