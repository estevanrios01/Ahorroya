import { detectPriceChange } from '../../services/scrapers/deduplicator';

describe('Price Change Detection', () => {
  test('detects 10% increase', () => {
    const result = detectPriceChange(4620, 4200);
    expect(result.changed).toBe(true);
    expect(result.percentage).toBe(10);
    expect(result.direction).toBe('up');
  });

  test('detects 15% decrease', () => {
    const result = detectPriceChange(3570, 4200);
    expect(result.changed).toBe(true);
    expect(result.percentage).toBe(-15);
    expect(result.direction).toBe('down');
  });

  test('ignores micro changes (< 0.01%)', () => {
    const result = detectPriceChange(4200.01, 4200);
    expect(result.changed).toBe(false);
  });

  test('records correct diff', () => {
    const result = detectPriceChange(5000, 4200);
    expect(result.diff).toBe(800);
    expect(result.previous).toBe(4200);
    expect(result.current).toBe(5000);
  });

  test('handles first-time price (no previous)', () => {
    const result = detectPriceChange(4200, undefined);
    expect(result.changed).toBe(false);
    expect(result.direction).toBe('stable');
  });
});
