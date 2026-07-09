import SearchBox from "../components/search/search-box";
import Header from "../components/layout/header";
import Footer from "../components/layout/footer";
import ProductGrid from "../components/product/product-grid";

export default function WebHome() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
                <section className="text-center mb-12">
                    <h2 className="text-4xl font-bold mb-4">
                        Encuentra el mejor precio cerca de ti
                    </h2>
                    <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                        Compara precios en supermercados y farmacias de Colombia.
                        Ahorra tiempo y dinero con información actualizada.
                    </p>
                </section>

                <section className="max-w-2xl mx-auto mb-12">
                    <SearchBox />
                </section>

                <section className="mb-12">
                    <h3 className="text-xl font-semibold mb-6">Productos Destacados</h3>
                    <ProductGrid />
                </section>
            </main>
            <Footer />
        </div>
    );
}
