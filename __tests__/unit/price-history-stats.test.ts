import { getHistoricalMin, getHistoricalMax, getRollingAverage, getTrend } from '../../lib/priceHistoryStats';

function history(prices) {
  return prices.map((price, i) => ({ date: `2026-01-${String(i + 1).padStart(2, '0')}`, price }));
}

describe('priceHistoryStats', () => {
  it('finds the historical min and max', () => {
    const h = history([1000, 1500, 900, 1200]);
    expect(getHistoricalMin(h)).toBe(900);
    expect(getHistoricalMax(h)).toBe(1500);
  });

  it('returns null for empty history', () => {
    expect(getHistoricalMin([])).toBeNull();
    expect(getHistoricalMax([])).toBeNull();
    expect(getRollingAverage([])).toBeNull();
  });

  it('computes a rolling average over the trailing window', () => {
    const h = history([100, 200, 300, 400, 500]);
    expect(getRollingAverage(h, 2)).toBe(450);
    expect(getRollingAverage(h, 5)).toBe(300);
  });

  it('ignores non-positive prices', () => {
    const h = history([1000, 0, 1200]);
    expect(getHistoricalMin(h)).toBe(1000);
  });

  it('detects a clear upward trend', () => {
    expect(getTrend(history([1000, 1000, 1300, 1350, 1400]))).toBe('up');
  });

  it('detects a clear downward trend', () => {
    expect(getTrend(history([1400, 1400, 1100, 1050, 1000]))).toBe('down');
  });

  it('treats small fluctuations as stable', () => {
    expect(getTrend(history([1000, 1005, 995, 1010, 1000]))).toBe('stable');
  });

  it('is stable with fewer than 3 data points', () => {
    expect(getTrend(history([1000, 2000]))).toBe('stable');
  });
});
