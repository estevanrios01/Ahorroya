export default function AdminComercios() {
    const stores = [
        { name: 'Almacenes Éxito', slug: 'exito', category: 'Supermercado', status: 'Activo' },
        { name: 'Tiendas D1', slug: 'd1', category: 'Supermercado', status: 'Activo' },
        { name: 'Supermercados Olímpica', slug: 'olimpica', category: 'Supermercado', status: 'Activo' },
        { name: 'Jumbo', slug: 'jumbo', category: 'Supermercado', status: 'Activo' },
        { name: 'Ara', slug: 'ara', category: 'Supermercado', status: 'Activo' },
        { name: 'Cruz Verde', slug: 'cruz-verde', category: 'Farmacia', status: 'Activo' },
        { name: 'Farmatodo', slug: 'farmatodo', category: 'Farmacia', status: 'Activo' },
        { name: 'Carulla', slug: 'carulla', category: 'Supermercado', status: 'Activo' },
    ];

    return (
        <div>
            <h2 className="mb-6 text-2xl font-bold">Gestión de Comercios</h2>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="text-slate-400">
                            <th className="pb-3">Comercio</th>
                            <th className="pb-3">Slug</th>
                            <th className="pb-3">Categoría</th>
                            <th className="pb-3">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stores.map((s) => (
                            <tr key={s.slug} className="border-t border-slate-800">
                                <td className="py-3">{s.name}</td>
                                <td className="py-3 text-slate-400">{s.slug}</td>
                                <td className="py-3">{s.category}</td>
                                <td className="py-3 text-emerald-400">{s.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
