export default function AdminPromociones() {
    const promos = [
        { name: 'Semana Descuento Éxito', type: 'Descuento Directo', discount: '25%', start: '2026-07-01', end: '2026-07-15', status: 'Activa' },
        { name: '2x1 D1', type: '2x1', discount: '50%', start: '2026-07-05', end: '2026-07-20', status: 'Activa' },
        { name: 'Lunes de Frescura', type: 'Descuento Directo', discount: '15%', start: '2026-07-10', end: '2026-07-31', status: 'Programada' },
        { name: 'Farmatodo Puntos', type: 'Acumulación', discount: '10%', start: '2026-06-15', end: '2026-06-30', status: 'Finalizada' },
        { name: 'Jumbo Familia', type: 'Descuento Directo', discount: '20%', start: '2026-07-01', end: '2026-07-31', status: 'Activa' },
        { name: 'Cruz Verde Salud', type: 'Bonificación', discount: '30%', start: '2026-07-15', end: '2026-08-15', status: 'Programada' },
    ];

    return (
        <div>
            <h2 className="mb-6 text-2xl font-bold">Gestión de Promociones</h2>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="text-slate-400">
                            <th className="pb-3">Nombre</th>
                            <th className="pb-3">Tipo</th>
                            <th className="pb-3">Descuento</th>
                            <th className="pb-3">Inicio</th>
                            <th className="pb-3">Fin</th>
                            <th className="pb-3">Estado</th>
                            <th className="pb-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {promos.map((p, i) => (
                            <tr key={i} className="border-t border-slate-800">
                                <td className="py-3">{p.name}</td>
                                <td className="py-3 text-slate-400">{p.type}</td>
                                <td className="py-3 text-emerald-400">{p.discount}</td>
                                <td className="py-3 text-slate-400">{p.start}</td>
                                <td className="py-3 text-slate-400">{p.end}</td>
                                <td className={`py-3 ${
                                    p.status === 'Activa' ? 'text-emerald-400' :
                                    p.status === 'Programada' ? 'text-cyan-400' : 'text-slate-500'
                                }`}>{p.status}</td>
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
