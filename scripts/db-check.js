const fs = require('node:fs');
const path = require('node:path');

function loadEnv(file = '.env.local') {
  const fullPath = path.resolve(process.cwd(), file);
  if (!fs.existsSync(fullPath)) return {};
  return fs.readFileSync(fullPath, 'utf8').split(/\r?\n/).reduce((env, line) => {
    const match = line.match(/^\s*([^#=]+?)\s*=\s*(.*)\s*$/);
    if (!match) return env;
    env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    return env;
  }, {});
}

const env = { ...loadEnv(), ...process.env };
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const requiredTables = [
  'brands',
  'categories',
  'master_products',
  'stores',
  'branches',
  'store_products',
  'store_product_history',
  'product_images',
  'inventory',
  'baskets',
  'basket_items',
  'scraping_jobs',
  'scraping_runs',
  'analytics_events',
];

async function checkTable(table) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(env.DB_CHECK_TIMEOUT_MS || 2000));
  let response;
  try {
    response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=id&limit=1`, {
      signal: controller.signal,
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });
  } catch (error) {
    return {
      table,
      ok: false,
      status: 0,
      message: error.name === 'AbortError' ? 'request timeout' : error.message,
    };
  } finally {
    clearTimeout(timeout);
  }
  const body = await response.text();
  let payload;
  try {
    payload = body ? JSON.parse(body) : null;
  } catch {
    payload = body;
  }
  return {
    table,
    ok: response.ok,
    status: response.status,
    message: response.ok ? 'ok' : payload?.message || response.statusText,
  };
}

async function main() {
  if (!supabaseUrl || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or Supabase API key.');
    process.exit(1);
  }

  const results = [];
  for (const table of requiredTables) {
    results.push(await checkTable(table));
  }

  for (const result of results) {
    console.log(`${result.ok ? 'OK ' : 'ERR'} ${result.table}: ${result.status} ${result.message}`);
  }

  const missing = results.filter((result) => !result.ok);
  if (missing.length > 0) {
    console.error(`Database check failed: ${missing.length}/${results.length} tables are not reachable.`);
    process.exit(1);
  }

  console.log(`Database check passed: ${results.length}/${results.length} tables reachable.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
