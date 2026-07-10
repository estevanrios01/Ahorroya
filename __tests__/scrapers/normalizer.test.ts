import { normalizeProduct, normalizePrice, normalizeEAN, toSlug } from '../../services/scrapers/normalizer';

describe('Scraper Normalizer', () => {
  describe('normalizePrice', () => {
    test('parses integer price', () => expect(normalizePrice(4200)).toBe(4200));
    test('parses decimal price', () => expect(normalizePrice(4299.99)).toBe(4299.99));
    test('parses string price with dots', () => expect(normalizePrice('4.299')).toBe(4299));
    test('parses Colombian format', () => expect(normalizePrice('4.299,99')).toBe(4299.99));
    test('handles null', () => expect(normalizePrice(null)).toBe(0));
    test('handles undefined', () => expect(normalizePrice(undefined)).toBe(0));
    test('handles invalid string', () => expect(normalizePrice('N/A')).toBe(0));
  });

  describe('normalizeEAN', () => {
    test('validates 13-digit EAN', () => expect(normalizeEAN('7702010000011')).toBe('7702010000011'));
    test('validates 8-digit EAN', () => expect(normalizeEAN('12345678')).toBe('12345678'));
    test('cleans non-digits', () => expect(normalizeEAN('770-2010-0000-11')).toBe('7702010000011'));
    test('rejects too short', () => expect(normalizeEAN('123')).toBeNull());
    test('rejects too long', () => expect(normalizeEAN('12345678901234')).toBeNull());
    test('handles null', () => expect(normalizeEAN(null)).toBeNull());
  });

  describe('toSlug', () => {
    test('converts basic text', () => expect(toSlug('Arroz Diana Premium')).toBe('arroz-diana-premium'));
    test('removes accents', () => expect(toSlug('Farmacia Cruz Verde')).toBe('farmacia-cruz-verde'));
    test('handles empty', () => {
      const slug = toSlug('');
      expect(slug).toMatch(/^product-\d+$/);
    });
  });

  describe('normalizeProduct', () => {
    test('normalizes full product', () => {
      const result = normalizeProduct({
        name: '  Arroz Diana Premium  ',
        ean: '7702010000011',
        price: '4.299,99',
        brand: 'Diana',
        category: 'Despensa',
      });
      expect(result.name).toBe('Arroz Diana Premium');
      expect(result.price).toBe(4299.99);
      expect(result.ean).toBe('7702010000011');
      expect(result.status).toBe('active');
      expect(result.available).toBe(true);
    });

    test('handles minimal product', () => {
      const result = normalizeProduct({ name: 'Test' });
      expect(result.name).toBe('Test');
      expect(result.price).toBe(0);
      expect(result.status).toBe('active');
    });
  });
});
