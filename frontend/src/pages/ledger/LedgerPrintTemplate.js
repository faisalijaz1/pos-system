/**
 * Ledger print report — matches desktop format: MUNIR COPY HOUSE header, account, date range, table, totals.
 */
import { formatMoney, formatLedgerDate } from './ledgerUtils';

const DEFAULT_BUSINESS = {
  name: 'MUNIR COPY HOUSE',
  address: 'Kabir Street Urdu Bazar, Lahore',
  phone: 'Ph: 042-37321351',
};

const PRINT_STYLES = `
  @media print { body { -webkit-print-color-adjust: exact; } }
  body { font-family: 'Segoe UI', system-ui, Arial, sans-serif; padding: 16px; font-size: 12px; color: #000; background: #fff; }
  .print-header { text-align: center; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #333; }
  .print-header .business-name { font-size: 18px; font-weight: 700; margin: 0 0 4px 0; }
  .print-header .business-address, .print-header .business-phone { font-size: 11px; color: #444; margin: 0; }
  .report-title { font-size: 16px; font-weight: 700; text-align: center; margin: 12px 0 8px 0; }
  .report-meta { margin-bottom: 12px; font-size: 12px; }
  .report-table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 11px; }
  .report-table th, .report-table td { border: 1px solid #333; padding: 5px 8px; text-align: left; }
  .report-table th { background: #e0e0e0; font-weight: 600; }
  .report-table .num { text-align: right; }
  .report-footer { margin-top: 12px; padding-top: 8px; border-top: 1px solid #333; font-weight: 700; }
`;

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildLedgerPrintHtml(opts) {
  const { account, fromDate, toDate, entries = [], totalDr, totalCr, closingBalance, closingBalanceType } = opts;
  const biz = { ...DEFAULT_BUSINESS, ...(opts.business || {}) };
  const fromStr = fromDate ? formatLedgerDate(fromDate) : '—';
  const toStr = toDate ? formatLedgerDate(toDate) : '—';
  const accountLabel = account
    ? `${escapeHtml(account.accountName)} (${escapeHtml(account.accountCode)})`
    : '—';

  const rowsHtml = (entries || [])
    .map(
      (e) =>
        `<tr>
          <td>${escapeHtml(e.voucherNo)}</td>
          <td>${formatLedgerDate(e.transactionDate)}</td>
          <td>${escapeHtml(e.description || '')}</td>
          <td class="num">${Number(e.debitAmount) > 0 ? formatMoney(e.debitAmount) : ''}</td>
          <td class="num">${Number(e.creditAmount) > 0 ? formatMoney(e.creditAmount) : ''}</td>
          <td class="num">${formatMoney(e.runningBalance)} ${e.balanceType || 'Dr'}</td>
        </tr>`
    )
    .join('');

  const balanceStr = closingBalance != null ? `${formatMoney(closingBalance)} ${closingBalanceType || 'Dr'}` : '—';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Ledger Report</title>
  <style>${PRINT_STYLES}</style>
</head>
<body>
  <div class="print-header">
    <div class="business-name">${escapeHtml(biz.name)}</div>
    <div class="business-address">${escapeHtml(biz.address)}</div>
    <div class="business-phone">${escapeHtml(biz.phone)}</div>
  </div>
  <div class="report-title">Ledger</div>
  <div class="report-meta">
    From: ${fromStr} &nbsp; To: ${toStr}<br/>
    Account: ${accountLabel}
  </div>
  <table class="report-table">
    <thead>
      <tr>
        <th>Vch #</th>
        <th>Date</th>
        <th>Particulars</th>
        <th class="num">Dr</th>
        <th class="num">Cr</th>
        <th class="num">Balance</th>
      </tr>
    </thead>
    <tbody>${rowsHtml || '<tr><td colspan="6" align="center">No entries</td></tr>'}</tbody>
  </table>
  <div class="report-footer">
    Total Dr: ${formatMoney(totalDr)} &nbsp; Total Cr: ${formatMoney(totalCr)} &nbsp; Balance: ${balanceStr}
  </div>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;

  return html;
}

export function openLedgerPrintPreview(html) {
  if (!html) return;
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
}
