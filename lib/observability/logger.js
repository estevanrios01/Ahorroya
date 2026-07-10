let pinoInstance = null;
let initPromise = null;

async function getPino() {
  if (pinoInstance) return pinoInstance;
  if (initPromise) return initPromise;
  const isEdge = typeof process === 'undefined' || process.env.NEXT_RUNTIME === 'edge';
  if (isEdge) return null;
  initPromise = (async () => {
    try {
      const pino = (await import('pino')).default;
      pinoInstance = pino({
        level: process.env.LOG_LEVEL || 'info',
        transport: process.env.NODE_ENV === 'development'
          ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } }
          : undefined,
        formatters: { level: (label) => ({ level: label }) },
        base: { env: process.env.NODE_ENV || 'development', version: '0.1.0', pid: process.pid },
        redact: ['req.headers.authorization', 'req.headers.cookie', 'body.password', 'body.token'],
      });
    } catch { pinoInstance = null; }
    return pinoInstance;
  })();
  return initPromise;
}

function createLogger(context = {}) {
  return {
    info: async (msg, data) => { const p = await getPino(); if (p) p.info({ ...context, ...data }, msg); else console.log(`[INFO] [${context.service || 'app'}]`, msg, data || ''); },
    warn: async (msg, data) => { const p = await getPino(); if (p) p.warn({ ...context, ...data }, msg); else console.warn(`[WARN] [${context.service || 'app'}]`, msg, data || ''); },
    error: async (msg, data) => { const p = await getPino(); if (p) p.error({ ...context, ...data, err: data?.error }, msg); else console.error(`[ERROR] [${context.service || 'app'}]`, msg, data || ''); },
    debug: async (msg, data) => { const p = await getPino(); if (p) p.debug({ ...context, ...data }, msg); else console.debug(`[DEBUG] [${context.service || 'app'}]`, msg, data || ''); },
  };
}

const rootLogger = createLogger({ service: 'ahorroya' });
export default rootLogger;
export { createLogger };
