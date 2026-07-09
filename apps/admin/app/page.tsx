export default function AdminDashboard() {
    const stats = [
        { label: "Productos", value: "12,450", change: "+5.2%" },
        { label: "Comercios", value: "48", change: "+2.1%" },
        { label: "Sucursales", value: "1,230", change: "+3.8%" },
        { label: "Precios", value: "89,200", change: "+12.4%" },
        { label: "Usuarios", value: "3,450", change: "+8.7%" },
        { label: "Scrapers Activos", value: "6", change: "0%" },
    ];

    return (
        <div>
            <h2 className="mb-8 text-2xl font-bold">Dashboard</h2>
            <div className="grid grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-slate-800 bg-slate-950 p-6">
                        <p className="text-sm text-slate-400">{stat.label}</p>
                        <p className="mt-2 text-3xl font-bold">{stat.value}</p>
                        <p className="mt-1 text-sm text-emerald-400">{stat.change}</p>
                    </div>
                ))}
            </div>
            <div className="mt-8 rounded-xl border border-slate-800 bg-slate-950 p-6">
                <h3 className="mb-4 text-lg font-semibold">Últimos Scrapers</h3>
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="text-slate-400">
                            <th className="pb-3">Tienda</th>
                            <th className="pb-3">Estado</th>
                            <th className="pb-3">Productos</th>
                            <th className="pb-3">Duración</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-t border-slate-800">
                            <td className="py-3">Éxito</td>
                            <td className="py-3 text-emerald-400">Completado</td>
                            <td className="py-3">12,430</td>
                            <td className="py-3">3m 42s</td>
                        </tr>
                        <tr className="border-t border-slate-800">
                            <td className="py-3">D1</td>
                            <td className="py-3 text-emerald-400">Completado</td>
                            <td className="py-3">8,210</td>
                            <td className="py-3">2m 15s</td>
                        </tr>
                        <tr className="border-t border-slate-800">
                            <td className="py-3">Jumbo</td>
                            <td className="py-3 text-yellow-400">En Proceso</td>
                            <td className="py-3">5,340</td>
                            <td className="py-3">1m 58s</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
