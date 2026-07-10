import Link from 'next/link';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

export default function LegalLayout({ children }) {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Header />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center gap-2 text-xs text-zinc-600 mb-6">
          <Link href="/" className="hover:text-zinc-400 transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/legal" className="hover:text-zinc-400 transition-colors">Legal</Link>
        </nav>
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-56 flex-shrink-0">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4">Legal</h2>
            <ul className="space-y-2">
              <li><Link href="/legal/privacidad" className="text-sm text-zinc-500 hover:text-emerald-400 transition-colors">Privacidad</Link></li>
              <li><Link href="/legal/terminos" className="text-sm text-zinc-500 hover:text-emerald-400 transition-colors">Términos</Link></li>
              <li><Link href="/legal/cookies" className="text-sm text-zinc-500 hover:text-emerald-400 transition-colors">Cookies</Link></li>
              <li><Link href="/legal/datos" className="text-sm text-zinc-500 hover:text-emerald-400 transition-colors">Protección de Datos</Link></li>
              <li><Link href="/legal/contacto" className="text-sm text-zinc-500 hover:text-emerald-400 transition-colors">Contacto</Link></li>
            </ul>
          </aside>
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
