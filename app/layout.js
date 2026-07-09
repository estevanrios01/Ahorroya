import './globals.css';

export const metadata = {
  title: 'AhorroYa — Compara precios de supermercados y farmacias en Colombia',
  description: 'Encuentra el mejor precio cerca de ti. Compara productos en Éxito, D1, Jumbo, Olímpica, Ara, Cruz Verde, Farmatodo y más. Ahorra tiempo y dinero con información actualizada en tiempo real.',
  keywords: 'comparador de precios, supermercados Colombia, farmacias Colombia, ahorrar dinero, Éxito, D1, Jumbo, Olímpica, Ara, Cruz Verde, Farmatodo',
  openGraph: {
    title: 'AhorroYa — Inteligencia de Precios',
    description: 'La plataforma nacional de comparación de supermercados y farmacias de Colombia.',
    type: 'website',
    locale: 'es_CO',
    siteName: 'AhorroYa',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AhorroYa — Inteligencia de Precios',
    description: 'Compara precios en supermercados y farmacias de Colombia.',
  },
  robots: { index: true, follow: true },
  manifest: '/manifest.json',
  icons: { icon: '/favicon.ico' },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#09090b',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}
