const { spawnSync } = require('child_process');
const path = require('path');

const DEFAULT_STORES = [
  'exito',
  'carulla',
  'olimpica',
  'jumbo',
  'metro',
  'mercaldas',
  'megatiendas',
  'euro',
  'larebaja',
  'colsubsidio',
  'locatel',
  'medipiel',
  'bellapiel',
  'pasteur',
];

const DEFAULT_TERMS = [
  'arroz',
  'aceite',
  'leche',
  'huevos',
  'pollo',
  'atun',
  'pasta',
  'cafe',
  'azucar',
  'pan',
  'queso',
  'yogurt',
  'gaseosa',
  'agua',
  'detergente',
  'jabon',
  'shampoo',
  'desodorante',
  'papel',
  'panal',
  'toalla',
  'acetaminofen',
  'ibuprofeno',
  'vitamina',
  'crema',
  'protector',
  'perro',
  'gato',
];

function listFromEnv(name, fallback) {
  return (process.env[name] ? process.env[name].split(',') : fallback)
    .map((item) => item.trim())
    .filter(Boolean);
}

function pickRotatingTerms(terms, perRun) {
  const now = new Date();
  const wave = Number(process.env.LIVE_SYNC_WAVE || Math.floor((now.getUTCHours() * 60 + now.getUTCMinutes()) / 15));
  const start = (wave * perRun) % terms.length;
  return Array.from({ length: perRun }, (_, index) => terms[(start + index) % terms.length]);
}

function runImport(store, term) {
  const env = {
    ...process.env,
    VTEX_STORE: store,
    VTEX_SEARCH: term,
    VTEX_CATEGORY_PATH: '',
    VTEX_START_FROM: '0',
    VTEX_TARGET_PRODUCTS: process.env.LIVE_SYNC_PRODUCTS_PER_TERM || '250',
    IMPORT_BATCH_SIZE: process.env.LIVE_SYNC_BATCH_SIZE || '20',
    IMPORT_SKIP_PRODUCT_IMAGES: process.env.LIVE_SYNC_SKIP_IMAGES || '1',
    IMPORT_SKIP_PRICE_HISTORY: '0',
  };

  if (process.env.LIVE_SYNC_ALLOW_INSECURE_TLS === '1') {
    env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  const started = Date.now();
  const result = spawnSync(process.execPath, ['scripts/import-vtex-catalog.js', store, env.VTEX_TARGET_PRODUCTS, '0', term], {
    cwd: path.resolve(__dirname, '..'),
    env,
    encoding: 'utf8',
    timeout: Number(process.env.LIVE_SYNC_IMPORT_TIMEOUT_MS || 180000),
    maxBuffer: 1024 * 1024 * 4,
  });

  const output = `${result.stdout || ''}\n${result.stderr || ''}`;
  const match = output.match(/priceEvents:\s*(?:'skipped'|(\d+))/);
  const priceEvents = match?.[1] ? Number(match[1]) : 0;
  const ok = result.status === 0 && !result.error;

  console.log(JSON.stringify({
    store,
    term,
    ok,
    status: result.status,
    durationMs: Date.now() - started,
    priceEvents,
    error: result.error?.message || null,
  }));

  if (!ok) {
    const tail = output.slice(-1200);
    console.error(tail);
  }

  return { ok, priceEvents };
}

function main() {
  const stores = listFromEnv('LIVE_SYNC_STORES', DEFAULT_STORES);
  const terms = listFromEnv('LIVE_SYNC_TERMS', DEFAULT_TERMS);
  const termsPerRun = Number(process.env.LIVE_SYNC_TERMS_PER_RUN || 4);
  const selectedTerms = pickRotatingTerms(terms, termsPerRun);
  const started = Date.now();

  console.log('AhorroYa live price sync start', {
    stores,
    selectedTerms,
    productsPerTerm: process.env.LIVE_SYNC_PRODUCTS_PER_TERM || '250',
  });

  let failed = 0;
  let priceEvents = 0;
  for (const term of selectedTerms) {
    for (const store of stores) {
      const result = runImport(store, term);
      if (!result.ok) failed++;
      priceEvents += result.priceEvents;
    }
  }

  console.log('AhorroYa live price sync complete', {
    stores: stores.length,
    terms: selectedTerms.length,
    failed,
    priceEvents,
    durationSeconds: Math.round((Date.now() - started) / 1000),
  });

  if (failed === stores.length * selectedTerms.length) process.exitCode = 1;
}

main();
