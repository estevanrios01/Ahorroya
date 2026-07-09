export default function AdminImagenes() {
    const images = [
        { product: 'Arroz Diana Premium', thumbnail: 'AD', status: 'Aprobada' },
        { product: 'Acetaminofén MK 500mg', thumbnail: 'AM', status: 'Pendiente' },
        { product: 'Leche Alpina Entera', thumbnail: 'LA', status: 'Aprobada' },
        { product: 'Coca-Cola 2L', thumbnail: 'CC', status: 'Rechazada' },
        { product: 'Jabón Rexona', thumbnail: 'JR', status: 'Pendiente' },
        { product: 'Pan Bimbo Blanco', thumbnail: 'PB', status: 'Aprobada' },
        { product: 'Frijoles Diana', thumbnail: 'FD', status: 'Aprobada' },
        { product: 'Shampoo Pantene', thumbnail: 'SP', status: 'Rechazada' },
    ];

    return (
        <div>
            <h2 className="mb-6 text-2xl font-bold">Gestión de Imágenes</h2>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="text-slate-400">
                            <th className="pb-3">Vista Previa</th>
                            <th className="pb-3">Producto</th>
                            <th className="pb-3">Estado</th>
                            <th className="pb-3">Validación</th>
                            <th className="pb-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {images.map((img, i) => (
                            <tr key={i} className="border-t border-slate-800">
                                <td className="py-3">
                                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-slate-700 text-xs font-bold text-slate-400">{img.thumbnail}</span>
                                </td>
                                <td className="py-3">{img.product}</td>
                                <td className={`py-3 ${
                                    img.status === 'Aprobada' ? 'text-emerald-400' :
                                    img.status === 'Pendiente' ? 'text-yellow-400' : 'text-rose-400'
                                }`}>{img.status}</td>
                                <td className="py-3">
                                    <span className={`inline-flex items-center gap-1 text-xs ${
                                        img.status === 'Aprobada' ? 'text-emerald-400' :
                                        img.status === 'Pendiente' ? 'text-yellow-400' : 'text-rose-400'
                                    }`}>
                                        {img.status === 'Aprobada' && '✓ Resolución OK'}
                                        {img.status === 'Pendiente' && '⏳ En revisión'}
                                        {img.status === 'Rechazada' && '✗ Sin contenido'}
                                    </span>
                                </td>
                                <td className="py-3 space-x-3">
                                    {img.status === 'Pendiente' && <button className="text-emerald-400 hover:text-emerald-300">Aprobar</button>}
                                    {img.status === 'Pendiente' && <button className="text-rose-400 hover:text-rose-300">Rechazar</button>}
                                    {(img.status === 'Aprobada' || img.status === 'Rechazada') && <button className="text-cyan-400 hover:text-cyan-300">Revisar</button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
