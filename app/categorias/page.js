import Link from 'next/link';
import { BreadcrumbJsonLd, WebSiteJsonLd } from '../../components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahorroya.vercel.app';

const allCategories = [
  { name: 'Mercado', slug: 'mercado', description: 'Productos de mercado y despensa' },
  { name: 'Farmacia', slug: 'farmacia', description: 'Medicamentos y cuidado personal' },
  { name: 'Lácteos', slug: 'lacteos', description: 'Leche, quesos y derivados' },
  { name: 'Carnes', slug: 'carnes', description: 'Carnes frías, pollo y res' },
  { name: 'Aseo', slug: 'aseo', description: 'Limpieza del hogar y personal' },
  { name: 'Bebés', slug: 'bebes', description: 'Productos para bebés' },
  { name: 'Mascotas', slug: 'mascotas', description: 'Alimento y accesorios para mascotas' },
  { name: 'Bebidas', slug: 'bebidas', description: 'Gaseosas, jugos, cervezas y más' },
];

export async function generateMetadata() {
  return {
    metadataBase: new URL(SITE_URL),
    title: 'Todas las categorías - AhorroYa',
    description: 'Explora productos por categoría en supermercados y farmacias de Colombia.',
    robots: { index: true, follow: true },
    alternates: { canonical: `${SITE_URL}/categorias` },
  };
}

export default function CategoriasPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Inicio', url: '/' },
        { name: 'Categorías' },
      ]} />
      <WebSiteJsonLd />
      <div className="min-h-screen bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 pb-16">
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-2">Categorías</h1>
          <p className="text-zinc-500 mb-8">Explora productos por categoría</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allCategories.map((cat) => (
              <Link key={cat.slug} href={`/categoria/${cat.slug}`} className="block bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all group">
                <h2 className="text-lg font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors">{cat.name}</h2>
                <p className="text-sm text-zinc-500 mt-1">{cat.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
