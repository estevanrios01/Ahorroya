export default function AdminCategorias() {
    const categories = [
        { name: 'Despensa', slug: 'despensa', products: 3450, status: 'Activo' },
        { name: 'Farmacia', slug: 'farmacia', products: 2100, status: 'Activo' },
        { name: 'Lácteos', slug: 'lacteos', products: 890, status: 'Activo' },
        { name: 'Bebidas', slug: 'bebidas', products: 1230, status: 'Activo' },
        { name: 'Cuidado Personal', slug: 'cuidado-personal', products: 980, status: 'Inactivo' },
        { name: 'Limpieza', slug: 'limpieza', products: 760, status: 'Activo' },
        { name: 'Carnes', slug: 'carnes', products: 540, status: 'Activo' },
        { name: 'Frutas y Verduras', slug: 'frutas-verduras', products: 420, status: 'Inactivo' },
        { name: 'Mascotas', slug: 'mascotas', products: 310, status: 'Activo' },
    ];

    return (
        <div>
            <h2 className="mb-6 text-2xl font-bold">Gestión de Categorías</h2>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="text-slate-400">
                            <th className="pb-3">Nombre</th>
                            <th className="pb-3">Slug</th>
                            <th className="pb-3">Productos</th>
                            <th className="pb-3">Estado</th>
                            <th className="pb-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((c, i) => (
                            <tr key={i} className="border-t border-slate-800">
                                <td className="py-3">{c.name}</td>
                                <td className="py-3 text-slate-400">{c.slug}</td>
                                <td className="py-3">{c.products.toLocaleString()}</td>
                                <td className={`py-3 ${c.status === 'Activo' ? 'text-emerald-400' : 'text-rose-400'}`}>{c.status}</td>
                                <td className="py-3 space-x-3">
                                    <button className="text-cyan-400 hover:text-cyan-300">Editar</button>
                                    <button className="text-rose-400 hover:text-rose-300">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
