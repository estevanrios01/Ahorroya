import * as cheerio from 'cheerio';
import { createLogger } from '../../lib/observability/logger';
import { evaluateAlerts } from '../../lib/observability/alerts';
import { RETAILER_CONFIGS, createScraper } from './config';

const logger = createLogger({ service: 'scheduler' });
const DEFAULT_INTERVAL = 6 * 3600000;

const runningJobs = new Map();
const jobQueue = [];
let isProcessing = false;

function parseHtmlProducts(html, config, limit = 50) {
  const products = [];
  const seen = new Set();

  const addProduct = (raw) => {
    const product = normalizeRawProduct(raw, config);
    if (!product.name || product.price <= 0) return;
    const key = product.ean || product.sku || `${product.name}-${product.price}-${product.url || ''}`;
    if (seen.has(key)) return;
    seen.add(key);
    products.push(product);
  };

  for (const json of extractJsonBlocks(html)) {
    collectProducts(json, addProduct);
    if (products.length >= limit) break;
  }

  if (products.length < limit) {
    const $ = cheerio.load(html);
    $('[data-testid*="product"], [class*="product"], [class*="Product"], article, li').each((_, element) => {
      if (products.length >= limit) return false;
      const $el = $(element);
      const name = cleanText($el.find('[class*="name"], [class*="Name"], h2, h3, a[title]').first().text()) || $el.find('img[alt]').first().attr('alt') || $el.attr('title');
      const priceText = cleanText($el.find('[class*="price"], [class*="Price"], [data-price]').first().text()) || $el.attr('data-price');
      const image = absolutize($el.find('img').first().attr('src') || $el.find('img').first().attr('data-src'), config.baseUrl);
      const url = absolutize($el.find('a[href]').first().attr('href'), config.baseUrl);
      addProduct({ name, price: priceText, image, url, sku: $el.attr('data-sku') || $el.attr('data-id') });
    });
  }

  return products.slice(0, limit);
}

function extractJsonBlocks(html) {
  const blocks = [];
  const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = jsonLdRegex.exec(html)) !== null) {
    try { blocks.push(JSON.parse(match[1].trim())); } catch { }
  }

  const nextDataMatch = html.match(/<script[^>]*id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);
  if (nextDataMatch) {
    try { blocks.push(JSON.parse(nextDataMatch[1].trim())); } catch { }
  }

  return blocks;
}

function collectProducts(node, addProduct, depth = 0) {
  if (!node || depth > 12) return;
  if (Array.isArray(node)) {
    for (const item of node) collectProducts(item, addProduct, depth + 1);
    return;
  }
  if (typeof node !== 'object') return;

  const type = node['@type'];
  const looksLikeProduct = type === 'Product' || (node.name && (node.offers || node.price || node.sku || node.gtin13 || node.image));
  if (looksLikeProduct) addProduct(parseJsonProduct(node));

  for (const value of Object.values(node)) collectProducts(value, addProduct, depth + 1);
}

function parseJsonProduct(json) {
  const offers = Array.isArray(json.offers) ? json.offers[0] : json.offers;
  const aggregate = json.aggregateOffer || json.aggregateOffers;
  return {
    name: json.name || json.title || json.description,
    price: offers?.price || offers?.lowPrice || aggregate?.lowPrice || json.price || json.priceRange?.sellingPrice?.highPrice,
    originalPrice: offers?.highPrice || json.listPrice,
    image: Array.isArray(json.image) ? json.image[0] : json.image || json.images?.[0]?.url,
    description: json.description,
    brand: typeof json.brand === 'string' ? json.brand : json.brand?.name,
    ean: json.gtin13 || json.gtin12 || json.gtin8 || json.gtin || json.ean,
    sku: json.sku || json.productId || json.id,
    category: json.category || json.categoryName,
    url: json.url || offers?.url,
    available: !String(offers?.availability || '').toLowerCase().includes('outofstock'),
  };
}

function normalizeRawProduct(raw, config) {
  const price = normalizePrice(raw.price);
  return {
    ...raw,
    name: cleanText(raw.name),
    price,
    image: absolutize(Array.isArray(raw.image) ? raw.image[0] : raw.image, config.baseUrl),
    url: absolutize(raw.url, config.baseUrl),
    category: raw.category || config.defaultQuery,
  };
}

function normalizePrice(value) {
  if (value == null) return 0;
  if (typeof value === 'number') return Math.round(value * 100) / 100;
  const cleaned = String(value).replace(/[^0-9.,]/g, '').replace(/\./g, '').replace(',', '.');
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : 0;
}

function cleanText(value) {
  return String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function absolutize(url, baseUrl) {
  if (!url) return null;
  try { return new URL(url, baseUrl).toString(); } catch { return url; }
}

export function enqueueJob(store, options = {}) {
  jobQueue.push({ store, options, addedAt: Date.now() });
  processQueue();
}

async function processQueue() {
  if (isProcessing) return;
  isProcessing = true;
  while (jobQueue.length > 0) {
    const job = jobQueue.shift();
    try {
      await runScraper(job.store, job.options);
    } catch (err) {
      const retries = (job.retries || 0) + 1;
      logger.error(`Scheduled scraper failed for ${job.store}`, { error: err.message, retries });
      if (retries <= 3) jobQueue.push({ ...job, retries, addedAt: Date.now() });
    }
  }
  isProcessing = false;
}

async function runScraper(store, options) {
  if (runningJobs.has(store)) {
    logger.warn(`Scraper already running for ${store}, skipping`);
    return;
  }
  const config = RETAILER_CONFIGS.find(c => c.name === store);
  const scraper = createScraper(store, (html, limit) => parseHtmlProducts(html, config, limit));
  runningJobs.set(store, true);
  try {
    await scraper.runScraper({ query: config.defaultQuery, limit: 100, ...options });
  } finally {
    runningJobs.delete(store);
  }
}

const scheduledTimers = new Map();

export function scheduleAll(retailers = RETAILER_CONFIGS.map(c => c.name), intervalMs = DEFAULT_INTERVAL) {
  logger.info(`Scheduling scrapers for: ${retailers.join(', ')} every ${intervalMs / 60000}min`);
  for (const store of retailers) scheduleScraper(store, intervalMs);
}

export function scheduleScraper(store, intervalMs = DEFAULT_INTERVAL) {
  if (scheduledTimers.has(store)) clearInterval(scheduledTimers.get(store));
  const config = RETAILER_CONFIGS.find(c => c.name === store);
  const run = () => enqueueJob(store, { query: config?.defaultQuery || 'arroz', limit: 100 });
  setTimeout(run, 5000);
  const timer = setInterval(run, intervalMs);
  scheduledTimers.set(store, timer);
  logger.info(`Scheduled ${store} every ${intervalMs / 60000}min`);
}

export function stopScheduler() {
  for (const [store, timer] of scheduledTimers) {
    clearInterval(timer);
    logger.info(`Stopped scheduler for ${store}`);
  }
  scheduledTimers.clear();
}

export function getSchedulerStatus() {
  const nextRuns = {};
  for (const [store] of scheduledTimers) nextRuns[store] = { scheduled: true, running: runningJobs.has(store) };
  for (const config of RETAILER_CONFIGS) {
    if (!nextRuns[config.name]) nextRuns[config.name] = { scheduled: false, running: runningJobs.has(config.name) };
  }
  return {
    running: [...runningJobs.keys()],
    queueLength: jobQueue.length,
    scrapers: nextRuns,
    alerts: evaluateAlerts(),
    timestamp: new Date().toISOString(),
  };
}
