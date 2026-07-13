const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#') || !line.includes('=')) continue;
    const index = line.indexOf('=');
    process.env[line.slice(0, index).trim()] ||= line.slice(index + 1).trim();
  }
}

loadEnv();

const WRITE_ENABLED = process.env.REAL_CATALOG_IMPORT === '1';
const PRODUCTS_PER_STORE = Math.max(1, Math.min(Number(process.env.REAL_PRODUCTS_PER_STORE || 2000), 2500));
const VTEX_STORES = (process.env.REAL_VTEX_STORES || [
  'exito',
  'carulla',
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
].join(','))
  .split(',')
  .map((store) => store.trim())
  .filter(Boolean);

const tasks = [
  ...VTEX_STORES.map((store) => ({
    label: `VTEX ${store}`,
    script: 'scripts/import-vtex-catalog.js',
    args: [store, String(PRODUCTS_PER_STORE), '0', ''],
  })),
  { label: 'Olimpica', script: 'scripts/import-olimpica-catalog.js', args: [] },
  { label: 'Makro', script: 'scripts/import-makro-offers.js', args: [] },
  { label: 'Farmatodo', script: 'scripts/import-farmatodo-algolia.js', args: [] },
  { label: 'Ara', script: 'scripts/import-ara-offers.js', args: [] },
];

function runTask(task) {
  const env = {
    ...process.env,
    IMPORT_SKIP_PRICE_HISTORY: '1',
    IMPORT_SKIP_PRODUCT_IMAGES: '0',
    IMPORT_BATCH_SIZE: process.env.IMPORT_BATCH_SIZE || '25',
    VTEX_TARGET_PRODUCTS: String(PRODUCTS_PER_STORE),
    OLIMPICA_TARGET_PRODUCTS: String(PRODUCTS_PER_STORE),
  };
  const result = spawnSync(process.execPath, [task.script, ...task.args], {
    cwd: path.resolve(__dirname, '..'),
    env,
    encoding: 'utf8',
    timeout: Number(process.env.REAL_IMPORT_TIMEOUT_MS || 600000),
    maxBuffer: 8 * 1024 * 1024,
  });

  const output = `${result.stdout || ''}\n${result.stderr || ''}`.trim();
  if (output) console.log(output);
  return { label: task.label, ok: result.status === 0 && !result.error, error: result.error?.message || null };
}

function main() {
  const plan = {
    mode: WRITE_ENABLED ? 'write' : 'dry-run',
    sourcePolicy: 'official-retailer-sources-only',
    priceHistory: 'disabled-for-initial-import',
    productsPerStore: PRODUCTS_PER_STORE,
    tasks: tasks.map((task) => task.label),
  };
  console.log(JSON.stringify(plan, null, 2));

  if (!WRITE_ENABLED) {
    console.log('Vista previa completada. Usa REAL_CATALOG_IMPORT=1 solo cuando Supabase tenga espacio y responda saludablemente.');
    return;
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  }

  const results = tasks.map(runTask);
  const failed = results.filter((result) => !result.ok);
  console.log(JSON.stringify({ completed: results.length - failed.length, failed }, null, 2));
  if (failed.length === results.length) process.exitCode = 1;
}

main();
