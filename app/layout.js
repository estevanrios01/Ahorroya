import './globals.css';
import { Inter } from 'next/font/google';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahorroya.vercel.app';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'arial'],
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'AhorroYa — Compara precios de supermercados y farmacias en Colombia',
  description: 'Encuentra el mejor precio cerca de ti. Compara productos en Éxito, D1, Jumbo, Olímpica, Ara, Cruz Verde, Farmatodo y más. Ahorra tiempo y dinero con información actualizada en tiempo real.',
  keywords: 'comparador de precios, supermercados Colombia, farmacias Colombia, ahorrar dinero, Éxito, D1, Jumbo, Olímpica, Ara, Cruz Verde, Farmatodo',
  openGraph: {
    title: 'AhorroYa — Inteligencia de Precios',
    description: 'La plataforma nacional de comparación de supermercados y farmacias de Colombia.',
    type: 'website',
    locale: 'es_CO',
    siteName: 'AhorroYa',
    images: [{ url: '/og-image.svg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AhorroYa — Inteligencia de Precios',
    description: 'Compara precios en supermercados y farmacias de Colombia.',
    images: ['/og-image.svg'],
  },
  robots: { index: true, follow: true },
  manifest: '/manifest.json',
  icons: { icon: '/favicon.ico', apple: '/icons/icon-192.svg' },
  alternates: { canonical: SITE_URL },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#059669',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} min-h-screen bg-zinc-950 text-zinc-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}
