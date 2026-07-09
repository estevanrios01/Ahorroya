const products = [
    { id: 1, name: "Arroz Diana Premium", brand: "Diana", image: "", price: 3800, store: "D1" },
    { id: 2, name: "Aceite Gourmet Familia", brand: "Familia", image: "", price: 12500, store: "Éxito" },
    { id: 3, name: "Leche Entera Colanta", brand: "Colanta", image: "", price: 2800, store: "D1" },
    { id: 4, name: "Acetaminofén MK 500mg", brand: "MK", image: "", price: 2850, store: "Cruz Verde" },
];

export default function ProductGrid() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
                <article key={p.id} className="rounded-xl border bg-white p-4 hover:shadow-lg transition-shadow">
                    <div className="h-40 bg-slate-100 rounded-lg mb-4 flex items-center justify-center text-slate-300">
                        [Imagen]
                    </div>
                    <h4 className="font-semibold">{p.name}</h4>
                    <p className="text-sm text-slate-500">{p.brand}</p>
                    <div className="flex justify-between items-center mt-3">
                        <span className="text-xl font-bold text-emerald-600">
                            ${p.price.toLocaleString("es-CO")}
                        </span>
                        <span className="text-xs text-slate-400">{p.store}</span>
                    </div>
                </article>
            ))}
        </div>
    );
}
