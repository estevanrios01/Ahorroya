export function initSentry() {}

export function captureError(error, context = {}) {
  console.error('[Error]', error?.message || error, context);
}

export function captureMessage(message, level = 'info') {
  console.log(`[${level}]`, message);
}

export function setUser(id, email, role) {}
