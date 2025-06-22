export function formatCurrency(value) {
  if (value === null || value === undefined) return '';
  return parseFloat(value).toLocaleString('lo-LA', { style: 'currency', currency: 'LAK' });
}

export function formatWeight(value) {
  if (value === null || value === undefined) return '';
  return `${parseFloat(value).toFixed(2)} g`;
}

export function parseCurrency(value) {
  if (typeof value !== 'string') return value;
  const cleaned = value.replace(/[^\d.-]/g, '');
  return parseFloat(cleaned);
}

export function formatForInput(value) {
  if (value === null || value === undefined) return '';
  return parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
} 