import Link from 'next/link';
import { ArrowRight, CheckCircle2, MapPin, RefreshCw, Search, ShieldCheck, TrendingDown } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { WebSiteJsonLd } from '../components/seo/JsonLd';
import { Container } from '../packages/ui/src/components/container';
import { Divider } from '../packages/ui/src/components/divider';
import { Section } from '../packages/ui/src/components/section';
import Hero from '../components/home/Hero';
import { SupermarketCarousel, PharmacyCarousel } from '../components/home/StoreCarousel';
import CategoryGrid from '../components/home/CategoryGrid';
import HomeProductSections from '../components/home/HomeProductSections';

const cityLinks = [
  { name: 'Cali', slug: 'cali', detail: 'Valle del Cauca' },
  { name: 'Bogota', slug: 'bogota', detail: 'Cundinamarca' },
  { name: 'Medellin', slug: 'medellin', detail: 'Antioquia' },
  { name: 'Barranquilla', slug: 'barranquilla', detail: 'Atlantico' },
  { name: 'Cartagena', slug: 'cartagena', detail: 'Bolivar' },
  { name: 'Bucaramanga', slug: 'bucaramanga', detail: 'Santander' },
];

const trustItems = [
  { icon: ShieldCheck, title: 'Fotos verificadas', text: 'Se priorizan imagenes publicadas por los comercios.' },
  { icon: RefreshCw, title: 'Precios con fecha', text: 'Cada precio conserva origen y fecha para detectar cambios.' },
  { icon: TrendingDown, title: 'Comparacion util', text: 'Ordenamos por menor precio y comercios disponibles.' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <WebSiteJsonLd />
      <Header />
      <Hero />

      <Container className="space-y-8 pb-10 pt-8">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {trustItems.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
              <Icon className="mb-3 h-5 w-5 text-emerald-400" />
              <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
              <p className="mt-1 text-xs leading-5 text-zinc-500">{text}</p>
            </div>
          ))}
        </div>

        <HomeProductSections />

        <Divider />

        <Section title="Elige tu ciudad" subtitle="Compara segun la cobertura disponible por ubicacion">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cityLinks.map((city) => (
              <Link
                key={city.slug}
                href={`/buscar?city=${encodeURIComponent(city.name)}`}
                className="group flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 transition-all hover:border-emerald-500/30 hover:bg-zinc-900"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                    <MapPin size={18} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-zinc-100">{city.name}</span>
                    <span className="block text-xs text-zinc-500">{city.detail}</span>
                  </span>
                </span>
                <ArrowRight size={16} className="text-zinc-600 transition-colors group-hover:text-emerald-400" />
              </Link>
            ))}
          </div>
        </Section>

        <Section title="Supermercados" subtitle="Cadenas nacionales y regionales incluidas en el catalogo">
          <SupermarketCarousel />
        </Section>

        <Section title="Farmacias" subtitle="Precios de droguerias y farmacias con cobertura nacional">
          <PharmacyCarousel />
        </Section>

        <Divider />

        <Section title="Categorias principales" subtitle="Accede rapido a productos de compra frecuente">
          <CategoryGrid />
        </Section>

        <div className="grid gap-4 rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-emerald-400">
              <CheckCircle2 size={14} />
              Comparador operativo
            </p>
            <h2 className="mt-2 text-xl font-bold text-zinc-100">Busca un producto y revisa el comercio mas barato.</h2>
            <p className="mt-1 text-sm leading-6 text-zinc-500">
              La logica prioriza fotos reales, precios verificables y cobertura por ciudad. El siguiente salto operativo es recuperar Supabase y ampliar inventario sin romper la cuota.
            </p>
          </div>
          <Link href="/buscar" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-colors hover:bg-emerald-500">
            <Search size={16} />
            Buscar productos
          </Link>
        </div>
      </Container>
      <Footer />
    </div>
  );
}
