export default function AdminPrecios() {
    return (
        <div>
            <h2 className="mb-6 text-2xl font-bold">Monitoreo de Precios</h2>
            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
                    <p className="text-sm text-slate-400">Total Precios</p>
                    <p className="text-3xl font-bold mt-2">89,200</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
                    <p className="text-sm text-slate-400">Actualizados Hoy</p>
                    <p className="text-3xl font-bold mt-2 text-emerald-400">12,450</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
                    <p className="text-sm text-slate-400">Anomalías Detectadas</p>
                    <p className="text-3xl font-bold mt-2 text-yellow-400">23</p>
                </div>
            </div>
        </div>
    );
}
