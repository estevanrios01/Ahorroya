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
const TARGET_MASTER_PRODUCTS = Number(process.env.CATEGORY_BULK_TARGET_MASTER_PRODUCTS || 200000);
const PER_CATEGORY = Number(process.env.CATEGORY_BULK_PER_CATEGORY || 1200);
const MAX_CATEGORIES_PER_STORE = Number(process.env.CATEGORY_BULK_MAX_CATEGORIES || 80);
const START_CATEGORY = Number(process.env.CATEGORY_BULK_START_CATEGORY || 0);
const INCLUDE_PARENT_CATEGORIES = process.env.CATEGORY_BULK_INCLUDE_PARENTS === '1';
const STORES = (process.env.CATEGORY_BULK_STORES || 'exito,carulla,olimpica').split(',').map((s) => s.trim()).filter(Boolean);

const STORE_CONFIG = {
  exito: 'https://www.exito.com/api/catalog_system/pub/category/tree/3',
  carulla: 'https://www.carulla.com/api/catalog_system/pub/category/tree/3',
  olimpica: 'https://www.olimpica.com/api/catalog_system/pub/category/tree/3',
  jumbo: 'https://www.tiendasjumbo.co/api/catalog_system/pub/category/tree/3',
  metro: 'https://www.tiendasmetro.co/api/catalog_system/pub/category/tree/3',
  larebaja: 'https://www.larebajavirtual.com/api/catalog_system/pub/category/tree/3',
  colsubsidio: 'https://www.drogueriascolsubsidio.com/api/catalog_system/pub/category/tree/3',
  locatel: 'https://www.locatelcolombia.com/api/catalog_system/pub/category/tree/3',
  medipiel: 'https://www.medipiel.com.co/api/catalog_system/pub/category/tree/3',
  mercaldas: 'https://www.mercaldas.com/api/catalog_system/pub/category/tree/3',
  megatiendas: 'https://www.megatiendas.co/api/catalog_system/pub/category/tree/3',
  euro: 'https://www.eurosupermercados.com.co/api/catalog_system/pub/category/tree/3',
  blushbar: 'https://www.blush-bar.com/api/catalog_system/pub/category/tree/3',
  cromantic: 'https://www.cromantic.com/api/catalog_system/pub/category/tree/3',
  bellapiel: 'https://www.bellapiel.com.co/api/catalog_system/pub/category/tree/3',
  pasteur: 'https://www.farmaciaspasteur.com.co/api/catalog_system/pub/category/tree/3',
  easy: 'https://www.easy.com.co/api/catalog_system/pub/category/tree/3',
  miniso: 'https://www.miniso.co/api/catalog_system/pub/category/tree/3',
  velez: 'https://www.velez.com.co/api/catalog_system/pub/category/tree/3',
  pepeganga: 'https://www.pepeganga.com/api/catalog_system/pub/category/tree/3',
  panamericana: 'https://www.panamericana.com.co/api/catalog_system/pub/category/tree/3',
};

if (!SUPABASE_URL || !SERVICE_KEY) throw new Error('Faltan variables de Supabase');

async function countMasterProducts() {
  let lastError = null;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/master_products?select=id&limit=1`, {
        headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, Prefer: 'count=planned' },
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

async function getCategoryPaths(store) {
  const response = await fetchWithTimeout(STORE_CONFIG[store], 15000);
  if (!response.ok) throw new Error(`${store} category tree ${response.status}: ${await response.text()}`);
  const tree = await response.json();
  const paths = [];
  function walk(nodes, current = []) {
    for (const node of nodes || []) {
      const next = [...current, node.id];
      const category = { path: `/${next.join('/')}/`, name: node.name || String(node.id), level: next.length };
      if (INCLUDE_PARENT_CATEGORIES || !node.children?.length) paths.push(category);
      if (node.children?.length) walk(node.children, next);
    }
  }
  walk(tree);
  return paths;
}

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0 AhorroYaCategoryImporter/1.0' },
    });
  } finally {
    clearTimeout(timeout);
  }
}

function runImport(store, category) {
  const safeName = category.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
  const logDir = path.resolve(__dirname, '../logs');
  fs.mkdirSync(logDir, { recursive: true });
  const logPath = path.join(logDir, `category-${store}-${safeName || 'categoria'}.log`);
  const output = fs.openSync(logPath, 'a');
  const env = {
    ...process.env,
    VTEX_TARGET_PRODUCTS: String(PER_CATEGORY),
    VTEX_START_FROM: '0',
    VTEX_SEARCH: '',
    VTEX_CATEGORY_PATH: category.path,
    IMPORT_BATCH_SIZE: process.env.IMPORT_BATCH_SIZE || '40',
  };
  const result = spawnSync(process.execPath, ['scripts/import-vtex-catalog.js', store, String(PER_CATEGORY), '0', '', category.path], {
    cwd: path.resolve(__dirname, '..'),
    env,
    stdio: ['ignore', output, output],
  });
  fs.closeSync(output);
  return result.status === 0;
}

async function main() {
  let total = await countMasterProducts();
  console.log('Inicio bulk categorias VTEX:', {
    total,
    target: TARGET_MASTER_PRODUCTS,
    perCategory: PER_CATEGORY,
    startCategory: START_CATEGORY,
    maxCategoriesPerStore: MAX_CATEGORIES_PER_STORE,
    includeParentCategories: INCLUDE_PARENT_CATEGORIES,
    stores: STORES,
  });

  for (const store of STORES) {
    const allCategories = await getCategoryPaths(store);
    const categories = allCategories.slice(START_CATEGORY, START_CATEGORY + MAX_CATEGORIES_PER_STORE);
    console.log(`${store}: ${categories.length} categorias a importar de ${allCategories.length} disponibles (offset ${START_CATEGORY})`);
    for (const category of categories) {
      total = await countMasterProducts();
      if (total >= TARGET_MASTER_PRODUCTS) {
        console.log('Meta alcanzada:', { total, target: TARGET_MASTER_PRODUCTS });
        return;
      }
      console.log(`CATEGORY ${store} / ${category.name} / ${category.path} | total ${total}/${TARGET_MASTER_PRODUCTS}`);
      const ok = runImport(store, category);
      if (!ok) console.log(`Aviso: se salto categoria ${store}/${category.name}`);
    }
  }

  total = await countMasterProducts();
  console.log('Bulk categorias finalizado:', { total, target: TARGET_MASTER_PRODUCTS });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
