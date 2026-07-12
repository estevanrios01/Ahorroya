import Link from 'next/link';
import { Baby, Beef, Dog, Home, Milk, Pill, ShoppingCart, Wine } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import PageControls from '../../components/layout/PageControls';
import { BreadcrumbJsonLd, WebSiteJsonLd } from '../../components/seo/JsonLd';
import { fallbackCategories } from '../../services/fallbackCatalog';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahorroya.vercel.app';

const iconMap = { Baby, Beef, Dog, Home, Milk, Pill, ShoppingCart, Wine };

export async function generateMetadata() {
  return {
    metadataBase: new URL(SITE_URL),
    title: 'Categorias de productos - AhorroYa',
    description: 'Explora productos por categoria en supermercados y farmacias de Colombia.',
    robots: { index: true, follow: true },
    alternates: { canonical: `${SITE_URL}/categorias` },
  };
}

export default function CategoriasPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Inicio', url: '/' },
        { name: 'Categorias' },
      ]} />
      <WebSiteJsonLd />
      <div className="min-h-screen bg-zinc-950">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-8 pb-16 sm:px-6 lg:px-8">
          <PageControls forwardHref="/buscar" />
          <div className="mb-8 max-w-3xl">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-emerald-400">Explorar catalogo</p>
            <h1 className="text-3xl font-bold text-zinc-100 sm:text-4xl">Categorias principales</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-500">
              Encuentra productos por tipo de compra y compara precios disponibles entre supermercados y farmacias.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {fallbackCategories.map((category) => {
              const Icon = iconMap[category.icon] || ShoppingCart;
              return (
                <Link
                  key={category.slug}
                  href={`/categoria/${category.slug}`}
                  className="group rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 transition-all hover:border-emerald-500/30 hover:bg-zinc-900"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                    <Icon size={22} />
                  </div>
                  <h2 className="text-lg font-semibold text-zinc-100 transition-colors group-hover:text-emerald-400">{category.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">{category.description}</p>
                </Link>
              );
            })}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
