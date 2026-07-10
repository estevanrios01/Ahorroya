import { createLogger } from '../../lib/observability/logger';
import { evaluateAlerts } from '../../lib/observability/alerts';
import { RETAILER_CONFIGS, createScraper } from './config';

const logger = createLogger({ service: 'scheduler' });
const DEFAULT_INTERVAL = 6 * 3600000;
const RETRY_INTERVAL = 600000;

const runningJobs = new Map();
const jobQueue = [];
let isProcessing = false;

function parseHtmlProducts(html, selectors) {
  const products = [];
  try {
    const regex = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = regex.exec(html)) !== null) {
      try {
        const json = JSON.parse(match[1]);
        if (json['@type'] === 'Product') products.push(parseJsonLdProduct(json));
      } catch { }
    }
  } catch { }

  if (products.length === 0) {
    const nameRegex = /<h2[^>]*class="[^"]*product-name[^"]*"[^>]*>([\s\S]*?)<\/h2>/gi;
    const priceRegex = /<span[^>]*class="[^"]*price[^"]*"[^>]*>\$?\s*([0-9.,]+)<\/span>/gi;
    const imgRegex = /<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi;
    const names = [...html.matchAll(nameRegex)].map(m => m[1].trim());
    const prices = [...html.matchAll(priceRegex)].map(m => m[1]);
    const images = [...html.matchAll(imgRegex)].map(m => ({ src: m[1], alt: m[2] }));
    for (let i = 0; i < Math.min(names.length, 50); i++) {
      products.push({
        name: names[i] || images[i]?.alt || 'Producto',
        price: parseFloat(prices[i]?.replace(/[^0-9.,]/g, '').replace(',', '.') || '0'),
        image: images[i]?.src || null,
        ean: null,
        category: null,
      });
    }
  }
  return products;
}

function parseJsonLdProduct(json) {
  return {
    name: json.name || json.description || 'Producto',
    price: json.offers?.price || json.offers?.lowPrice || 0,
    image: json.image?.[0] || json.image || null,
    description: json.description || null,
    brand: json.brand?.name || null,
    ean: json.gtin13 || json.gtin12 || json.gtin8 || json.sku || null,
    category: json.category || null,
    sku: json.sku || null,
  };
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
      logger.error(`Scheduled scraper failed for ${job.store}`, { error: err.message });
      jobQueue.push({ ...job, retries: (job.retries || 0) + 1, addedAt: Date.now() });
      if ((job.retries || 0) > 3) {
        logger.error(`Scraper ${job.store} exceeded max retries, dropping`);
        jobQueue.pop();
      }
    }
  }
  isProcessing = false;
}

async function runScraper(store, options) {
  if (runningJobs.has(store)) {
    logger.warn(`Scraper already running for ${store}, skipping`);
    return;
  }
  const scraper = createScraper(store, (html, limit) => parseHtmlProducts(html, RETAILER_CONFIGS.find(c => c.name === store)?.selectors));
  runningJobs.set(store, true);
  try {
    await scraper.runScraper(options);
  } finally {
    runningJobs.delete(store);
  }
}

const scheduledTimers = new Map();

export function scheduleAll(retailers = RETAILER_CONFIGS.map(c => c.name), intervalMs = DEFAULT_INTERVAL) {
  logger.info(`Scheduling scrapers for: ${retailers.join(', ')} every ${intervalMs / 60000}min`);
  for (const store of retailers) {
    scheduleScraper(store, intervalMs);
  }
}

export function scheduleScraper(store, intervalMs = DEFAULT_INTERVAL) {
  if (scheduledTimers.has(store)) clearInterval(scheduledTimers.get(store));
  const run = () => enqueueJob(store, { query: '', category: '', limit: 100 });
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
  for (const [store, timer] of scheduledTimers) {
    nextRuns[store] = { scheduled: true, running: runningJobs.has(store) };
  }
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
