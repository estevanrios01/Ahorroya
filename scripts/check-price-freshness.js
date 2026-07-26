const { loadEnv } = require('./lib/supabase-rest');

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');

// Distinct from lib/supabase-rest's rest(): this diagnostic script needs the
// Content-Range header for counts, which the shared helper doesn't expose.
async function rest(pathname, prefer = '') {
  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
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
    } catch (error) {
      lastError = error;
      const retryable = /PGRST002|schema cache|statement timeout|ECONNRESET|terminated|fetch failed/i.test(String(error.message || error));
      if (!retryable || attempt === 3) break;
      await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
    }
  }
  throw lastError;
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
