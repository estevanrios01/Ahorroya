import Link from 'next/link';
import { Heart, Smartphone, MessageCircle, Camera, Globe, Send, ArrowUpRight } from 'lucide-react';

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

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800/50 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
            <div className="col-span-2 md:col-span-3 lg:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4 group">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                  <span className="text-white font-extrabold text-xs">A</span>
                </div>
                <span className="text-lg font-bold text-zinc-100">Ahorro<span className="text-emerald-400">Ya</span></span>
              </Link>
              <p className="text-sm text-zinc-500 max-w-sm leading-relaxed">
                La plataforma nacional de comparación de precios de supermercados y farmacias de Colombia. Encuentra el mejor precio cerca de ti y ahorra en tus compras del día a día.
              </p>
              <div className="flex gap-2.5 mt-5">
                {[
                  { icon: MessageCircle, label: 'Twitter' },
                  { icon: Camera, label: 'Instagram' },
                  { icon: Globe, label: 'Facebook' },
                  { icon: Send, label: 'YouTube' },
                ].map(({ icon: Icon, label }) => (
                  <a key={label} href="#" className="h-9 w-9 rounded-xl bg-zinc-900/80 border border-zinc-800/80 flex items-center justify-center text-zinc-500 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-zinc-800 transition-all" aria-label={label}>
                    <Icon size={15} />
                  </a>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-3 text-xs text-zinc-600">
                <Smartphone size={14} className="text-emerald-500" />
                <span>Descarga nuestra app</span>
                <ArrowUpRight size={12} className="text-emerald-500" />
              </div>
            </div>

            <div>
              <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.1em] mb-4">Categorías</h3>
              <ul className="space-y-2.5">
                {categories.map((cat) => (
                  <li key={cat.name}>
                    <Link href={cat.href} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">{cat.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.1em] mb-4">Tiendas</h3>
              <ul className="space-y-2.5">
                {stores.map((s) => (
                  <li key={s.name}>
                    <Link href={s.href} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">{s.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.1em] mb-4">Cobertura</h3>
              <ul className="space-y-2.5">
                {cities.map((city) => (
                  <li key={city.slug}>
                    <Link href={`/ciudad/${city.slug}`} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">{city.name}</Link>
                  </li>
                ))}
                <li><Link href="/ciudades" className="text-sm text-emerald-500 hover:text-emerald-400 transition-colors">Ver todas →</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.1em] mb-4">Plataforma</h3>
              <ul className="space-y-2.5">
                <li><Link href="/marcas" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Marcas</Link></li>
                <li><Link href="/dashboard-ejecutivo" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Dashboard KPIs</Link></li>
                <li><Link href="/admin" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Panel Admin</Link></li>
                <li><a href="https://ahorroya.vercel.app/api/health" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors" target="_blank" rel="noopener noreferrer">API Status</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="py-6 border-t border-zinc-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-600">
            &copy; {new Date().getFullYear()} AhorroYa. Hecho con <Heart size={11} className="inline text-rose-500" /> en Colombia.
          </p>
          <div className="flex gap-5 text-xs text-zinc-600">
            <Link href="/legal/privacidad" className="hover:text-zinc-400 transition-colors">Privacidad</Link>
            <Link href="/legal/terminos" className="hover:text-zinc-400 transition-colors">Términos</Link>
            <Link href="/legal/contacto" className="hover:text-zinc-400 transition-colors">Contacto</Link>
            <Link href="/legal/cookies" className="hover:text-zinc-400 transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
