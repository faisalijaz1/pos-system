/**
 * Centralized POS Print Template — Single reusable print engine for all POS tabs.
 * Matches legacy desktop layout: header (optional), customer block, item table, totals, balance (optional), footer.
 * Controlled by Print w/o Balance and Print w/o Header checkboxes; default = include all.
 */

import { formatMoney } from './posUtils';

const DEFAULT_BUSINESS = {
  name: 'MUNIR COPY HOUSE',
  address: 'Kabir Street Urdu Bazar, Lahore',
  phone: 'Ph: 042-37321351',
};

const PRINT_STYLES = `
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print { display: none !important; }
  }
  body {
    font-family: 'Segoe UI', system-ui, Arial, sans-serif;
    padding: 12px 16px;
    max-width: 560px;
    margin: 0 auto;
    font-size: 13px;
    color: #000;
    background: #fff;
  }
  .print-header {
    text-align: center;
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid #333;
  }
  .print-header .business-name { font-size: 18px; font-weight: 700; letter-spacing: 0.02em; margin: 0 0 4px 0; }
  .print-header .business-address { font-size: 12px; color: #444; margin: 0 0 2px 0; }
  .print-header .business-phone { font-size: 12px; color: #444; margin: 0 0 6px 0; }
  .print-header .bill-type { font-size: 12px; font-weight: 600; margin: 4px 0 0 0; }
  .info-block { display: flex; justify-content: space-between; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; }
  .info-left { font-size: 12px; }
  .info-right { font-size: 12px; }
  .info-block .label { color: #555; }
  .print-table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
    font-size: 12px;
  }
  .print-table th, .print-table td {
    border: 1px solid #333;
    padding: 6px 8px;
    text-align: left;
  }
  .print-table th { background: #f0f0f0; font-weight: 600; }
  .print-table .num { text-align: right; }
  .print-table .sr { width: 36px; text-align: center; }
  .print-totals { margin-top: 12px; font-size: 13px; }
  .print-totals .row { display: flex; justify-content: space-between; padding: 4px 0; }
  .print-totals .net { font-weight: 700; font-size: 14px; margin-top: 6px; padding-top: 6px; border-top: 1px solid #333; }
  .print-balance { margin-top: 10px; padding: 8px 0; border-top: 1px solid #ddd; font-size: 12px; }
  .print-footer { margin-top: 16px; padding-top: 10px; border-top: 1px solid #ddd; text-align: center; font-size: 11px; color: #666; }
`;

/**
 * Build print-ready HTML from invoice data and options.
 * @param {Object} opts
 * @param {Object} opts.invoice - { invoiceNumber, invoiceDate, invoiceTime, customerName, remarks, grandTotal, additionalDiscount, additionalExpenses, netTotal, amountReceived, billingNo, billingDate, userName }
 * @param {Array} opts.items - [{ productCode, productName, quantity, unitPrice, lineTotal, uomName }]
 * @param {boolean} opts.printWithoutHeader - if true, hide header (company name, address, phone)
 * @param {boolean} opts.printWithoutBalance - if true, hide balance/amount received section
 * @param {Object} opts.business - optional { name, address, phone } override
 */
export function buildPrintHtml(opts) {
  const {
    invoice = {},
    items = [],
    printWithoutHeader = false,
    printWithoutBalance = false,
    business = {},
  } = opts;

  const biz = { ...DEFAULT_BUSINESS, ...business };
  const inv = invoice;

  const headerHtml = printWithoutHeader
    ? ''
    : `
    <div class="print-header">
      <div class="business-name">${escapeHtml(biz.name)}</div>
      <div class="business-address">${escapeHtml(biz.address)}</div>
      <div class="business-phone">${escapeHtml(biz.phone)}</div>
      <div class="bill-type">(SALES BILL)</div>
    </div>`;

  const dateStr = inv.invoiceDate ? formatPrintDate(inv.invoiceDate) : '—';
  const timeStr = inv.invoiceTime != null ? formatPrintTime(inv.invoiceTime) : '';

  const customerDisplay = inv.customerName && String(inv.customerName).trim() ? inv.customerName : 'Cash Bill';
  const billNo = inv.billingNo || inv.invoiceNumber || '—';

  const customerBlockHtml = `
    <div class="info-block">
      <div class="info-left">
        <span class="label">Bill No:</span> ${escapeHtml(String(billNo))}<br/>
        <span class="label">Date:</span> ${dateStr}<br/>
        ${timeStr ? `<span class="label">Time:</span> ${timeStr}<br/>` : ''}
        ${inv.userName ? `<span class="label">Operator:</span> ${escapeHtml(inv.userName)}` : ''}
      </div>
      <div class="info-right">
        <span class="label">Customer:</span> ${escapeHtml(customerDisplay)}
      </div>
    </div>`;

  const rowsHtml = (items || []).map((it, idx) => {
    const qty = formatMoney(it.quantity);
    const uom = it.uomName ? ` ${it.uomName}` : '';
    const desc = (it.productName || it.productCode || '—');
    const rate = formatMoney(it.unitPrice);
    const amount = formatMoney(it.lineTotal != null ? it.lineTotal : (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0));
    return `<tr><td class="sr">${idx + 1}</td><td>${escapeHtml(desc)}</td><td class="num">${qty}${escapeHtml(uom)}</td><td class="num">${rate}</td><td class="num">${amount}</td></tr>`;
  }).join('');

  const tableHtml = `
    <table class="print-table">
      <thead>
        <tr>
          <th class="sr">Sr #</th>
          <th>Item / Description</th>
          <th class="num">Qty</th>
          <th class="num">Rate</th>
          <th class="num">Amount</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>`;

  const grandTotal = inv.grandTotal != null ? Number(inv.grandTotal) : (items || []).reduce((s, it) => s + (Number(it.lineTotal) || 0), 0);
  const discount = Number(inv.additionalDiscount) || 0;
  const expenses = Number(inv.additionalExpenses) || 0;
  const netTotal = inv.netTotal != null ? Number(inv.netTotal) : grandTotal - discount + expenses;
  const paid = Number(inv.amountReceived) || 0;
  const balance = netTotal - paid;

  const totalsHtml = `
    <div class="print-totals">
      <div class="row"><span>Subtotal:</span><strong>${formatMoney(grandTotal)}</strong></div>
      ${discount ? `<div class="row"><span>Discount:</span><span>${formatMoney(discount)}</span></div>` : ''}
      ${expenses ? `<div class="row"><span>Expenses:</span><span>${formatMoney(expenses)}</span></div>` : ''}
      <div class="row net"><span>Net Total:</span><strong>${formatMoney(netTotal)}</strong></div>
    </div>`;

  const balanceHtml = printWithoutBalance
    ? ''
    : `
    <div class="print-balance">
      <div class="row"><span>Amount Received:</span><strong>${formatMoney(paid)}</strong></div>
      <div class="row"><span>Balance / Due:</span><strong>${formatMoney(balance)}</strong></div>
    </div>`;

  const remarksHtml = inv.remarks ? `<p style="margin-top:10px;font-size:12px;"><strong>Remarks:</strong> ${escapeHtml(inv.remarks)}</p>` : '';

  const footerHtml = `
    <div class="print-footer">
      Thank you for your business.
    </div>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Invoice ${escapeHtml(inv.invoiceNumber || '')}</title>
  <style>${PRINT_STYLES}</style>
</head>
<body>
  ${headerHtml}
  ${customerBlockHtml}
  ${remarksHtml}
  ${tableHtml}
  ${totalsHtml}
  ${balanceHtml}
  ${footerHtml}
  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`;

  return html;
}

function escapeHtml(s) {
  if (s == null) return '';
  const str = String(s);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatPrintDate(dateVal) {
  if (!dateVal) return '—';
  const d = typeof dateVal === 'string' ? new Date(dateVal) : dateVal;
  if (isNaN(d.getTime())) return String(dateVal);
  const day = d.getDate();
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function formatPrintTime(timeVal) {
  if (timeVal == null) return '';
  const s = String(timeVal);
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(s)) {
    const [h, m] = s.split(':').map(Number);
    const h12 = h % 12 || 12;
    const ampm = h < 12 ? 'am' : 'pm';
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
  }
  return s;
}

/**
 * Open a new window, write HTML, and trigger print. Caller can pass HTML from buildPrintHtml.
 */
export function openPrintPreview(html) {
  if (!html) return;
  const win = window.open('', '_blank');
  if (!win) {
    console.warn('Popup blocked - cannot open print preview');
    return;
  }
  win.document.write(html);
  win.document.close();
  try {
    win.print();
  } catch (e) {
    console.warn('Print failed', e);
  }
  win.onafterprint = () => win.close();
  try {
    win.addEventListener('afterprint', () => win.close());
  } catch (_) {}
}

/**
 * Build HTML and open print preview in one call. Use from all tabs.
 */
export function printInvoice(opts) {
  const html = buildPrintHtml(opts);
  openPrintPreview(html);
}

export { DEFAULT_BUSINESS };
