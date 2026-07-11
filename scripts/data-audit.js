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

if (!SUPABASE_URL || !SERVICE_KEY) {
  throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
}

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
};

async function count(table, filter = '') {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*${filter}`, {
    method: 'HEAD',
    headers: { ...headers, Prefer: 'count=exact' },
  });
  if (!response.ok) throw new Error(`No se pudo contar ${table}: ${response.status}`);
  const range = response.headers.get('content-range') || '0-0/0';
  return Number(range.split('/')[1] || 0);
}

async function fetchAll(table, select, chunk = 1000) {
  const rows = [];
  for (let from = 0; ; from += chunk) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${select}&order=id.asc&limit=${chunk}&offset=${from}`, { headers });
    if (!response.ok) throw new Error(`No se pudo consultar ${table}: ${response.status}`);
    const batch = await response.json();
    rows.push(...batch);
    if (batch.length < chunk) break;
  }
  return rows;
}

async function main() {
  const [brands, categories, products, stores, branches, prices, history, images] = await Promise.all([
    count('brands'),
    count('categories'),
    count('master_products'),
    count('stores'),
    count('branches'),
    count('store_products'),
    count('store_product_history'),
    count('product_images'),
  ]);

  const branchRows = await fetchAll('branches', 'id,city,department,store_id,status');
  const priceRows = await fetchAll('store_products', 'branch_id,master_product_id,available');
  const activePrices = priceRows.filter((row) => row.available !== false && row.branch_id);
  const productsWithPrices = new Set(activePrices.map((row) => row.master_product_id).filter(Boolean)).size;
  const perBranch = new Map();
  for (const row of activePrices) {
    perBranch.set(row.branch_id, (perBranch.get(row.branch_id) || 0) + 1);
  }

  const activeBranches = branchRows.filter((row) => row.status === 'active');
  const cityCount = new Set(activeBranches.map((row) => row.city).filter(Boolean)).size;
  const departmentCount = new Set(activeBranches.map((row) => row.department).filter(Boolean)).size;
  const branchesBelow100 = activeBranches.filter((row) => (perBranch.get(row.id) || 0) < 100);
  const branchesBelow200 = activeBranches.filter((row) => (perBranch.get(row.id) || 0) < 200);

  const report = {
    brands,
    categories,
    products,
    stores,
    branches,
    prices,
    productsWithPrices,
    history,
    images,
    cities: cityCount,
    departments: departmentCount,
    branchesBelow100: branchesBelow100.length,
    branchesBelow200: branchesBelow200.length,
    minProductsPerBranch: Math.min(...activeBranches.map((row) => perBranch.get(row.id) || 0)),
    maxProductsPerBranch: Math.max(...activeBranches.map((row) => perBranch.get(row.id) || 0)),
  };

  console.log(JSON.stringify(report, null, 2));

  const failures = [];
  if (branches < 300) failures.push('branches < 300');
  if (products < 1000) failures.push('products < 1000');
  if (productsWithPrices < 1000) failures.push('productsWithPrices < 1000');
  if (stores < 15) failures.push('stores < 15');
  if (prices < 100000) failures.push('prices < 100000');
  if (cityCount < 35) failures.push('cities < 35');
  if (branchesBelow100.length > 0) failures.push(`${branchesBelow100.length} branches below 100 products`);

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
