import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import AddIcon from '@mui/icons-material/Add';
import PrintIcon from '@mui/icons-material/Print';
import GetAppIcon from '@mui/icons-material/GetApp';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { ledgerApi } from '../api/ledger';
import { accountsApi } from '../api/accounts';
import LedgerHeader from './ledger/LedgerHeader';
import LedgerFilter from './ledger/LedgerFilter';
import LedgerTable from './ledger/LedgerTable';
import LedgerFooter from './ledger/LedgerFooter';
import { buildLedgerPrintHtml, openLedgerPrintPreview } from './ledger/LedgerPrintTemplate';
import { toApiDate } from './ledger/ledgerUtils';

const today = new Date();
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

const defaultFrom = toApiDate(firstDayOfMonth);
const defaultTo = toApiDate(today);

export default function Ledger() {
  const navigate = useNavigate();
  const [accountOptions, setAccountOptions] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(defaultTo);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [manualOpen, setManualOpen] = useState(false);
  const [manual, setManual] = useState({
    voucherNo: '',
    transactionDate: toApiDate(today),
    description: '',
    debitAccountId: '',
    creditAccountId: '',
    amount: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadAccounts = useCallback(() => {
    accountsApi.list().then((res) => setAccountOptions(res.data || [])).catch(() => setAccountOptions([]));
  }, []);

  const searchAccounts = useCallback((term) => {
    if (!term || term.length < 2) {
      loadAccounts();
      return;
    }
    accountsApi.search(term).then((res) => setAccountOptions(res.data || [])).catch(() => setAccountOptions([]));
  }, [loadAccounts]);

  const loadReport = useCallback((pageOverride) => {
    if (!selectedAccount?.accountId) return;
    const p = pageOverride !== undefined ? pageOverride : page;
    setError(null);
    setLoading(true);
    ledgerApi
      .report(selectedAccount.accountId, fromDate, toDate, p, rowsPerPage)
      .then((res) => setReport(res.data))
      .catch((err) => {
        setReport(null);
        setError(err.response?.data?.message || 'Failed to load ledger');
      })
      .finally(() => setLoading(false));
  }, [selectedAccount?.accountId, fromDate, toDate, page, rowsPerPage]);

  const handleGo = useCallback(() => {
    setPage(0);
    loadReport(0);
  }, [loadReport]);

  const handleReset = useCallback(() => {
    setSelectedAccount(null);
    setReport(null);
    setFromDate(defaultFrom);
    setToDate(defaultTo);
    setPage(0);
    setError(null);
    loadAccounts();
  }, [loadAccounts]);

  const handleExit = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleReport = useCallback(() => {
    if (!selectedAccount?.accountId) return;
    setLoading(true);
    ledgerApi
      .reportPrint(selectedAccount.accountId, fromDate, toDate)
      .then((res) => {
        const data = res.data;
        const html = buildLedgerPrintHtml({
          account: data.account,
          fromDate: data.fromDate,
          toDate: data.toDate,
          entries: data.entries || [],
          totalDr: data.totalDr,
          totalCr: data.totalCr,
          closingBalance: data.closingBalance,
          closingBalanceType: data.closingBalanceType,
          showToolbar: true,
        });
        openLedgerPrintPreview(html);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedAccount?.accountId, fromDate, toDate]);

  const handleExport = useCallback(() => {
    if (!report || !report.entries?.length) return;
    const headers = ['Vch #', 'Date', 'Particulars', 'Dr', 'Cr', 'Balance'];
    const rows = report.entries.map((e) => [
      e.voucherNo,
      e.transactionDate,
      e.description || '',
      e.debitAmount || 0,
      e.creditAmount || 0,
      `${e.runningBalance} ${e.balanceType || 'Dr'}`,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ledger_${report.account?.accountCode || 'report'}_${fromDate}_${toDate}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }, [report, fromDate, toDate]);

  const handleManualSubmit = async () => {
    if (!manual.voucherNo || !manual.description || !manual.debitAccountId || !manual.creditAccountId || !manual.amount || Number(manual.amount) <= 0) {
      return;
    }
    setSubmitting(true);
    try {
      await ledgerApi.manualEntry({
        voucherNo: manual.voucherNo,
        transactionDate: manual.transactionDate,
        description: manual.description,
        debitAccountId: Number(manual.debitAccountId),
        creditAccountId: Number(manual.creditAccountId),
        amount: Number(manual.amount),
      });
      setManualOpen(false);
      setManual({ voucherNo: '', transactionDate: toApiDate(today), description: '', debitAccountId: '', creditAccountId: '', amount: '' });
      if (report) loadReport();
      loadAccounts();
    } catch (err) {
      // could show snackbar
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => loadAccounts(), [loadAccounts]);

  const totalElements = report?.totalElements ?? 0;
  const totalPages = report?.totalPages ?? 0;

  return (
    <Box sx={{ p: 2, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Ledger Report</Typography>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setManualOpen(true)}>Manual Entry</Button>
      </Box>

      <LedgerHeader account={report?.account || selectedAccount} />

      <LedgerFilter
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
        accountOptions={accountOptions}
        selectedAccount={selectedAccount}
        onAccountChange={setSelectedAccount}
        onGo={handleGo}
        onReset={handleReset}
        onReport={handleReport}
        onExit={handleExit}
        loading={loading}
        onAccountSearchChange={(v) => searchAccounts(v)}
      />

      {error && (
        <Typography color="error" sx={{ mb: 1 }}>{error}</Typography>
      )}

      {loading && !report ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <LedgerTable
            entries={report?.entries || []}
            emptyMessage="No entries found for selected period. Select account and date range, then click Go."
          />

          {report && (
            <>
              <TablePagination
                component="div"
                count={totalElements}
                page={page}
                onPageChange={(_, p) => { setPage(p); loadReport(p); }}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); loadReport(0); }}
                rowsPerPageOptions={[10, 20, 50, 100]}
                labelRowsPerPage="Rows per page:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
              />

              <LedgerFooter
                totalDr={report.totalDr}
                totalCr={report.totalCr}
                balance={report.closingBalance}
                balanceType={report.closingBalanceType}
              />
            </>
          )}

          {report && (
            <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
              <Button variant="outlined" startIcon={<OpenInNewIcon />} onClick={handleReport} disabled={!selectedAccount}>
                Windows
              </Button>
              <Button variant="outlined" startIcon={<GetAppIcon />} onClick={handleExport} disabled={!report?.entries?.length}>
                Export
              </Button>
              <Button variant="outlined" startIcon={<PrintIcon />} onClick={handleReport} disabled={!selectedAccount}>
                Printer
              </Button>
            </Box>
          )}
        </>
      )}

      {manualOpen && (
        <Dialog open={manualOpen} onClose={() => !submitting && setManualOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Manual ledger entry</DialogTitle>
          <DialogContent>
            <TextField fullWidth label="Voucher no" value={manual.voucherNo} onChange={(e) => setManual((m) => ({ ...m, voucherNo: e.target.value }))} sx={{ mt: 1 }} />
            <TextField fullWidth type="date" label="Transaction date" value={manual.transactionDate} onChange={(e) => setManual((m) => ({ ...m, transactionDate: e.target.value }))} InputLabelProps={{ shrink: true }} sx={{ mt: 2 }} />
            <TextField fullWidth label="Description" value={manual.description} onChange={(e) => setManual((m) => ({ ...m, description: e.target.value }))} sx={{ mt: 2 }} />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Debit account</InputLabel>
              <Select value={manual.debitAccountId} label="Debit account" onChange={(e) => setManual((m) => ({ ...m, debitAccountId: e.target.value }))}>
                {accountOptions.map((a) => (
                  <MenuItem key={a.accountId} value={a.accountId}>{a.accountCode} — {a.accountName}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Credit account</InputLabel>
              <Select value={manual.creditAccountId} label="Credit account" onChange={(e) => setManual((m) => ({ ...m, creditAccountId: e.target.value }))}>
                {accountOptions.map((a) => (
                  <MenuItem key={a.accountId} value={a.accountId}>{a.accountCode} — {a.accountName}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField fullWidth type="number" label="Amount" value={manual.amount} onChange={(e) => setManual((m) => ({ ...m, amount: e.target.value }))} sx={{ mt: 2 }} inputProps={{ min: 0, step: 0.01 }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setManualOpen(false)} disabled={submitting}>Cancel</Button>
            <Button variant="contained" onClick={handleManualSubmit} disabled={submitting || !manual.voucherNo || !manual.description || !manual.debitAccountId || !manual.creditAccountId || !manual.amount || Number(manual.amount) <= 0}>{submitting ? 'Posting…' : 'Post'}</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
