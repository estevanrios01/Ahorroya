const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ahorroya.vercel.app';

// JSON.stringify() escapes quotes and control characters but not `<` -- a
// scraped product/store/category name containing a literal "</script>"
// (VTEX marketplaces let third-party sellers name their own listings, and
// this app only cosmetically cleans scraped names, e.g. fixMojibake(), not
// HTML-escapes them) would close this script tag early and let arbitrary
// following markup execute in every visitor's browser. < is a valid
// JSON/JS string escape for "<", so this can't change the schema's meaning,
// only prevent it from ever containing a real "</script>" sequence.
function toSafeJsonLdString(schema) {
  return JSON.stringify(schema).replace(/</g, '\\u003c');
}

export function ProductJsonLd({ product }) {
  const prices = product.prices || [];
  const availablePrices = prices.filter((p) => p.available);
  const pricesForRange = availablePrices.length > 0 ? availablePrices : prices;
  const bestPrice = prices.length > 0 ? Math.min(...pricesForRange.map(p => p.price)) : undefined;
  const highPrice = prices.length > 0 ? Math.max(...pricesForRange.map(p => p.price)) : undefined;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    brand: { '@type': 'Brand', name: product.brand },
    category: product.category,
    ...(product.barcode && { gtin13: product.barcode }),
    ...(prices.length > 0 ? { offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'COP',
      lowPrice: bestPrice,
      highPrice: highPrice,
      offerCount: prices.length,
      availability: availablePrices.length > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      offers: prices.map(p => ({
        '@type': 'Offer',
        price: p.price,
        priceCurrency: 'COP',
        seller: { '@type': 'Organization', name: p.store },
        ...(p.available ? {} : { availability: 'https://schema.org/OutOfStock' }),
        ...(p.oldPrice && p.oldPrice > p.price ? {
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: p.price,
            priceCurrency: 'COP',
            discount: Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100),
            discountType: 'https://schema.org/Discount'
          }
        } : {}),
      })),
    } } : {}),
    ...(product.image ? { image: product.image } : {}),
    url: `${SITE_URL}/producto/${product.slug}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: toSafeJsonLdString(schema) }}
    />
  );
}

export function StoreJsonLd({ store }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': store.type === 'farmacia' ? 'Pharmacy' : 'GroceryStore',
    name: store.name,
    description: store.description,
    url: `${SITE_URL}/${store.type}/${store.slug}`,
    ...(store.phone && { telephone: store.phone }),
    ...(store.schedule && { openingHours: store.schedule }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: toSafeJsonLdString(schema) }}
    />
  );
}

export function CategoryJsonLd({ category, products }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${category.name} - AhorroYa`,
    description: category.description,
    url: `${SITE_URL}/categoria/${category.slug}`,
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: p.name,
        url: `${SITE_URL}/producto/${p.slug}`,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: toSafeJsonLdString(schema) }}
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
      item: item.url ? `${SITE_URL}${item.url}` : undefined,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: toSafeJsonLdString(schema) }}
    />
  );
}

export function WebSiteJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AhorroYa',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/buscar?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: toSafeJsonLdString(schema) }}
    />
  );
}
