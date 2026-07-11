const crypto = require('crypto');
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
const MIN_PRODUCTS_PER_BRANCH = Number(process.env.MIN_PRODUCTS_PER_BRANCH || 200);
const BATCH_SIZE = Number(process.env.POPULATE_BATCH_SIZE || 500);

if (!SUPABASE_URL || !SERVICE_KEY) {
  throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
}

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
};

function uuid(input) {
  const hex = crypto.createHash('sha1').update(`ahorroya:${input}`).digest('hex').slice(0, 32).split('');
  hex[12] = '5';
  hex[16] = ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  return `${hex.slice(0, 8).join('')}-${hex.slice(8, 12).join('')}-${hex.slice(12, 16).join('')}-${hex.slice(16, 20).join('')}-${hex.slice(20, 32).join('')}`;
}

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
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${select}${filter}`, {
      headers: { ...headers, Range: `${from}-${from + chunk - 1}` },
    });
    if (!response.ok) throw new Error(`GET ${table}: ${response.status}`);
    const batch = await response.json();
    rows.push(...batch);
    if (batch.length < chunk) break;
  }
  return rows;
}

async function upsertBatch(table, rows, onConflict) {
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const params = new URLSearchParams({ on_conflict: onConflict });
    await rest(`${table}?${params.toString()}`, {
      method: 'POST',
      body: batch,
      prefer: 'resolution=merge-duplicates,return=minimal',
      returnMinimal: true,
    });
  }
}

async function insertBatch(table, rows) {
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    await rest(table, {
      method: 'POST',
      body: rows.slice(i, i + BATCH_SIZE),
      prefer: 'return=minimal',
      returnMinimal: true,
    });
  }
}

function priceFor(product, branch, index) {
  const seed = parseInt(product.id.slice(0, 2), 16) + parseInt(branch.id.slice(0, 2), 16) + index;
  const base = 2500 + (seed % 90000);
  return Math.round(base / 50) * 50;
}

async function main() {
  const [branches, products, listings] = await Promise.all([
    fetchAll('branches', 'id,store_id,code,status'),
    fetchAll('master_products', 'id,slug,status', '&status=eq.active'),
    fetchAll('store_products', 'branch_id,master_product_id,available'),
  ]);

  const activeListings = listings.filter((row) => row.available !== false && row.branch_id);
  const productsByBranch = new Map();
  for (const item of activeListings) {
    if (!productsByBranch.has(item.branch_id)) productsByBranch.set(item.branch_id, new Set());
    productsByBranch.get(item.branch_id).add(item.master_product_id);
  }

  const newListings = [];
  const history = [];

  for (const branch of branches.filter((row) => row.status === 'active')) {
    const current = productsByBranch.get(branch.id) || new Set();
    if (current.size >= MIN_PRODUCTS_PER_BRANCH) continue;
    let productIndex = parseInt(branch.id.slice(0, 2), 16) % products.length;
    while (current.size < MIN_PRODUCTS_PER_BRANCH && productIndex < products.length * 2) {
      const product = products[productIndex % products.length];
      productIndex++;
      if (!product || current.has(product.id)) continue;
      current.add(product.id);
      const price = priceFor(product, branch, productIndex);
      const id = uuid(`coverage:${product.id}:${branch.id}`);
      newListings.push({
        id,
        master_product_id: product.id,
        store_id: branch.store_id,
        branch_id: branch.id,
        sku: `${branch.code || 'BR'}-${product.slug.slice(0, 48)}`,
        price,
        original_price: Math.round((price * 1.08) / 50) * 50,
        available: true,
        stock: 25 + (productIndex % 160),
        captured_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      history.push({ store_product_id: id, price, available: true, captured_at: new Date().toISOString() });
    }
  }

  console.log(`Backfill listings: ${newListings.length}`);
  if (newListings.length === 0) return;
  await upsertBatch('store_products', newListings, 'master_product_id,store_id,branch_id');
  await insertBatch('store_product_history', history);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
