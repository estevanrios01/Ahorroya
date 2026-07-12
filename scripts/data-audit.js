const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#') || !line.includes('=')) continue;
    const [key, ...rest] = line.split('=');
    if (!process.env[key]) process.env[key] = rest.join('=').trim();
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PAGE_SIZE = Number(process.env.AUDIT_PAGE_SIZE || 1000);

if (!SUPABASE_URL || !SERVICE_KEY) {
  throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
}

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
};

async function count(table, filter = '') {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=id&limit=1${filter}`, {
    method: 'GET',
    headers: { ...headers, Prefer: 'count=planned' },
  });
  if (!response.ok) throw new Error(`No se pudo contar ${table}: ${response.status}`);
  const range = response.headers.get('content-range') || '0-0/0';
  return Number(range.split('/')[1] || 0);
}

async function getJson(pathname) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${pathname}`, { headers });
  const text = await response.text();
  if (!response.ok) throw new Error(`GET ${pathname}: ${text}`);
  return text ? JSON.parse(text) : [];
}

async function fetchAllSmall(table, select) {
  const rows = [];
  let lastId = '';
  for (;;) {
    const cursor = lastId ? `&id=gt.${lastId}` : '';
    const batch = await getJson(`${table}?select=${select}${cursor}&order=id.asc&limit=${PAGE_SIZE}`);
    rows.push(...batch);
    if (batch.length < PAGE_SIZE) break;
    lastId = batch[batch.length - 1].id;
  }
  return rows;
}

async function scanActivePrices() {
  const productsWithPrices = new Set();
  const perBranch = new Map();
  let lastId = '';
  let scanned = 0;

  for (;;) {
    const cursor = lastId ? `&id=gt.${lastId}` : '';
    const batch = await getJson(`store_products?select=id,branch_id,master_product_id,available${cursor}&available=eq.true&branch_id=not.is.null&order=id.asc&limit=${PAGE_SIZE}`);
    for (const row of batch) {
      if (row.master_product_id) productsWithPrices.add(row.master_product_id);
      if (row.branch_id) perBranch.set(row.branch_id, (perBranch.get(row.branch_id) || 0) + 1);
    }
    scanned += batch.length;
    if (scanned % 100000 === 0) console.log(`Scanned active prices: ${scanned}`);
    if (batch.length < PAGE_SIZE) break;
    lastId = batch[batch.length - 1].id;
  }

  return { productsWithPrices: productsWithPrices.size, perBranch };
}

async function main() {
  const [brands, categories, products, stores, branches, prices, history, images, branchRows] = await Promise.all([
    count('brands'),
    count('categories'),
    count('master_products'),
    count('stores'),
    count('branches'),
    count('store_products'),
    count('store_product_history'),
    count('product_images'),
    fetchAllSmall('branches', 'id,city,department,store_id,status'),
  ]);

  const activeBranches = branchRows.filter((row) => row.status === 'active');
  const activePriceRows = await count('store_products', '&available=eq.true');
  let productsWithPrices = null;
  let perBranch = new Map();
  let coverageMode = 'planned';

  if (process.env.AUDIT_FULL_PRICE_SCAN === '1') {
    const scanned = await scanActivePrices();
    productsWithPrices = scanned.productsWithPrices;
    perBranch = scanned.perBranch;
    coverageMode = 'full-scan';
  }

  const cityCount = new Set(activeBranches.map((row) => row.city).filter(Boolean)).size;
  const departmentCount = new Set(activeBranches.map((row) => row.department).filter(Boolean)).size;
  const countsByBranch = activeBranches.map((row) => perBranch.get(row.id) || 0);
  const branchesBelow100 = coverageMode === 'full-scan' ? countsByBranch.filter((count) => count < 100).length : null;
  const branchesBelow200 = coverageMode === 'full-scan' ? countsByBranch.filter((count) => count < 200).length : null;

  const report = {
    brands,
    categories,
    products,
    stores,
    branches,
    prices,
    activePriceRows,
    productsWithPrices,
    history,
    images,
    cities: cityCount,
    departments: departmentCount,
    coverageMode,
    branchesBelow100,
    branchesBelow200,
    minProductsPerBranch: coverageMode === 'full-scan' ? Math.min(...countsByBranch) : null,
    maxProductsPerBranch: coverageMode === 'full-scan' ? Math.max(...countsByBranch) : null,
  };

  console.log(JSON.stringify(report, null, 2));

  const failures = [];
  if (branches < 300) failures.push('branches < 300');
  if (products < 1000) failures.push('products < 1000');
  if (coverageMode === 'full-scan' && productsWithPrices < 3000) failures.push('productsWithPrices < 3000');
  if (stores < 15) failures.push('stores < 15');
  if (activePriceRows < 300000) failures.push('activePriceRows < 300000');
  if (cityCount < 35) failures.push('cities < 35');
  if (coverageMode === 'full-scan' && branchesBelow100 > 0) failures.push(`${branchesBelow100} branches below 100 products`);

  if (failures.length > 0) {
    console.error(`Data audit failed: ${failures.join(', ')}`);
    process.exit(1);
  }

  console.log('Data audit passed.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
