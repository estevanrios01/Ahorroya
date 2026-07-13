import Link from 'next/link';
import { Heart, Mail, MessageCircle, ShieldCheck, Activity, ArrowUpRight } from 'lucide-react';

const categories = [
  { name: 'Mercado', href: '/categoria/mercado' },
  { name: 'Farmacia', href: '/categoria/farmacia' },
  { name: 'Lácteos', href: '/categoria/lacteos' },
  { name: 'Carnes', href: '/categoria/carnes' },
  { name: 'Bebidas', href: '/categoria/bebidas' },
  { name: 'Aseo', href: '/categoria/aseo' },
  { name: 'Mascotas', href: '/categoria/mascotas' },
  { name: 'Bebés', href: '/categoria/bebes' },
];

const stores = [
  { name: 'Éxito', href: '/supermercado/exito' },
  { name: 'D1', href: '/supermercado/d1' },
  { name: 'Jumbo', href: '/supermercado/jumbo' },
  { name: 'Olímpica', href: '/supermercado/olimpica' },
  { name: 'Ara', href: '/supermercado/ara' },
  { name: 'Carulla', href: '/supermercado/carulla' },
  { name: 'Cruz Verde', href: '/farmacia/cruz-verde' },
  { name: 'Farmatodo', href: '/farmacia/farmatodo' },
];

const cities = [
  { name: 'Cali', slug: 'cali' },
  { name: 'Bogotá', slug: 'bogota' },
  { name: 'Medellín', slug: 'medellin' },
  { name: 'Barranquilla', slug: 'barranquilla' },
  { name: 'Cartagena', slug: 'cartagena' },
  { name: 'Bucaramanga', slug: 'bucaramanga' },
];

const contactLinks = [
  { icon: Mail, label: 'Contacto', href: '/legal/contacto' },
  { icon: MessageCircle, label: 'Reportar precio', href: '/buscar' },
  { icon: ShieldCheck, label: 'Privacidad', href: '/legal/privacidad' },
  { icon: Activity, label: 'Estado API', href: '/api/health' },
];

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800/50 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6 lg:gap-12">
            <div className="col-span-2 md:col-span-3 lg:col-span-2">
              <Link href="/" className="mb-4 flex items-center gap-2 group">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700">
                  <span className="text-xs font-extrabold text-white">A</span>
                </div>
                <span className="text-lg font-bold text-zinc-100">Ahorro<span className="text-emerald-400">Ya</span></span>
              </Link>
              <p className="max-w-sm text-sm leading-relaxed text-zinc-500">
                Comparador colombiano de precios de supermercados y farmacias. Priorizamos productos con precio, fecha e imagen verificable del comercio.
              </p>
              <div className="mt-5 flex gap-2.5">
                {contactLinks.map(({ icon: Icon, label, href }) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800/80 bg-zinc-900/80 text-zinc-500 transition-all hover:border-emerald-500/30 hover:bg-zinc-800 hover:text-emerald-400"
                    aria-label={label}
                  >
                    <Icon size={15} />
                  </Link>
                ))}
              </div>
              <Link href="/ciudades" className="mt-5 inline-flex items-center gap-3 text-xs text-zinc-600 transition-colors hover:text-zinc-400">
                Cobertura por ciudad
                <ArrowUpRight size={12} className="text-emerald-500" />
              </Link>
            </div>

            <div>
              <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-400">Categorías</h3>
              <ul className="space-y-2.5">
                {categories.map((cat) => (
                  <li key={cat.name}>
                    <Link href={cat.href} className="text-sm text-zinc-500 transition-colors hover:text-zinc-300">{cat.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-400">Tiendas</h3>
              <ul className="space-y-2.5">
                {stores.map((store) => (
                  <li key={store.name}>
                    <Link href={store.href} className="text-sm text-zinc-500 transition-colors hover:text-zinc-300">{store.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-400">Cobertura</h3>
              <ul className="space-y-2.5">
                {cities.map((city) => (
                  <li key={city.slug}>
                    <Link href={`/ciudad/${city.slug}`} className="text-sm text-zinc-500 transition-colors hover:text-zinc-300">{city.name}</Link>
                  </li>
                ))}
                <li><Link href="/ciudades" className="text-sm text-emerald-500 transition-colors hover:text-emerald-400">Ver todas →</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-400">Plataforma</h3>
              <ul className="space-y-2.5">
                <li><Link href="/marcas" className="text-sm text-zinc-500 transition-colors hover:text-zinc-300">Marcas</Link></li>
                <li><Link href="/dashboard-ejecutivo" className="text-sm text-zinc-500 transition-colors hover:text-zinc-300">Dashboard KPIs</Link></li>
                <li><Link href="/admin" className="text-sm text-zinc-500 transition-colors hover:text-zinc-300">Panel Admin</Link></li>
                <li><Link href="/api/health" className="text-sm text-zinc-500 transition-colors hover:text-zinc-300">API Status</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-zinc-800/50 py-6 sm:flex-row">
          <p className="text-xs text-zinc-600">
            &copy; {new Date().getFullYear()} AhorroYa. Hecho con <Heart size={11} className="inline text-rose-500" /> en Colombia.
          </p>
          <div className="flex gap-5 text-xs text-zinc-600">
            <Link href="/legal/privacidad" className="transition-colors hover:text-zinc-400">Privacidad</Link>
            <Link href="/legal/terminos" className="transition-colors hover:text-zinc-400">Términos</Link>
            <Link href="/legal/contacto" className="transition-colors hover:text-zinc-400">Contacto</Link>
            <Link href="/legal/cookies" className="transition-colors hover:text-zinc-400">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
