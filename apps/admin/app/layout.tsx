import Link from 'next/link';

export default function AdminLayout({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="es">
            <body className="bg-slate-900 text-white">
                <aside className="fixed left-0 top-0 h-full w-64 border-r border-slate-800 bg-slate-950 p-6">
                    <h1 className="mb-8 text-xl font-bold text-cyan-400">AhorroYa Admin</h1>
                    <nav className="space-y-2">
                        <Link href="/admin" className="block rounded-lg p-3 hover:bg-slate-800">Dashboard</Link>
                        <Link href="/admin/productos" className="block rounded-lg p-3 hover:bg-slate-800">Productos</Link>
                        <Link href="/admin/categorias" className="block rounded-lg p-3 hover:bg-slate-800">Categorías</Link>
                        <Link href="/admin/marcas" className="block rounded-lg p-3 hover:bg-slate-800">Marcas</Link>
                        <Link href="/admin/comercios" className="block rounded-lg p-3 hover:bg-slate-800">Comercios</Link>
                        <Link href="/admin/sucursales" className="block rounded-lg p-3 hover:bg-slate-800">Sucursales</Link>
                        <Link href="/admin/precios" className="block rounded-lg p-3 hover:bg-slate-800">Precios</Link>
                        <Link href="/admin/promociones" className="block rounded-lg p-3 hover:bg-slate-800">Promociones</Link>
                        <Link href="/admin/banners" className="block rounded-lg p-3 hover:bg-slate-800">Banners</Link>
                        <Link href="/admin/imagenes" className="block rounded-lg p-3 hover:bg-slate-800">Imágenes</Link>
                        <Link href="/admin/usuarios" className="block rounded-lg p-3 hover:bg-slate-800">Usuarios</Link>
                        <Link href="/admin/roles" className="block rounded-lg p-3 hover:bg-slate-800">Roles</Link>
                        <Link href="/admin/scrapers" className="block rounded-lg p-3 hover:bg-slate-800">Scrapers</Link>
                        <Link href="/admin/alertas" className="block rounded-lg p-3 hover:bg-slate-800">Alertas</Link>
                        <Link href="/admin/calidad" className="block rounded-lg p-3 hover:bg-slate-800">Calidad</Link>
                        <Link href="/admin/seo" className="block rounded-lg p-3 hover:bg-slate-800">SEO</Link>
                        <Link href="/admin/configuracion" className="block rounded-lg p-3 hover:bg-slate-800">Configuración</Link>
                    </nav>
                </aside>
                <main className="ml-64 min-h-screen p-8">
                    {children}
                </main>
            </body>
        </html>
    );
}
