// No hooks/state/handlers of its own -- only ProductCardPremium (which
// keeps its own 'use client') needs to hydrate. Rendered from a Server
// Component (HomeProductSections) this now stays server-rendered instead
// of shipping this wrapper's code to the client for no reason; rendered
// from a Client Component (ProductDetailClient) it still works exactly as
// before, just without a redundant directive.
import ProductCardPremium from './ProductCardPremium';
import { ProductCardSkeleton } from '../../packages/ui/src/components/skeleton';

export default function ProductGrid({ products, loading = false, columns = 4 }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {products.map((product, i) => (
        <ProductCardPremium key={product.id || i} product={product} eager={i < 4} />
      ))}
    </div>
  );
}
