import axios, { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';
import { ScraperPlugin, ScrapedProduct } from './plugin';

export abstract class BaseHttpPlugin implements ScraperPlugin {
  abstract id: string;
  abstract name: string;
  abstract category: 'supermercado' | 'farmacia';
  abstract baseUrl: string;
  abstract rateLimit: number;
  abstract selectors: ScraperPlugin['selectors'];
  abstract pagination?: ScraperPlugin['pagination'];
  abstract headers?: Record<string, string>;

  protected http: AxiosInstance;
  protected lastRequest = 0;

  constructor() {
    this.http = axios.create({
      timeout: 15000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-CO,es;q=0.9,en;q=0.8',
        ...this.headers,
      },
    });
  }

  protected async rateLimitGuard(): Promise<void> {
    const now = Date.now();
    const minInterval = 1000 / this.rateLimit;
    const elapsed = now - this.lastRequest;
    if (elapsed < minInterval) {
      await new Promise((r) => setTimeout(r, minInterval - elapsed));
    }
    this.lastRequest = Date.now();
  }

  protected async fetchHTML(url: string): Promise<cheerio.CheerioAPI> {
    await this.rateLimitGuard();
    const resp = await this.http.get(url);
    return cheerio.load(resp.data);
  }

  protected parseProducts($: cheerio.CheerioAPI): ScrapedProduct[] {
    const products: ScrapedProduct[] = [];
    const { product, name, price, oldPrice, image, barcode, brand } =
      this.selectors;

    if (!product) return products;

    $(product).each((_i, el) => {
      const $el = $(el);
      const nameText = name ? $el.find(name).first().text().trim() : '';
      const priceText = price ? $el.find(price).first().text().trim() : '';
      const oldPriceText = oldPrice
        ? $el.find(oldPrice).first().text().trim()
        : '';
      const imageSrc = image ? $el.find(image).first().attr('src') : undefined;
      const barcodeText = barcode
        ? $el.find(barcode).first().text().trim()
        : '';
      const brandText = brand
        ? $el.find(brand).first().text().trim()
        : undefined;
      const link = $el.find('a').first().attr('href') || '';
      const absoluteUrl = link.startsWith('http')
        ? link
        : `${this.baseUrl.replace(/\/+$/, '')}/${link.replace(/^\//, '')}`;

      const parsedPrice = this.parsePrice(priceText);
      if (!nameText || parsedPrice === null) return;

      products.push({
        externalId: this.makeId(nameText, brandText),
        name: nameText,
        price: parsedPrice,
        originalPrice: oldPrice ? this.parsePrice(oldPriceText) ?? undefined : undefined,
        image: imageSrc || undefined,
        url: absoluteUrl,
        ean: barcodeText || undefined,
        category: this.name,
        available: true,
        brand: brandText || undefined,
      });
    });

    return products;
  }

  protected getNextPage($: cheerio.CheerioAPI): string | null {
    const { nextPage } = this.selectors;
    if (!nextPage) return null;

    const href = $(nextPage).first().attr('href');
    if (!href) return null;

    return href.startsWith('http') ? href : `${this.baseUrl.replace(/\/+$/, '')}/${href.replace(/^\//, '')}`;
  }

  protected buildPageUrl(page: number): string {
    if (this.pagination?.type === 'url') {
      const separator = this.baseUrl.includes('?') ? '&' : '?';
      const param = this.pagination.param || 'page';
      return `${this.baseUrl}${separator}${param}=${page}`;
    }
    return this.baseUrl;
  }

  private parsePrice(text: string): number | null {
    const cleaned = text.replace(/[^0-9,.]/g, '').replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }

  private makeId(name: string, brand?: string): string {
    const raw = `${brand || ''}${name}`.replace(/\s+/g, '-').toLowerCase();
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      const chr = raw.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0;
    }
    return `${this.id}_${Math.abs(hash).toString(36)}`;
  }

  async scrape(page = 1): Promise<ScrapedProduct[]> {
    const url = this.buildPageUrl(page);
    const $ = await this.fetchHTML(url);
    return this.parseProducts($);
  }
}
