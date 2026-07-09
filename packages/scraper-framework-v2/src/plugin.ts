export interface ScraperPlugin {
  id: string;
  name: string;
  category: 'supermercado' | 'farmacia';
  baseUrl: string;
  rateLimit: number;
  selectors: {
    product?: string;
    name?: string;
    price?: string;
    oldPrice?: string;
    image?: string;
    barcode?: string;
    brand?: string;
    nextPage?: string;
  };
  pagination?: {
    type: 'url' | 'scroll';
    param?: string;
    maxPages: number;
  };
  headers?: Record<string, string>;
  scrape(page?: number): Promise<ScrapedProduct[]>;
}

export interface ScrapedProduct {
  externalId: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  url: string;
  ean?: string;
  category?: string;
  available: boolean;
}
