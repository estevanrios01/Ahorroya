import './globals.css';

export const metadata = {
  title: 'AhorroYa | Inteligencia de Precios',
  description: 'Agregador en tiempo real de supermercados y droguerías en Colombia.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-[#0f172a] text-slate-200 font-sans antialiased selection:bg-cyan-500 selection:text-white">
        <main className="min-h-screen flex flex-col items-center justify-center p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
