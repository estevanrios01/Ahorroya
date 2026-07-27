// KNOWN LIMITATION: this Map lives in the memory of whichever
// serverless/edge instance handles a given request. proxy.js runs on
// multiple concurrent instances (by design, for scale), each with its own
// separate copy of this Map -- there is no shared state between them. So
// MAX_REQUESTS is actually "N requests/minute per IP per instance", not a
// true global limit: under a real traffic spike, Vercel spins up more
// instances and the same IP can get MAX_REQUESTS on each of them
// simultaneously. A real global limit needs a shared store (e.g. Upstash
// Redis) -- deliberately not adding that here, since it's a paid add-on and
// the project's explicit instruction is not to introduce paid services
// without asking first. This in-memory limiter still stops a single
// runaway client hammering one warm instance; it just isn't a hard ceiling
// under a large, distributed spike.
const rateMap = new Map();

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 60;
const CLEANUP_INTERVAL = 5 * 60 * 1000;

function cleanup() {
  const cutoff = Date.now() - WINDOW_MS;
  for (const [ip, timestamps] of rateMap) {
    const active = timestamps.filter(t => t > cutoff);
    if (active.length === 0) rateMap.delete(ip);
    else rateMap.set(ip, active);
  }
}

setInterval(cleanup, CLEANUP_INTERVAL);

export function rateLimit(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  if (!rateMap.has(ip)) {
    rateMap.set(ip, []);
  }

  const timestamps = rateMap.get(ip).filter(t => t > windowStart);
  timestamps.push(now);
  rateMap.set(ip, timestamps);

  if (timestamps.length > MAX_REQUESTS) {
    return { limited: true };
  }

  return { limited: false, remaining: MAX_REQUESTS - timestamps.length };
}
