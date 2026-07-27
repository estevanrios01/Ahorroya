import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductGrid from '../product/ProductGrid';
import { EmptyState } from '../../packages/ui/src/components/empty-state';
import { Section } from '../../packages/ui/src/components/section';

function toProductCard(product) {
  const listings = (product.store_products || []).filter((item) => item.available !== false && item.price != null);
  const ordered = [...listings].sort((a, b) => Number(a.price) - Number(b.price));
  const best = ordered[0];
  const originalPrice = best?.original_price ? Number(best.original_price) : null;

  return {
    id: product.id,
    name: product.name,
    brand: product.brands?.name || '',
    price: best ? Number(best.price) : null,
    oldPrice: originalPrice && best && originalPrice > Number(best.price) ? originalPrice : null,
    storesCount: new Set(listings.map((item) => item.store_id || item.stores?.slug)).size,
    bestStore: best?.stores?.name || '',
    store_products: listings,
    slug: product.slug,
    presentation: product.unit || product.short_name || '',
    image: product.image,
    isCheapest: ordered.length > 1,
  };
}

function ProductSectionBody({ products }) {
  if (products.length > 0) {
    return <ProductGrid products={products} loading={false} />;
  }

  return (
    <EmptyState
      variant="products"
      title="Sin productos verificables por ahora"
      description="No mostramos productos sin precio e imagen confiable. Busca un producto puntual para consultar fuentes vivas disponibles."
    />
  );
}

// Fetched server-side in app/page.js and passed in as props -- this used to
// fetch its own data client-side via useEffect after hydration, which meant
// the homepage's main product content (the whole reason to land here) was
// never in the initial HTML: an extra round trip, a loading skeleton flash,
// and nothing for a crawler that doesn't execute JS to see.
export default function HomeProductSections({ rawProducts, degraded }) {
  const products = (rawProducts || []).map(toProductCard).filter((product) => product.image);
  const discountedProducts = products.filter((product) => product.oldPrice && product.price).slice(0, 8);

  return (
    <>
      {degraded && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Mostrando precios desde fuentes vivas mientras la base principal vuelve a estar disponible.
        </div>
      )}

      <Section
        title="Productos para comparar ahora"
        subtitle="Referencias con imagen comercial, precio publicado y comercio de menor precio"
        action={<Link href="/buscar" className="inline-flex items-center gap-1 text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300">Explorar <ArrowRight size={14} /></Link>}
      >
        <ProductSectionBody products={products.slice(0, 8)} />
      </Section>

      {discountedProducts.length > 0 && (
        <Section
          title="Bajaron de precio"
          subtitle="Productos con descuento detectado frente al precio anterior"
          action={<Link href="/buscar?q=ofertas" className="inline-flex items-center gap-1 text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300">Ver ofertas <ArrowRight size={14} /></Link>}
        >
          <ProductSectionBody products={discountedProducts} />
        </Section>
      )}
    </>
  );
}
