const { isPriceAnomaly } = require('../../scripts/lib/supabase-rest');

describe('isPriceAnomaly (import pipeline)', () => {
  it('flags a large relative jump', () => {
    expect(isPriceAnomaly(1000, 1700)).toBe(true);
    expect(isPriceAnomaly(1000, 300)).toBe(true);
  });

  it('does not flag a normal change', () => {
    expect(isPriceAnomaly(1000, 1100)).toBe(false);
    expect(isPriceAnomaly(1000, 900)).toBe(false);
  });

  it('does not flag when there is no previous price', () => {
    expect(isPriceAnomaly(null, 1000)).toBe(false);
    expect(isPriceAnomaly(0, 1000)).toBe(false);
    expect(isPriceAnomaly(undefined, 1000)).toBe(false);
  });

  it('does not flag when the new price is not a finite number', () => {
    expect(isPriceAnomaly(1000, NaN)).toBe(false);
    expect(isPriceAnomaly(1000, undefined)).toBe(false);
  });

  it('respects a custom threshold', () => {
    expect(isPriceAnomaly(1000, 1300, 0.2)).toBe(true);
    expect(isPriceAnomaly(1000, 1300, 0.5)).toBe(false);
  });
});
