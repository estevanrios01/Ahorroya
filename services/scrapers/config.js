import { ScraperEngine } from './engine';

export const RETAILER_CONFIGS = [
  {
    name: 'exito',
    label: 'Éxito',
    baseUrl: 'https://www.exito.com',
    searchUrl: 'https://www.exito.com/buscar?q={q}',
    categoryUrl: 'https://www.exito.com/{category}',
    rateLimitMs: 3000,
    retryMax: 3,
    timeout: 30000,
    type: 'supermarket',
  },
  {
    name: 'd1',
    label: 'D1',
    baseUrl: 'https://www.tiendasd1.com',
    searchUrl: 'https://www.tiendasd1.com/buscar?q={q}',
    categoryUrl: 'https://www.tiendasd1.com/{category}',
    rateLimitMs: 2000,
    retryMax: 3,
    timeout: 20000,
    type: 'supermarket',
  },
  {
    name: 'jumbo',
    label: 'Jumbo',
    baseUrl: 'https://www.jumbo.com.co',
    searchUrl: 'https://www.jumbo.com.co/buscar?q={q}',
    categoryUrl: 'https://www.jumbo.com.co/{category}',
    rateLimitMs: 3000,
    retryMax: 3,
    timeout: 30000,
    type: 'supermarket',
  },
  {
    name: 'ara',
    label: 'Ara',
    baseUrl: 'https://www.ara.com.co',
    searchUrl: 'https://www.ara.com.co/buscar?q={q}',
    categoryUrl: 'https://www.ara.com.co/{category}',
    rateLimitMs: 2000,
    retryMax: 3,
    timeout: 20000,
    type: 'supermarket',
  },
  {
    name: 'carulla',
    label: 'Carulla',
    baseUrl: 'https://www.carulla.com',
    searchUrl: 'https://www.carulla.com/buscar?q={q}',
    categoryUrl: 'https://www.carulla.com/{category}',
    rateLimitMs: 3000,
    retryMax: 3,
    timeout: 30000,
    type: 'supermarket',
  },
  {
    name: 'olimpica',
    label: 'Olímpica',
    baseUrl: 'https://www.olimpica.com',
    searchUrl: 'https://www.olimpica.com/buscar?q={q}',
    categoryUrl: 'https://www.olimpica.com/{category}',
    rateLimitMs: 3000,
    retryMax: 3,
    timeout: 30000,
    type: 'supermarket',
  },
  {
    name: 'makro',
    label: 'Makro',
    baseUrl: 'https://www.makro.com.co',
    searchUrl: 'https://www.makro.com.co/buscar?q={q}',
    categoryUrl: 'https://www.makro.com.co/{category}',
    rateLimitMs: 3000,
    retryMax: 3,
    timeout: 30000,
    type: 'supermarket',
  },
  {
    name: 'farmatodo',
    label: 'Farmatodo',
    baseUrl: 'https://www.farmatodo.com.co',
    searchUrl: 'https://www.farmatodo.com.co/buscar?q={q}',
    categoryUrl: 'https://www.farmatodo.com.co/{category}',
    rateLimitMs: 2000,
    retryMax: 3,
    timeout: 20000,
    type: 'pharmacy',
  },
  {
    name: 'cruz-verde',
    label: 'Cruz Verde',
    baseUrl: 'https://www.cruzverde.com.co',
    searchUrl: 'https://www.cruzverde.com.co/buscar?q={q}',
    categoryUrl: 'https://www.cruzverde.com.co/{category}',
    rateLimitMs: 2000,
    retryMax: 3,
    timeout: 20000,
    type: 'pharmacy',
  },
  {
    name: 'la-rebaja',
    label: 'La Rebaja',
    baseUrl: 'https://www.larebaja.com.co',
    searchUrl: 'https://www.larebaja.com.co/buscar?q={q}',
    categoryUrl: 'https://www.larebaja.com.co/{category}',
    rateLimitMs: 2000,
    retryMax: 3,
    timeout: 20000,
    type: 'pharmacy',
  },
];

export function getScraperConfig(name) {
  return RETAILER_CONFIGS.find(c => c.name === name);
}

export function createScraper(name, customParser) {
  const config = getScraperConfig(name);
  if (!config) throw new Error(`Unknown retailer: ${name}`);
  const engine = new ScraperEngine(config);
  if (customParser) {
    engine.parsePage = customParser;
  }
  return engine;
}


