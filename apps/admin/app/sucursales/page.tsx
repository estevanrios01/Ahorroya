export default function AdminSucursales() {
    const branches = [
        { name: 'Éxito Centro', store: 'Almacenes Éxito', city: 'Bogotá', address: 'Cra 7 # 12-34', status: 'Activo' },
        { name: 'Éxito Norte', store: 'Almacenes Éxito', city: 'Bogotá', address: 'Av 68 # 80-12', status: 'Activo' },
        { name: 'D1 Plaza', store: 'Tiendas D1', city: 'Medellín', address: 'Cra 50 # 45-10', status: 'Activo' },
        { name: 'Olímpica Sur', store: 'Supermercados Olímpica', city: 'Cali', address: 'Cll 5 # 20-50', status: 'Inactivo' },
        { name: 'Jumbo Unicentro', store: 'Jumbo', city: 'Bogotá', address: 'Av 127 # 15-10', status: 'Activo' },
        { name: 'Ara Centro', store: 'Ara', city: 'Barranquilla', address: 'Cra 44 # 30-22', status: 'Activo' },
        { name: 'Cruz Verde 123', store: 'Cruz Verde', city: 'Medellín', address: 'Av Las Vegas # 10-80', status: 'Activo' },
        { name: 'Farmatodo Norte', store: 'Farmatodo', city: 'Bogotá', address: 'Cll 100 # 15-40', status: 'Inactivo' },
        { name: 'Carulla 85', store: 'Carulla', city: 'Bogotá', address: 'Cll 85 # 15-20', status: 'Activo' },
    ];

    return (
        <div>
            <h2 className="mb-6 text-2xl font-bold">Gestión de Sucursales</h2>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="text-slate-400">
                            <th className="pb-3">Nombre</th>
                            <th className="pb-3">Comercio</th>
                            <th className="pb-3">Ciudad</th>
                            <th className="pb-3">Dirección</th>
                            <th className="pb-3">Estado</th>
                            <th className="pb-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {branches.map((b, i) => (
                            <tr key={i} className="border-t border-slate-800">
                                <td className="py-3">{b.name}</td>
                                <td className="py-3 text-slate-400">{b.store}</td>
                                <td className="py-3">{b.city}</td>
                                <td className="py-3">{b.address}</td>
                                <td className={`py-3 ${b.status === 'Activo' ? 'text-emerald-400' : 'text-rose-400'}`}>{b.status}</td>
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
