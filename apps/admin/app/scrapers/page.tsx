export default function AdminScrapers() {
    const scrapers = [
        { name: 'Almacenes Éxito', status: 'Completado', products: 12430, duration: '3m 42s', lastRun: '2026-07-09 06:00' },
        { name: 'Tiendas D1', status: 'Completado', products: 8210, duration: '2m 15s', lastRun: '2026-07-09 06:00' },
        { name: 'Jumbo', status: 'En Proceso', products: 5340, duration: '1m 58s', lastRun: '2026-07-09 06:00' },
        { name: 'Supermercados Olímpica', status: 'Pendiente', products: 0, duration: '-', lastRun: '-' },
        { name: 'Ara', status: 'Completado', products: 6340, duration: '2m 30s', lastRun: '2026-07-09 06:00' },
        { name: 'Cruz Verde', status: 'Completado', products: 4890, duration: '1m 45s', lastRun: '2026-07-09 06:00' },
        { name: 'Farmatodo', status: 'Pendiente', products: 0, duration: '-', lastRun: '-' },
        { name: 'Carulla', status: 'Completado', products: 3210, duration: '1m 20s', lastRun: '2026-07-09 06:00' },
    ];

    return (
        <div>
            <h2 className="mb-6 text-2xl font-bold">Scrapers</h2>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="text-slate-400">
                            <th className="pb-3">Tienda</th>
                            <th className="pb-3">Estado</th>
                            <th className="pb-3">Productos</th>
                            <th className="pb-3">Duración</th>
                            <th className="pb-3">Última Ejecución</th>
                        </tr>
                    </thead>
                    <tbody>
                        {scrapers.map((s) => (
                            <tr key={s.name} className="border-t border-slate-800">
                                <td className="py-3">{s.name}</td>
                                <td className={`py-3 ${
                                    s.status === 'Completado' ? 'text-emerald-400' :
                                    s.status === 'En Proceso' ? 'text-yellow-400' : 'text-slate-500'
                                }`}>{s.status}</td>
                                <td className="py-3">{s.products.toLocaleString()}</td>
                                <td className="py-3">{s.duration}</td>
                                <td className="py-3 text-slate-400">{s.lastRun}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
