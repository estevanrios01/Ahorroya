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
                        <a href="/admin" className="block rounded-lg p-3 hover:bg-slate-800">Dashboard</a>
                        <a href="/admin/productos" className="block rounded-lg p-3 hover:bg-slate-800">Productos</a>
                        <a href="/admin/categorias" className="block rounded-lg p-3 hover:bg-slate-800">Categorías</a>
                        <a href="/admin/marcas" className="block rounded-lg p-3 hover:bg-slate-800">Marcas</a>
                        <a href="/admin/comercios" className="block rounded-lg p-3 hover:bg-slate-800">Comercios</a>
                        <a href="/admin/sucursales" className="block rounded-lg p-3 hover:bg-slate-800">Sucursales</a>
                        <a href="/admin/precios" className="block rounded-lg p-3 hover:bg-slate-800">Precios</a>
                        <a href="/admin/promociones" className="block rounded-lg p-3 hover:bg-slate-800">Promociones</a>
                        <a href="/admin/banners" className="block rounded-lg p-3 hover:bg-slate-800">Banners</a>
                        <a href="/admin/imagenes" className="block rounded-lg p-3 hover:bg-slate-800">Imágenes</a>
                        <a href="/admin/usuarios" className="block rounded-lg p-3 hover:bg-slate-800">Usuarios</a>
                        <a href="/admin/roles" className="block rounded-lg p-3 hover:bg-slate-800">Roles</a>
                        <a href="/admin/scrapers" className="block rounded-lg p-3 hover:bg-slate-800">Scrapers</a>
                        <a href="/admin/alertas" className="block rounded-lg p-3 hover:bg-slate-800">Alertas</a>
                        <a href="/admin/calidad" className="block rounded-lg p-3 hover:bg-slate-800">Calidad</a>
                        <a href="/admin/seo" className="block rounded-lg p-3 hover:bg-slate-800">SEO</a>
                        <a href="/admin/configuracion" className="block rounded-lg p-3 hover:bg-slate-800">Configuración</a>
                    </nav>
                </aside>
                <main className="ml-64 min-h-screen p-8">
                    {children}
                </main>
            </body>
        </html>
    );
}
