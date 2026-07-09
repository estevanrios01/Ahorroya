export function ProductJsonLd({ product }) {
  const formatPrice = (v) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v);
  const bestPrice = Math.min(...product.prices.map(p => p.price));
  const highPrice = Math.max(...product.prices.map(p => p.price));

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    brand: { '@type': 'Brand', name: product.brand },
    category: product.category,
    ...(product.barcode && { gtin13: product.barcode }),
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'COP',
      lowPrice: bestPrice,
      highPrice: highPrice,
      offerCount: product.prices.length,
      availability: 'https://schema.org/InStock',
      offers: product.prices.map(p => ({
        '@type': 'Offer',
        price: p.price,
        priceCurrency: 'COP',
        seller: { '@type': 'Organization', name: p.store },
        ...(p.available ? {} : { availability: 'https://schema.org/OutOfStock' }),
        ...(p.oldPrice > p.price ? {
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: p.price,
            priceCurrency: 'COP',
            ...(p.oldPrice > p.price ? {
              discount: Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100),
              discountType: 'https://schema.org/Discount'
            } : {})
          }
        } : {}),
      })),
    },
    ...(product.image ? { image: product.image } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function StoreJsonLd({ store }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': store.type === 'farmacia' ? 'Pharmacy' : 'GroceryStore',
    name: store.name,
    description: store.description,
    url: `https://ahorroya.vercel.app/${store.type}/${store.slug}`,
    ...(store.phone && { telephone: store.phone }),
    ...(store.schedule && { openingHours: store.schedule }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function CategoryJsonLd({ category, products }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${category.name} - AhorroYa`,
    description: category.description,
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: p.name,
        url: `https://ahorroya.vercel.app/producto/${p.slug}`,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbJsonLd({ items }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url ? `https://ahorroya.vercel.app${item.url}` : undefined,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebSiteJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AhorroYa',
    url: 'https://ahorroya.vercel.app',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://ahorroya.vercel.app/buscar?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
