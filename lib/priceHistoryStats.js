// Honest statistics computed from real observed price history -- unlike
// packages/pricing-core/src/forecast, which extrapolates specific future
// prices from a 7-day average and presents them as if they were real,
// this only ever reports on prices that were actually captured.

export function getHistoricalMin(history) {
  const prices = (history || []).map((entry) => entry.price).filter((price) => price > 0);
  return prices.length ? Math.min(...prices) : null;
}

export function getHistoricalMax(history) {
  const prices = (history || []).map((entry) => entry.price).filter((price) => price > 0);
  return prices.length ? Math.max(...prices) : null;
}

export function getRollingAverage(history, window = 7) {
  const prices = (history || []).map((entry) => entry.price).filter((price) => price > 0);
  if (!prices.length) return null;
  const slice = prices.slice(-window);
  return Math.round((slice.reduce((sum, price) => sum + price, 0) / slice.length) * 100) / 100;
}

// 3-point average vs. a reference point, with a 2% threshold -- steadier
// than a bare first-vs-last comparison, which flips on a single outlier at
// either end of the series.
export function getTrend(history) {
  const prices = (history || []).map((entry) => entry.price).filter((price) => price > 0);
  if (prices.length < 3) return 'stable';
  const recent = prices.slice(-3);
  const avg = recent.reduce((sum, price) => sum + price, 0) / recent.length;
  const reference = prices[prices.length - 3];
  if (avg > reference * 1.02) return 'up';
  if (avg < reference * 0.98) return 'down';
  return 'stable';
}
