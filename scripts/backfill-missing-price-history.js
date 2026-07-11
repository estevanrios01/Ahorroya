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
const BATCH_SIZE = Number(process.env.HISTORY_BATCH_SIZE || 1000);

if (!SUPABASE_URL || !SERVICE_KEY) {
  throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
}

async function insertPage(after) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/backfill_missing_price_history_page`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ p_after: after || null, p_limit: BATCH_SIZE }),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`RPC backfill_missing_price_history_page: ${text}`);
  return JSON.parse(text);
}

async function main() {
  let total = 0;
  let cursor = process.env.HISTORY_START_AFTER || null;
  for (let iteration = 1; ; iteration++) {
    const result = await insertPage(cursor);
    const inserted = Number(result.inserted || 0);
    const scanned = Number(result.scanned || 0);
    cursor = result.nextCursor || null;
    total += inserted;
    console.log(`Page ${iteration}: scanned ${scanned}, inserted ${inserted}, total ${total}, cursor ${cursor || 'end'}`);
    if (scanned === 0 || !cursor) break;
  }
  console.log(`Missing price history inserted: ${total}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
