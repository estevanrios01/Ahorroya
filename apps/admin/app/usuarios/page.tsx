export default function AdminUsuarios() {
    return (
        <div>
            <h2 className="mb-6 text-2xl font-bold">Gestión de Usuarios</h2>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="text-slate-400">
                            <th className="pb-3">Email</th>
                            <th className="pb-3">Nombre</th>
                            <th className="pb-3">Rol</th>
                            <th className="pb-3">Registro</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-t border-slate-800">
                            <td className="py-3">admin@ahorroya.com</td>
                            <td className="py-3">Admin</td>
                            <td className="py-3 text-cyan-400">admin</td>
                            <td className="py-3 text-slate-400">2026-07-01</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
