export default function AdminMarcas() {
    const brands = [
        { name: 'Diana', logo: 'DN', country: 'Colombia', products: 340 },
        { name: 'MK', logo: 'MK', country: 'Colombia', products: 280 },
        { name: 'Nestlé', logo: 'NE', country: 'Suiza', products: 520 },
        { name: 'Coca-Cola', logo: 'CC', country: 'EE.UU.', products: 190 },
        { name: 'Colgate', logo: 'CL', country: 'EE.UU.', products: 110 },
        { name: 'Quala', logo: 'QL', country: 'Colombia', products: 170 },
        { name: 'Postobón', logo: 'PB', country: 'Colombia', products: 230 },
        { name: 'Alpina', logo: 'AL', country: 'Colombia', products: 310 },
        { name: 'Genfar', logo: 'GF', country: 'Colombia', products: 420 },
    ];

    return (
        <div>
            <h2 className="mb-6 text-2xl font-bold">Gestión de Marcas</h2>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="text-slate-400">
                            <th className="pb-3">Logo</th>
                            <th className="pb-3">Nombre</th>
                            <th className="pb-3">País</th>
                            <th className="pb-3">Productos</th>
                            <th className="pb-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {brands.map((b, i) => (
                            <tr key={i} className="border-t border-slate-800">
                                <td className="py-3">
                                    <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-slate-700 text-xs font-bold text-white">{b.logo}</span>
                                </td>
                                <td className="py-3 font-medium">{b.name}</td>
                                <td className="py-3 text-slate-400">{b.country}</td>
                                <td className="py-3">{b.products}</td>
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
