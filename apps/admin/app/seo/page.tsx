export default function AdminSEO() {
    const pages = [
        { page: 'Inicio', title: 'AhorroYa - Compara Precios', description: 'Compara precios en supermercados y farmacias de Colombia.', canonical: 'https://ahorroya.com/', priority: '1.00' },
        { page: 'Productos', title: 'Productos - AhorroYa', description: 'Busca y compara precios de miles de productos.', canonical: 'https://ahorroya.com/productos', priority: '0.90' },
        { page: 'Comercios', title: 'Comercios - AhorroYa', description: 'Explora tiendas y supermercados disponibles.', canonical: 'https://ahorroya.com/comercios', priority: '0.80' },
        { page: 'Ofertas', title: 'Ofertas y Descuentos - AhorroYa', description: 'Encuentras las mejores ofertas en un solo lugar.', canonical: 'https://ahorroya.com/ofertas', priority: '0.85' },
        { page: 'Categoría', title: '{categoria} - AhorroYa', description: 'Compara precios de {categoria} en Colombia.', canonical: 'https://ahorroya.com/categoria/{slug}', priority: '0.70' },
        { page: 'Producto Detalle', title: '{producto} - AhorroYa', description: 'Precios de {producto} en múltiples tiendas.', canonical: 'https://ahorroya.com/producto/{slug}', priority: '0.65' },
        { page: 'Blog', title: 'Blog - AhorroYa', description: 'Consejos y guías para ahorrar en tus compras.', canonical: 'https://ahorroya.com/blog', priority: '0.60' },
        { page: 'Contacto', title: 'Contacto - AhorroYa', description: 'Ponte en contacto con el equipo de AhorroYa.', canonical: 'https://ahorroya.com/contacto', priority: '0.50' },
    ];

    return (
        <div>
            <h2 className="mb-6 text-2xl font-bold">Gestión SEO</h2>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="text-slate-400">
                            <th className="pb-3">Página</th>
                            <th className="pb-3">Title Tag</th>
                            <th className="pb-3">Meta Description</th>
                            <th className="pb-3">Canonical</th>
                            <th className="pb-3">Sitemap Priority</th>
                            <th className="pb-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pages.map((p, i) => (
                            <tr key={i} className="border-t border-slate-800">
                                <td className="py-3 font-medium">{p.page}</td>
                                <td className="py-3 max-w-[200px] truncate text-slate-300">{p.title}</td>
                                <td className="py-3 max-w-[250px] truncate text-slate-400">{p.description}</td>
                                <td className="py-3 max-w-[200px] truncate text-cyan-400">{p.canonical}</td>
                                <td className="py-3">{p.priority}</td>
                                <td className="py-3">
                                    <button className="text-cyan-400 hover:text-cyan-300">Editar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
