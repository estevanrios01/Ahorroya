export default async function ProductDetail({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${slug}`, {
        cache: "no-store"
    });
    const json = await res.json();
    const product = json.data;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">{product.name}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <div className="h-80 bg-slate-100 rounded-xl flex items-center justify-center text-slate-300 mb-4">
                        [Imagen del producto]
                    </div>
                    <p className="text-slate-600">{product.description}</p>
                    <div className="mt-4 space-y-2 text-sm">
                        <p><strong>Marca:</strong> {product.brand}</p>
                        <p><strong>Categoría:</strong> {product.category}</p>
                        <p><strong>Código:</strong> {product.barcode}</p>
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-4">Comparar Precios</h2>
                    {(product.prices || []).map((p: { store: string; price: number; distance: number; available: boolean }, i: number) => (
                        <div key={i} className="flex justify-between items-center border-b py-4">
                            <div>
                                <p className="font-medium">{p.store}</p>
                                <p className="text-sm text-slate-500">{p.distance} km</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-bold text-emerald-600">
                                    ${p.price.toLocaleString("es-CO")}
                                </p>
                                <p className={`text-xs ${p.available ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {p.available ? 'En stock' : 'Agotado'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
