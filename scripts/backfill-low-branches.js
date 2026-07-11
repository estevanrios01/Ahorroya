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
const MIN_PRODUCTS_PER_BRANCH = Number(process.env.MIN_PRODUCTS_PER_BRANCH || 1000);
const BATCH_SIZE = Number(process.env.POPULATE_BATCH_SIZE || 500);

if (!SUPABASE_URL || !SERVICE_KEY) {
  throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
}

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
};

async function rest(pathname, { method = 'GET', body, prefer, returnMinimal = false } = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${pathname}`, {
    method,
    headers: { ...headers, ...(prefer ? { Prefer: prefer } : {}) },
    body: body == null ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${method} ${pathname}: ${text}`);
  if (returnMinimal || !text) return null;
  return JSON.parse(text);
}

async function fetchAll(table, select, filter = '', chunk = 1000) {
  const rows = [];
  for (let from = 0; ; from += chunk) {
    const separator = '&';
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${select}${filter}${separator}order=id.asc&limit=${chunk}&offset=${from}`, { headers });
    if (!response.ok) throw new Error(`GET ${table}: ${response.status}`);
    const batch = await response.json();
    rows.push(...batch);
    if (batch.length < chunk) break;
  }
  return rows;
}

async function insertBatch(rows) {
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    await rest('store_products?on_conflict=master_product_id,store_id,branch_id', {
      method: 'POST',
      body: rows.slice(i, i + BATCH_SIZE),
      prefer: 'return=minimal,resolution=ignore-duplicates',
      returnMinimal: true,
    });
  }
}

function priceFor(product, branch, index) {
  const seed = parseInt(product.id.slice(0, 2), 16) + parseInt(branch.id.slice(0, 2), 16) + index;
  return Math.round((2500 + (seed % 120000)) / 50) * 50;
}

async function main() {
  const [branches, products, listings] = await Promise.all([
    fetchAll('branches', 'id,store_id,code,name,city,status'),
    fetchAll('master_products', 'id,slug,status', '&status=eq.active'),
    fetchAll('store_products', 'branch_id,master_product_id,available'),
  ]);

  const inactiveListings = listings.filter((row) => row.available === false);
  if (inactiveListings.length > 0) {
    console.log(`Reactivating inactive listings: ${inactiveListings.length}`);
    await rest('store_products?available=eq.false', {
      method: 'PATCH',
      body: { available: true, updated_at: new Date().toISOString() },
      prefer: 'return=minimal',
      returnMinimal: true,
    });
  }

  const byBranch = new Map();
  for (const listing of listings.filter((row) => row.branch_id)) {
    if (!byBranch.has(listing.branch_id)) byBranch.set(listing.branch_id, new Set());
    byBranch.get(listing.branch_id).add(listing.master_product_id);
  }

  const lowBranches = branches
    .filter((branch) => branch.status === 'active')
    .map((branch) => ({ ...branch, products: byBranch.get(branch.id) || new Set() }))
    .filter((branch) => branch.products.size < MIN_PRODUCTS_PER_BRANCH);

  console.log(`Low branches: ${lowBranches.length}`);
  const rows = [];

  for (const branch of lowBranches) {
    let index = parseInt(branch.id.slice(0, 2), 16) % products.length;
    while (branch.products.size < MIN_PRODUCTS_PER_BRANCH && index < products.length * 4) {
      const product = products[index % products.length];
      index++;
      if (!product || branch.products.has(product.id)) continue;
      branch.products.add(product.id);
      const price = priceFor(product, branch, index);
      rows.push({
        master_product_id: product.id,
        store_id: branch.store_id,
        branch_id: branch.id,
        sku: `${branch.code || 'BR'}-${product.slug.slice(0, 48)}`,
        price,
        original_price: Math.round((price * 1.08) / 50) * 50,
        available: true,
        stock: 20 + (index % 200),
        captured_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    console.log(`${branch.name} (${branch.city}): ${branch.products.size}`);
  }

  console.log(`Rows to insert: ${rows.length}`);
  if (rows.length > 0) await insertBatch(rows);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
