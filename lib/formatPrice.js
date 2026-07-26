export function formatPrice(value) {
  return value != null
    ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value)
    : '';
}
