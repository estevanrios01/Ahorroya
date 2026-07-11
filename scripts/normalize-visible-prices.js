const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env.local');
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#') || !line.includes('=')) continue;
    const index = line.indexOf('=');
    process.env[line.slice(0, index).trim()] ||= line.slice(index + 1).trim();
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PRODUCT_LIMIT = Number(process.env.NORMALIZE_PRICE_PRODUCTS || 600);
const BATCH_SIZE = Number(process.env.NORMALIZE_PRICE_BATCH || 100);

if (!SUPABASE_URL || !SERVICE_KEY) throw new Error('Faltan variables de Supabase');

async function rest(pathname, { method = 'GET', body, prefer = '' } = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${pathname}`, {
    method,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: body == null ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${method} ${pathname}: ${text}`);
  return text ? JSON.parse(text) : null;
}

function estimatePrice(name) {
  const rules = [
    [/ensure|panal|huggies|winny/i, 52000],
    [/shampoo|papel higienico|dog chow|chunky|whiskas|arena sanitaria/i, 26000],
    [/carne|pechuga|pollo|jamon|helado|pizza|nuggets|cafe/i, 18500],
    [/aceite|huevos|detergente|suavizante|vitamina|tapabocas|suero/i, 13500],
    [/ques|mantequilla|atun|sardina|chocolate|coca|pony/i, 8500],
    [/leche|yogurt|kumis|pan|galleta|pasta|arroz|azucar|avena|frijol|lenteja/i, 5200],
    [/agua|sal|banano|papa|tomate|cebolla|zanahoria|compota/i, 3200],
  ];
  return rules.find(([regex]) => regex.test(name))?.[1] || 6500;
}

function sanePrice(base, rowId) {
  const seed = parseInt(rowId.slice(0, 2), 16);
  const variance = 0.82 + (seed % 38) / 100;
  return Math.max(500, Math.round((base * variance) / 50) * 50);
}

async function fetchListings(productId) {
  const rows = [];
  for (let offset = 0; ; offset += 1000) {
    const batch = await rest(`store_products?select=id,price,original_price&master_product_id=eq.${productId}&limit=1000&offset=${offset}`);
    rows.push(...(batch || []));
    if (!batch || batch.length < 1000) break;
  }
  return rows;
}

async function patchBatch(rows) {
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map((row) => rest(`store_products?id=eq.${row.id}`, {
      method: 'PATCH',
      body: {
        price: row.price,
        original_price: row.original_price,
        updated_at: new Date().toISOString(),
      },
      prefer: 'return=minimal',
    })));
  }
}

async function main() {
  const products = await rest(`master_products?select=id,name,slug&status=eq.active&order=name.asc&limit=${PRODUCT_LIMIT}`);
  let checked = 0;
  let updated = 0;

  for (const product of products || []) {
    const base = estimatePrice(product.name);
    const min = base * 0.45;
    const max = base * 1.85;
    const listings = await fetchListings(product.id);
    const fixes = listings
      .filter((row) => Number(row.price) < min || Number(row.price) > max)
      .map((row) => {
        const price = sanePrice(base, row.id);
        return {
          id: row.id,
          price,
          original_price: price % 3 === 0 ? Math.round((price * 1.08) / 50) * 50 : null,
        };
      });
    checked += listings.length;
    updated += fixes.length;
    if (fixes.length) await patchBatch(fixes);
  }

  console.log({ products: products.length, checked, updated });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
