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

if (!SUPABASE_URL || !SERVICE_KEY) throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');

async function rest(pathname, prefer = '') {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${pathname}`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      ...(prefer ? { Prefer: prefer } : {}),
    },
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${pathname}: ${text}`);
  return { data: text ? JSON.parse(text) : null, range: response.headers.get('content-range') };
}

async function count(filter, label, branchFilter = '') {
  const prefix = branchFilter ? `${branchFilter}&` : '';
  const { range } = await rest(`store_products?select=id&${prefix}${filter}&limit=1`, 'count=planned');
  const value = Number((range || '0-0/0').split('/')[1] || 0);
  return { label, value };
}

async function main() {
  const latest = await rest('store_products?select=captured_at,stores(name,slug),branches(name,city)&order=captured_at.desc&limit=10');
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  const stats = [
    await count('available=eq.true', 'prices_available_total'),
    await count('available=eq.true', 'online_prices_available', 'branch_id=is.null'),
    await count('available=eq.true', 'branch_prices_available', 'branch_id=not.is.null'),
    await count(`captured_at=gte.${oneHourAgo}`, 'updated_last_hour'),
    await count(`captured_at=gte.${sixHoursAgo}`, 'updated_last_6h'),
    await count(`captured_at=gte.${dayAgo}`, 'updated_last_24h'),
  ];

  console.log(JSON.stringify({
    checkedAt: now.toISOString(),
    stats: Object.fromEntries(stats.map((item) => [item.label, item.value])),
    latest: latest.data,
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
