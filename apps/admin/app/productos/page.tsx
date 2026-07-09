export default function AdminProductos() {
    return (
        <div>
            <h2 className="mb-6 text-2xl font-bold">Gestión de Productos</h2>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="text-slate-400">
                            <th className="pb-3">Producto</th>
                            <th className="pb-3">Marca</th>
                            <th className="pb-3">Categoría</th>
                            <th className="pb-3">Código Barras</th>
                            <th className="pb-3">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-t border-slate-800">
                            <td className="py-3">Arroz Diana Premium</td>
                            <td className="py-3">Diana</td>
                            <td className="py-3">Despensa</td>
                            <td className="py-3">7702010000011</td>
                            <td className="py-3 text-emerald-400">Activo</td>
                        </tr>
                        <tr className="border-t border-slate-800">
                            <td className="py-3">Acetaminofén MK 500mg</td>
                            <td className="py-3">MK</td>
                            <td className="py-3">Farmacia</td>
                            <td className="py-3">7702010000066</td>
                            <td className="py-3 text-emerald-400">Activo</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
