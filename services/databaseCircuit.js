const RETRY_AFTER_MS = 60 * 1000;

let unavailableUntil = 0;

export function isDatabaseAvailable(client) {
  return Boolean(client) && Date.now() >= unavailableUntil;
}

export function markDatabaseFailure(error) {
  const message = `${error?.message || ''} ${error?.details || ''}`.toLowerCase();
  const status = Number(error?.status || error?.statusCode || 0);
  const code = String(error?.code || '').toUpperCase();
  const isInfrastructureFailure = status >= 500
    || ['PGRST002', '57014', '53300', '57P01'].includes(code)
    || message.includes('schema cache')
    || message.includes('connection')
    || message.includes('timeout');

  if (isInfrastructureFailure) unavailableUntil = Date.now() + RETRY_AFTER_MS;
}

