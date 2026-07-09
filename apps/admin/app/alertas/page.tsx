export default function AdminAlertas() {
    const alerts = [
        { type: 'price-drop', label: 'Baja de Precio', product: 'Arroz Diana 1kg', detail: '-$1.200 (25%) en Éxito', severity: 'Media', status: 'No Leída' },
        { type: 'stock', label: 'Stock', product: 'Leche Alpina Entera', detail: 'Sin stock en 3 sucursales de D1', severity: 'Alta', status: 'No Leída' },
        { type: 'anomaly', label: 'Anomalía', product: 'Acetaminofén MK', detail: 'Precio $8.500 vs promedio $4.200', severity: 'Alta', status: 'No Leída' },
        { type: 'price-drop', label: 'Baja de Precio', product: 'Jabón Rey x3', detail: '-$800 (15%) en Jumbo', severity: 'Baja', status: 'Leída' },
        { type: 'stock', label: 'Stock', product: 'Coca-Cola 2L', detail: 'Stock bajo en Olímpica Sur', severity: 'Media', status: 'Leída' },
        { type: 'anomaly', label: 'Anomalía', product: 'Pan Bimbo 500g', detail: 'Precio duplicado en 3 sucursales', severity: 'Alta', status: 'No Leída' },
        { type: 'price-drop', label: 'Baja de Precio', product: 'Frijoles Diana 500g', detail: '-$500 (10%) en Ara', severity: 'Baja', status: 'Leída' },
        { type: 'anomaly', label: 'Anomalía', product: 'Shampoo Pantene', detail: 'Dimensiones inconsistentes entre tiendas', severity: 'Media', status: 'No Leída' },
    ];

    return (
        <div>
            <h2 className="mb-6 text-2xl font-bold">Gestión de Alertas</h2>
            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
                    <p className="text-sm text-slate-400">No Leídas</p>
                    <p className="text-3xl font-bold mt-2 text-yellow-400">4</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
                    <p className="text-sm text-slate-400">Severidad Alta</p>
                    <p className="text-3xl font-bold mt-2 text-rose-400">3</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
                    <p className="text-sm text-slate-400">Totales Hoy</p>
                    <p className="text-3xl font-bold mt-2">8</p>
                </div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="text-slate-400">
                            <th className="pb-3">Tipo</th>
                            <th className="pb-3">Producto</th>
                            <th className="pb-3">Detalle</th>
                            <th className="pb-3">Severidad</th>
                            <th className="pb-3">Estado</th>
                            <th className="pb-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {alerts.map((a, i) => (
                            <tr key={i} className="border-t border-slate-800">
                                <td className="py-3">
                                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                                        a.type === 'price-drop' ? 'text-emerald-400' :
                                        a.type === 'stock' ? 'text-yellow-400' : 'text-rose-400'
                                    }`}>
                                        <span className={`inline-block h-2 w-2 rounded-full ${
                                            a.type === 'price-drop' ? 'bg-emerald-400' :
                                            a.type === 'stock' ? 'bg-yellow-400' : 'bg-rose-400'
                                        }`} />
                                        {a.label}
                                    </span>
                                </td>
                                <td className="py-3">{a.product}</td>
                                <td className="py-3 text-slate-400">{a.detail}</td>
                                <td className={`py-3 ${
                                    a.severity === 'Alta' ? 'text-rose-400' :
                                    a.severity === 'Media' ? 'text-yellow-400' : 'text-emerald-400'
                                }`}>{a.severity}</td>
                                <td className={`py-3 ${a.status === 'No Leída' ? 'text-yellow-400' : 'text-slate-500'}`}>{a.status}</td>
                                <td className="py-3 space-x-3">
                                    {a.status === 'No Leída' && <button className="text-cyan-400 hover:text-cyan-300">Marcar Leída</button>}
                                    <button className="text-rose-400 hover:text-rose-300">Ignorar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
