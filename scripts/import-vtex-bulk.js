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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TARGET_MASTER_PRODUCTS = Number(process.env.BULK_TARGET_MASTER_PRODUCTS || 200000);
const PER_TERM = Number(process.env.BULK_PER_TERM || 500);
const STORES = (process.env.BULK_STORES || 'exito,carulla,olimpica').split(',').map((s) => s.trim()).filter(Boolean);

const DEFAULT_TERMS = [
  'a', 'e', 'i', 'o', 'u',
  'al', 'ar', 'as', 'az', 'ba', 'be', 'bi', 'bo', 'ca', 'ce', 'ch', 'co', 'cu',
  'de', 'di', 'do', 'du', 'el', 'en', 'es', 'fr', 'ga', 'ge', 'go', 'ha', 'he',
  'ja', 'ju', 'la', 'le', 'li', 'lo', 'ma', 'me', 'mi', 'mo', 'na', 'ne', 'pa',
  'pe', 'pi', 'po', 'pr', 'qu', 'ra', 're', 'ri', 'ro', 'sa', 'se', 'si', 'so',
  'ta', 'te', 'ti', 'to', 'tr', 'va', 've', 'vi', 'ya', 'za',
  'arroz', 'aceite', 'leche', 'queso', 'yogurt', 'pan', 'huevos', 'pollo',
  'res', 'cerdo', 'pescado', 'atun', 'pasta', 'salsa', 'galleta', 'cereal',
  'agua', 'jugo', 'gaseosa', 'cerveza', 'vino', 'cafe', 'chocolate', 'azucar',
  'sal', 'harina', 'avena', 'frijol', 'lenteja', 'maiz', 'tomate', 'papa',
  'cebolla', 'zanahoria', 'manzana', 'banano', 'limon', 'naranja', 'mango',
  'detergente', 'jabon', 'shampoo', 'desodorante', 'crema', 'papel',
  'panal', 'toalla', 'limpiador', 'desinfectante', 'mascota', 'perro', 'gato',
];

const TERMS = (process.env.BULK_TERMS
  ? process.env.BULK_TERMS.split(',')
  : DEFAULT_TERMS).map((term) => term.trim()).filter(Boolean);

if (!SUPABASE_URL || !SERVICE_KEY) throw new Error('Faltan variables de Supabase');

async function countMasterProducts() {
  let lastError = null;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/master_products?select=id&limit=1`, {
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          Prefer: 'count=planned',
        },
      });
      if (!response.ok) throw new Error(await response.text());
      const range = response.headers.get('content-range') || '0-0/0';
      return Number(range.split('/')[1] || 0);
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
    }
  }
  throw lastError;
}

function runImport(store, term) {
  const env = {
    ...process.env,
    VTEX_TARGET_PRODUCTS: String(PER_TERM),
    VTEX_START_FROM: '0',
    VTEX_SEARCH: term,
  };
  const result = spawnSync(process.execPath, ['scripts/import-vtex-catalog.js', store, String(PER_TERM), '0', term], {
    cwd: path.resolve(__dirname, '..'),
    env,
    stdio: 'inherit',
  });
  return result.status === 0;
}

async function main() {
  let total = await countMasterProducts();
  console.log('Inicio bulk VTEX:', { total, target: TARGET_MASTER_PRODUCTS, perTerm: PER_TERM, stores: STORES });

  for (const term of TERMS) {
    for (const store of STORES) {
      total = await countMasterProducts();
      if (total >= TARGET_MASTER_PRODUCTS) {
        console.log('Meta alcanzada:', { total, target: TARGET_MASTER_PRODUCTS });
        return;
      }
      console.log(`\n=== Bulk ${store} / ${term} | total actual ${total}/${TARGET_MASTER_PRODUCTS} ===`);
      const ok = runImport(store, term);
      if (!ok) console.log(`Bulk aviso: se salto ${store}/${term} por error del origen o limite.`);
    }
  }

  total = await countMasterProducts();
  console.log('Bulk finalizado:', { total, target: TARGET_MASTER_PRODUCTS });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
