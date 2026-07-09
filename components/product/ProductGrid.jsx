'use client';

import ProductCardPremium from './ProductCardPremium';
import { ProductCardSkeleton } from '../../packages/ui/src/components/skeleton';

export default function ProductGrid({ products, loading = false, columns = 4 }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product, i) => (
        <ProductCardPremium key={product.id || i} product={product} />
      ))}
    </div>
  );
}
