const LRU_CACHE = new Map();
const MAX_CACHE = 10000;

export function deduplicate(products, existingProducts = []) {
  const seen = new Map();
  for (const p of existingProducts) {
    if (p.ean) seen.set(p.ean, p);
    if (p.slug) seen.set(p.slug, p);
  }
  const unique = [];
  for (const p of products) {
    const key = p.ean || p.slug || p.name;
    if (!key || seen.has(key)) continue;
    seen.set(key, p);
    unique.push(p);
  }
  return unique;
}

export function detectPriceChange(current, previous) {
  if (!previous || !current) return { changed: false, direction: 'stable' };
  const diff = current - previous;
  const pct = previous > 0 ? (diff / previous) * 100 : 0;
  return {
    changed: Math.abs(pct) > 0.01,
    previous,
    current,
    diff,
    percentage: Math.round(pct * 100) / 100,
    direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable',
  };
}
