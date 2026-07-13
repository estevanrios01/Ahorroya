import {
  areComparableProducts,
  filterProductsForQuery,
  matchesQueryIntent,
} from '../../services/liveFallbackProducts';

const product = (name: string, barcode?: string, brand = 'Diana') => ({
  name,
  barcode,
  brands: { name: brand },
});

describe('live catalog product logic', () => {
  it('matches equivalent unit spellings when no EAN is available', () => {
    expect(areComparableProducts(
      product('Arroz Diana 500 g'),
      product('Arroz blanco Diana 500gr')
    )).toBe(true);
  });

  it('never merges different EAN values or package sizes', () => {
    expect(areComparableProducts(
      product('Arroz Diana 500 g', '7702511000014'),
      product('Arroz Diana 500 g', '7702511000999')
    )).toBe(false);
    expect(areComparableProducts(
      product('Arroz Diana 500 g'),
      product('Arroz Diana 1000 g')
    )).toBe(false);
  });

  it('requires the written quantity and enough query terms', () => {
    expect(matchesQueryIntent(product('Arroz Diana 500 g'), 'arroz diana 500')).toBe(true);
    expect(matchesQueryIntent(product('Arroz Diana 2500 g'), 'arroz diana 500')).toBe(false);
    expect(matchesQueryIntent(product('Frijol Diana 500 g'), 'arroz diana 500')).toBe(false);
  });

  it('filters unrelated retailer results from a specific search', () => {
    const results = filterProductsForQuery([
      product('Arroz Diana 500 g'),
      product('Rice Paper caja x 40', undefined, 'Palladio'),
      product('Arroz Diana 1000 g'),
    ], 'arroz diana 500');

    expect(results.map((item) => item.name)).toEqual(['Arroz Diana 500 g']);
  });
});
