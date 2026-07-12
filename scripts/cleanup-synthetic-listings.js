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

const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PAGE_SIZE = 1000;
const DELETE_BATCH = 100;
const headers = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' };

if (!BASE_URL || !SERVICE_KEY) throw new Error('Faltan variables de Supabase');

async function request(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}/rest/v1/${endpoint}`, { headers: { ...headers, ...(options.headers || {}) }, ...options });
  const text = await response.text();
  if (!response.ok) throw new Error(`${options.method || 'GET'} ${endpoint}: ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : null;
}

async function listSyntheticBatch(store) {
  const website = encodeURIComponent(store.website);
  const rows = await request(`store_products?select=id&store_id=eq.${store.id}&url=eq.${website}&limit=${PAGE_SIZE}`);
  return rows.map((row) => row.id);
}

async function removeBatch(ids) {
  for (let i = 0; i < ids.length; i += DELETE_BATCH) {
    const filter = `in.(${ids.slice(i, i + DELETE_BATCH).join(',')})`;
    await request(`store_product_history?store_product_id=${filter}`, { method: 'DELETE' });
    await request(`store_products?id=${filter}`, { method: 'DELETE' });
  }
}

async function main() {
  const stores = await request('stores?select=id,name,website&status=eq.active&website=not.is.null&limit=200');
  let removed = 0;
  for (const store of stores) {
    let storeRemoved = 0;
    for (;;) {
      const ids = await listSyntheticBatch(store);
      if (!ids.length) break;
      await removeBatch(ids);
      removed += ids.length;
      storeRemoved += ids.length;
      if (removed % 10000 < PAGE_SIZE) console.log(`Listados sintéticos retirados: ${removed}`);
    }
    if (storeRemoved) console.log(`${store.name}: ${storeRemoved} listados no verificables retirados`);
  }
  console.log(JSON.stringify({ storesScanned: stores.length, removed }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
