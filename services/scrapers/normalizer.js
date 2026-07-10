export function normalizeProduct(raw) {
  return {
    name: raw.name?.trim()?.slice(0, 300) || 'Sin nombre',
    slug: toSlug(raw.name || raw.ean || `product-${Date.now()}`),
    shortName: raw.name?.trim()?.slice(0, 150) || null,
    brand: raw.brand?.trim()?.slice(0, 150) || null,
    ean: raw.ean || raw.barcode || null,
    price: normalizePrice(raw.price),
    originalPrice: raw.originalPrice ? normalizePrice(raw.originalPrice) : null,
    image: raw.image || null,
    description: raw.description?.trim()?.slice(0, 2000) || null,
    category: raw.category || null,
    subcategory: raw.subcategory || null,
    unit: raw.unit || 'unidad',
    weight: raw.weight || null,
    volume: raw.volume || null,
    status: 'active',
    available: raw.available !== false,
  };
}

export function normalizePrice(price) {
  if (price == null) return 0;
  if (typeof price === 'number') return Math.round(price * 100) / 100;
  const cleaned = String(price).replace(/[^0-9.,]/g, '').replace(/\./g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
}

export function toSlug(text) {
  if (!text) return `product-${Date.now()}`;
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 300) || `product-${Date.now()}`;
}

export function normalizeEAN(ean) {
  if (!ean) return null;
  const cleaned = String(ean).replace(/[^0-9]/g, '');
  if (cleaned.length >= 8 && cleaned.length <= 13) return cleaned;
  return null;
}
