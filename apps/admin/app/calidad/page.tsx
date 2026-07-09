export default function AdminCalidad() {
    return (
        <div>
            <h2 className="mb-6 text-2xl font-bold">Calidad de Datos</h2>
            <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
                    <p className="text-sm text-slate-400">Completitud</p>
                    <p className="text-3xl font-bold mt-2 text-emerald-400">87%</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
                    <p className="text-sm text-slate-400">Consistencia</p>
                    <p className="text-3xl font-bold mt-2 text-emerald-400">92%</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
                    <p className="text-sm text-slate-400">Confiabilidad</p>
                    <p className="text-3xl font-bold mt-2 text-yellow-400">78%</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
                    <p className="text-sm text-slate-400">Actualización</p>
                    <p className="text-3xl font-bold mt-2 text-emerald-400">83%</p>
                </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
                <h3 className="mb-4 text-lg font-semibold">Duplicados Detectados</h3>
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="text-slate-400">
                            <th className="pb-3">Tipo</th>
                            <th className="pb-3">Cantidad</th>
                            <th className="pb-3">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-t border-slate-800">
                            <td className="py-3">Productos</td>
                            <td className="py-3">124</td>
                            <td className="py-3"><button className="text-cyan-400 hover:text-cyan-300">Fusionar</button></td>
                        </tr>
                        <tr className="border-t border-slate-800">
                            <td className="py-3">Comercios</td>
                            <td className="py-3">3</td>
                            <td className="py-3"><button className="text-cyan-400 hover:text-cyan-300">Fusionar</button></td>
                        </tr>
                        <tr className="border-t border-slate-800">
                            <td className="py-3">Marcas</td>
                            <td className="py-3">8</td>
                            <td className="py-3"><button className="text-cyan-400 hover:text-cyan-300">Fusionar</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
