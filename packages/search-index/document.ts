export interface SearchDocument {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  ean?: string;
  aliases: string[];
  tokens: string[];
  stores: number;
  minimumPrice: bigint;
  maximumPrice: bigint;
}
