// Shared Supabase REST helpers used by the data-sync scripts under scripts/*.js.
//
// Consolidated from ~10 copy-pasted, drifted implementations (see the pipeline
// audit): several scripts had no retry logic at all and would hard-fail on
// transient errors (statement timeout, ECONNRESET, PostgREST schema-cache
// misses) that the others already retried. This is the single canonical
// version; scripts should require it instead of redefining these helpers.
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function loadEnv() {
  const envPath = path.resolve(__dirname, '../../.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#') || !line.includes('=')) continue;
    const index = line.indexOf('=');
    process.env[line.slice(0, index).trim()] ||= line.slice(index + 1).trim();
  }
}

function requireEnv() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SERVICE_KEY) throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  return { SUPABASE_URL, SERVICE_KEY };
}

const RETRYABLE = /PGRST002|schema cache|statement timeout|ECONNRESET|terminated|fetch failed/i;

async function rest(pathname, { method = 'GET', body, prefer = '', returnMinimal = false } = {}) {
  const { SUPABASE_URL, SERVICE_KEY } = requireEnv();
  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
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
      return returnMinimal || !text ? null : JSON.parse(text);
    } catch (error) {
      lastError = error;
      const retryable = RETRYABLE.test(String(error.message || error));
      if (!retryable || attempt === 3) break;
      await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
    }
  }
  throw lastError;
}

function defaultBatchSize() {
  return Number(process.env.IMPORT_BATCH_SIZE || 50);
}

async function upsertBatch(table, rows, onConflict, { returning = true, batchSize = defaultBatchSize() } = {}) {
  const out = [];
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const result = await rest(`${table}?on_conflict=${encodeURIComponent(onConflict)}&select=*`, {
      method: 'POST',
      body: batch,
      prefer: `resolution=merge-duplicates,return=${returning ? 'representation' : 'minimal'}`,
      returnMinimal: !returning,
    });
    if (Array.isArray(result)) out.push(...result);
    console.log(`${table}: ${Math.min(i + batchSize, rows.length)}/${rows.length}`);
  }
  return out;
}

async function insertBatch(table, rows, { batchSize = defaultBatchSize() } = {}) {
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    await rest(table, { method: 'POST', body: batch, prefer: 'return=minimal', returnMinimal: true });
    console.log(`${table}: ${Math.min(i + batchSize, rows.length)}/${rows.length}`);
  }
}

function slug(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 180);
}

function fixMojibake(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/\u00c3\u00a1/g, '\u00e1')
    .replace(/\u00c3\u00a9/g, '\u00e9')
    .replace(/\u00c3\u00ad/g, '\u00ed')
    .replace(/\u00c3\u00b3/g, '\u00f3')
    .replace(/\u00c3\u00ba/g, '\u00fa')
    .replace(/\u00c3\u00b1/g, '\u00f1')
    .replace(/\u00c3\u0081/g, '\u00c1')
    .replace(/\u00c3\u0089/g, '\u00c9')
    .replace(/\u00c3\u008d/g, '\u00cd')
    .replace(/\u00c3\u0093/g, '\u00d3')
    .replace(/\u00c3\u009a/g, '\u00da')
    .replace(/\u00c3\u0091/g, '\u00d1')
    .replace(/\u00c2/g, '')
    // Some retailers' own catalog feeds (Pasteur's confirmed live: "+++TABCIN...",
    // "++++TABCIN...") prefix names with internal tier/sort markers that leak
    // straight into the scraped name. A prior cycle cleaned this up directly in
    // the DB, but the next scrape just re-imported the same raw name and undid
    // it -- fixing it at the source here instead so it can't regress again.
    .replace(/^[\+\*"/\\|]+\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Each importer historically hashed its deterministic IDs under its own
// namespace prefix (ahorroya-vtex, ahorroya-ara, ahorroya-makro, ...).
// Keep that per-script by binding a namespace here rather than hardcoding
// one, so re-running an importer against existing rows still upserts
// instead of creating duplicates with a new UUID for the same source id.
function makeCryptoId(namespace) {
  return function cryptoId(input) {
    const hex = crypto.createHash('sha1').update(`${namespace}:${input}`).digest('hex').slice(0, 32).split('');
    hex[12] = '5';
    hex[16] = ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
    return `${hex.slice(0, 8).join('')}-${hex.slice(8, 12).join('')}-${hex.slice(12, 16).join('')}-${hex.slice(16, 20).join('')}-${hex.slice(20, 32).join('')}`;
  };
}

function numericEqual(left, right) {
  const a = left == null ? null : Number(left);
  const b = right == null ? null : Number(right);
  if (a == null && b == null) return true;
  return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) < 0.01;
}

// None of the importers had any anomaly detection on price changes -- a
// scraper misreading a price (decimal shift, wrong field) would write
// straight through with nothing flagging it. Non-blocking by design: this
// only logs, it never skips a write, so a real (if unusual) price change
// still lands. threshold=0.6 matches packages/pricing-engine's
// isPriceAnomaly, which already had a test suite for this exact rule.
function isPriceAnomaly(previous, current, threshold = 0.6) {
  if (!previous || !Number.isFinite(previous) || previous <= 0) return false;
  if (!Number.isFinite(current)) return false;
  return Math.abs(current - previous) / previous > threshold;
}

function logPriceAnomalies(changedListings, existingListings, label) {
  for (const row of changedListings) {
    const previous = existingListings.get(row.id)?.price;
    if (isPriceAnomaly(previous, row.price)) {
      console.warn(`[${label}] posible precio anómalo: ${previous} -> ${row.price} (sku ${row.sku || row.id})`);
    }
  }
}

module.exports = {
  loadEnv,
  requireEnv,
  rest,
  upsertBatch,
  insertBatch,
  slug,
  fixMojibake,
  makeCryptoId,
  numericEqual,
  isPriceAnomaly,
  logPriceAnomalies,
};
