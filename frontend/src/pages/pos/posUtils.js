/**
 * POS shared utilities and constants.
 * React only, no TypeScript.
 */

export function formatMoney(n) {
  if (n == null) return '0';
  return new Intl.NumberFormat('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(n));
}

export function formatTime(d) {
  const t = d instanceof Date ? d : new Date();
  return t.toTimeString().slice(0, 8);
}

/** Human-readable invoice number: INV-YYYYMMDD-HHmm (e.g. INV-20260220-0351) */
export function generateInvoiceNumber() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const time = now.toTimeString().slice(0, 5).replace(':', '');
  return 'INV-' + date + '-' + time;
}

export const DELIVERY_MODES = [
  { deliveryModeId: 1, modeName: 'Counter' },
  { deliveryModeId: 2, modeName: 'Delivery' },
];

export const KEYBOARD_HINTS = 'F2 Search · Enter Add · +/- Qty · F4 Payment · Ctrl+P Print · Esc Close';

/** Date input sx so value is never clipped (e.g. 02/20/2026). Use on all type="date" TextFields. */
export const DATE_INPUT_SX = { minWidth: 165, '& .MuiInputBase-input': { minWidth: 132 } };
/** Time input min width */
export const TIME_INPUT_SX = { minWidth: 108 };
