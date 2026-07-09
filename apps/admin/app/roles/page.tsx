export default function AdminRoles() {
    const roles = [
        { name: 'Super Admin', users: 2, permissions: ['Todos los módulos', 'Configuración', 'Usuarios', 'Roles', 'Auditoría'] },
        { name: 'Admin', users: 5, permissions: ['Productos', 'Comercios', 'Precios', 'Scrapers', 'Calidad'] },
        { name: 'Editor', users: 8, permissions: ['Productos', 'Categorías', 'Marcas', 'Imágenes', 'Promociones'] },
        { name: 'Analista', users: 12, permissions: ['Dashboard', 'Precios (lectura)', 'Calidad (lectura)', 'Alertas'] },
        { name: 'Soporte', users: 4, permissions: ['Usuarios (lectura)', 'Alertas (lectura)', 'Contacto'] },
    ];

    return (
        <div>
            <h2 className="mb-6 text-2xl font-bold">Gestión de Roles y Permisos</h2>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="text-slate-400">
                            <th className="pb-3">Rol</th>
                            <th className="pb-3">Usuarios</th>
                            <th className="pb-3">Permisos</th>
                            <th className="pb-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.map((r, i) => (
                            <tr key={i} className="border-t border-slate-800">
                                <td className="py-3 font-medium">{r.name}</td>
                                <td className="py-3">{r.users}</td>
                                <td className="py-3">
                                    <div className="flex flex-wrap gap-1.5">
                                        {r.permissions.map((perm) => (
                                            <span key={perm} className="inline-flex rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300">
                                                {perm}
                                            </span>
                                        ))}
                                    </div>
                                </td>
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
