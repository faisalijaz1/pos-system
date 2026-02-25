/**
 * Format number as currency (PKR style, no decimals).
 */
export function formatMoney(n) {
  if (n == null) return '—';
  return new Intl.NumberFormat('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(Number(n));
}

/** Format date as DD-MMM-YY for display/print */
export function formatLedgerDate(dateVal) {
  if (!dateVal) return '—';
  const d = typeof dateVal === 'string' ? new Date(dateVal) : dateVal;
  if (isNaN(d.getTime())) return String(dateVal);
  const day = d.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const year = String(d.getFullYear()).slice(-2);
  return `${day}-${month}-${year}`;
}

/** Format date as YYYY-MM-DD for API */
export function toApiDate(d) {
  if (!d) return '';
  const x = typeof d === 'string' ? new Date(d) : d;
  return x.toISOString().slice(0, 10);
}
