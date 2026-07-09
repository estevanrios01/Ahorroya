export default function AdminBanners() {
    const banners = [
        { name: 'Ofertas Julio', position: 'Principal - Top', start: '2026-07-01', end: '2026-07-31', active: true },
        { name: 'Farmatodo Especial', position: 'Principal - Medio', start: '2026-07-05', end: '2026-07-20', active: true },
        { name: 'Nuevo Jumbo', position: 'Secundario - Top', start: '2026-07-10', end: '2026-08-10', active: false },
        { name: 'Despensa Agosto', position: 'Principal - Top', start: '2026-08-01', end: '2026-08-31', active: false },
        { name: 'Cuidado Personal', position: 'Secundario - Medio', start: '2026-07-15', end: '2026-07-30', active: true },
        { name: 'Mascotas Destacado', position: 'Principal - Inferior', start: '2026-06-01', end: '2026-06-30', active: false },
    ];

    return (
        <div>
            <h2 className="mb-6 text-2xl font-bold">Gestión de Banners</h2>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="text-slate-400">
                            <th className="pb-3">Nombre</th>
                            <th className="pb-3">Posición</th>
                            <th className="pb-3">Inicio</th>
                            <th className="pb-3">Fin</th>
                            <th className="pb-3">Estado</th>
                            <th className="pb-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {banners.map((b, i) => (
                            <tr key={i} className="border-t border-slate-800">
                                <td className="py-3">{b.name}</td>
                                <td className="py-3 text-slate-400">{b.position}</td>
                                <td className="py-3 text-slate-400">{b.start}</td>
                                <td className="py-3 text-slate-400">{b.end}</td>
                                <td className="py-3">
                                    <span className={`inline-flex items-center gap-2 ${b.active ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        <span className={`inline-block h-2.5 w-2.5 rounded-full ${b.active ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                                        {b.active ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="py-3 space-x-3">
                                    <button className="text-cyan-400 hover:text-cyan-300">Editar</button>
                                    <button className={`${b.active ? 'text-yellow-400 hover:text-yellow-300' : 'text-emerald-400 hover:text-emerald-300'}`}>
                                        {b.active ? 'Desactivar' : 'Activar'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
