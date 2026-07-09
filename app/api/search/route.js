import { NextResponse } from 'next/server';
import { search, buildIndex } from '../../../packages/search-index/index';

const datosSemilla = [
  {
    id: '1',
    name: 'Arroz Diana Premium',
    slug: 'arroz-diana-premium',
    brand: 'Diana',
    category: 'Despensa',
    aliases: ['arroz diana', 'arroz premium diana'],
    tokens: ['arroz', 'diana', 'premium'],
    stores: 12,
    minimumPrice: BigInt(3800),
    maximumPrice: BigInt(5200),
  },
  {
    id: '2',
    name: 'Arroz Roa Fortificado',
    slug: 'arroz-roa-fortificado',
    brand: 'Roa',
    category: 'Despensa',
    aliases: ['arroz roa', 'roa fortificado'],
    tokens: ['arroz', 'roa', 'fortificado'],
    stores: 8,
    minimumPrice: BigInt(3400),
    maximumPrice: BigInt(4800),
  },
  {
    id: '3',
    name: 'Aceite Gourmet Familia',
    slug: 'aceite-gourmet-familia',
    brand: 'Familia',
    category: 'Despensa',
    aliases: ['aceite familia', 'aceite gourmet'],
    tokens: ['aceite', 'gourmet', 'familia'],
    stores: 6,
    minimumPrice: BigInt(11500),
    maximumPrice: BigInt(14500),
  },
  {
    id: '4',
    name: 'Leche Entera Colanta',
    slug: 'leche-entera-colanta',
    brand: 'Colanta',
    category: 'Lácteos',
    aliases: ['leche colanta', 'leche entera'],
    tokens: ['leche', 'entera', 'colanta'],
    stores: 15,
    minimumPrice: BigInt(2800),
    maximumPrice: BigInt(3800),
  },
  {
    id: '5',
    name: 'Pan Bimbo Integral',
    slug: 'pan-bimbo-integral',
    brand: 'Bimbo',
    category: 'Panadería',
    aliases: ['pan integral', 'bimbo integral'],
    tokens: ['pan', 'bimbo', 'integral'],
    stores: 10,
    minimumPrice: BigInt(4500),
    maximumPrice: BigInt(5800),
  },
];

buildIndex(datosSemilla);

function serialize(obj) {
  return JSON.parse(JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? Number(v) : v));
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') ?? '';
  const results = search(q);
  return NextResponse.json({ query: q, results: serialize(results), total: results.length });
}
