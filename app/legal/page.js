import Link from 'next/link';
import { BreadcrumbJsonLd, WebSiteJsonLd } from '../../components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahorroya.vercel.app';

export async function generateMetadata() {
  return {
    metadataBase: new URL(SITE_URL),
    title: 'Centro Legal - AhorroYa',
    description: 'Información legal, política de privacidad, términos y condiciones, política de cookies y protección de datos de AhorroYa.',
    robots: { index: true, follow: true },
    alternates: { canonical: `${SITE_URL}/legal` },
  };
}

const sections = [
  { title: 'Política de Privacidad', href: '/legal/privacidad', desc: 'Conoce cómo recopilamos, usamos y protegemos tu información personal.' },
  { title: 'Términos y Condiciones', href: '/legal/terminos', desc: 'Las condiciones que rigen el uso de la plataforma AhorroYa.' },
  { title: 'Política de Cookies', href: '/legal/cookies', desc: 'Información sobre el uso de cookies y tecnologías similares.' },
  { title: 'Protección de Datos', href: '/legal/datos', desc: 'Cumplimiento de Habeas Data y Ley 1581 de 2012 en Colombia.' },
  { title: 'Contacto', href: '/legal/contacto', desc: 'Ponte en contacto con nuestro equipo para resolver tus dudas.' },
];

export default function LegalPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: 'Inicio', url: '/' }, { name: 'Legal' }]} />
      <WebSiteJsonLd />
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">Centro Legal</h1>
        <p className="text-zinc-500 mb-8">Toda la documentación legal de AhorroYa en un solo lugar.</p>
        <div className="space-y-4">
          {sections.map((s) => (
            <Link key={s.href} href={s.href} className="block bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 hover:border-emerald-500/30 transition-all group">
              <h2 className="text-lg font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors">{s.title}</h2>
              <p className="text-sm text-zinc-500 mt-1">{s.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
