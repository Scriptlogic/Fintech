/**
 * Formatting utilities — centralized for consistency
 */

/**
 * Format number as Indian Rupees
 */
export const formatINR = (n, decimals = 0) =>
  new Intl.NumberFormat('en-IN', {
    style:                 'currency',
    currency:              'INR',
    maximumFractionDigits: decimals,
  }).format(n ?? 0);

/**
 * Format number as compact (e.g. 1.2K, 3.5M)
 */
export const formatCompact = (n) =>
  new Intl.NumberFormat('en-IN', {
    notation:              'compact',
    compactDisplay:        'short',
    maximumFractionDigits: 1,
  }).format(n ?? 0);

/**
 * Format ISO date string to readable format
 * @param {string} iso  'YYYY-MM-DD' or full ISO timestamp
 * @param {string} style  'short' | 'long' | 'relative'
 */
export const formatDate = (iso, style = 'short') => {
  if (!iso) return '';
  const d     = new Date(iso);
  const today = new Date();
  const yest  = new Date(); yest.setDate(today.getDate() - 1);

  const sameDay = (a, b) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  if (style === 'relative') {
    if (sameDay(d, today)) return 'Today';
    if (sameDay(d, yest))  return 'Yesterday';
  }

  if (style === 'long') {
    return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (str, maxLen = 50) =>
  str && str.length > maxLen ? `${str.slice(0, maxLen)}…` : str;
