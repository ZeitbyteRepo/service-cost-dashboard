export function formatCurrency(amount: number | null | undefined, currency = 'USD') {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(amount: number | null | undefined, suffix = '') {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return 'N/A';
  const base = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(amount);
  return suffix ? `${base} ${suffix}` : base;
}
