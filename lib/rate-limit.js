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
