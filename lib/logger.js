const isEdge = typeof process === 'undefined' || process.env.NEXT_RUNTIME === 'edge';

let pinoInstance = null;

async function getLogger() {
  if (pinoInstance) return pinoInstance;
  if (!isEdge) {
    try {
      const pino = (await import('pino')).default;
      pinoInstance = pino({
        level: process.env.LOG_LEVEL || 'info',
        transport: process.env.NODE_ENV === 'development'
          ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } }
          : undefined,
        formatters: { level: (label) => ({ level: label }) },
        base: { env: process.env.NODE_ENV || 'development', version: '0.1.0' },
        redact: ['req.headers.authorization', 'req.headers.cookie', 'body.password', 'body.token'],
      });
    } catch {
      pinoInstance = null;
    }
  }
  return pinoInstance;
}

const logger = {
  info: async (...args) => { const p = await getLogger(); if (p) p.info(...args); else console.log('[INFO]', ...args); },
  warn: async (...args) => { const p = await getLogger(); if (p) p.warn(...args); else console.warn('[WARN]', ...args); },
  error: async (...args) => { const p = await getLogger(); if (p) p.error(...args); else console.error('[ERROR]', ...args); },
  debug: async (...args) => { const p = await getLogger(); if (p) p.debug(...args); else console.debug('[DEBUG]', ...args); },
};

export default logger;
