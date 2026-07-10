import { deduplicate, detectPriceChange } from '../../services/scrapers/deduplicator';

describe('Scraper Deduplicator', () => {
  describe('deduplicate', () => {
    test('removes exact duplicates', () => {
      const products = [
        { name: 'Arroz', ean: '7702010000011' },
        { name: 'Arroz', ean: '7702010000011' },
        { name: 'Leche', ean: '7702010000028' },
      ];
      const result = deduplicate(products);
      expect(result).toHaveLength(2);
    });

    test('deduplicates against existing', () => {
      const products = [
        { name: 'Arroz', ean: '7702010000011' },
        { name: 'Frijol', ean: '7702010000035' },
      ];
      const existing = [{ ean: '7702010000011', name: 'Arroz Diana' }];
      const result = deduplicate(products, existing);
      expect(result).toHaveLength(1);
      expect(result[0].ean).toBe('7702010000035');
    });

    test('handles empty input', () => {
      expect(deduplicate([])).toHaveLength(0);
    });

    test('deduplicates by slug', () => {
      const products = [
        { name: 'Arroz', slug: 'arroz-diana' },
        { name: 'Arroz Repetido', slug: 'arroz-diana' },
      ];
      const result = deduplicate(products);
      expect(result).toHaveLength(1);
    });
  });

  describe('detectPriceChange', () => {
    test('detects price increase', () => {
      const result = detectPriceChange(5000, 4200);
      expect(result.changed).toBe(true);
      expect(result.direction).toBe('up');
      expect(result.percentage).toBeCloseTo(19.05, 0);
    });

    test('detects price decrease', () => {
      const result = detectPriceChange(3800, 4200);
      expect(result.changed).toBe(true);
      expect(result.direction).toBe('down');
    });

    test('stable price', () => {
      const result = detectPriceChange(4200, 4200);
      expect(result.changed).toBe(false);
      expect(result.direction).toBe('stable');
    });

    test('handles null previous', () => {
      const result = detectPriceChange(4200, null);
      expect(result.changed).toBe(false);
    });
  });
});
