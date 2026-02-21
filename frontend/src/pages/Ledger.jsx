import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { ledgerApi } from '../api/ledger';
import { accountsApi } from '../api/accounts';

function formatMoney(n) {
  if (n == null) return '—';
  return new Intl.NumberFormat('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(Number(n));
}

const today = new Date().toISOString().slice(0, 10);
const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);

export default function Ledger() {
  const theme = useTheme();
  const [accounts, setAccounts] = useState([]);
  const [entries, setEntries] = useState([]);
  const [trialBalance, setTrialBalance] = useState(null);
  const [fromDate, setFromDate] = useState(monthStart);
  const [toDate, setToDate] = useState(today);
  const [accountId, setAccountId] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [manualOpen, setManualOpen] = useState(false);
  const [manual, setManual] = useState({
    voucherNo: '',
    transactionDate: today,
    description: '',
    debitAccountId: '',
    creditAccountId: '',
    amount: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadAccounts = useCallback(() => {
    accountsApi.list().then((res) => setAccounts(res.data || [])).catch(() => setAccounts([]));
  }, []);

  const loadEntries = useCallback(() => {
    setLoading(true);
    ledgerApi
      .entries(fromDate, toDate, accountId || undefined, page, rowsPerPage)
      .then((res) => {
        setEntries(res.data?.content ?? []);
        setTotalElements(res.data?.totalElements ?? 0);
      })
      .catch(() => {
        setEntries([]);
        setTotalElements(0);
      })
      .finally(() => setLoading(false));
  }, [fromDate, toDate, accountId, page, rowsPerPage]);

  const loadTrialBalance = useCallback(() => {
    ledgerApi.trialBalance(toDate).then((res) => setTrialBalance(res.data)).catch(() => setTrialBalance(null));
  }, [toDate]);

  useEffect(() => loadAccounts(), [loadAccounts]);
  useEffect(() => loadEntries(), [loadEntries]);
  useEffect(() => loadTrialBalance(), [loadTrialBalance]);

  const handleManualSubmit = async () => {
    if (!manual.voucherNo || !manual.description || !manual.debitAccountId || !manual.creditAccountId || !manual.amount || Number(manual.amount) <= 0) {
      alert('Fill all required fields and amount > 0.');
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
      setManual({ voucherNo: '', transactionDate: today, description: '', debitAccountId: '', creditAccountId: '', amount: '' });
      loadEntries();
      loadTrialBalance();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post entry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Ledger</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setManualOpen(true)}>Manual Entry</Button>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <TextField type="date" label="From" size="small" value={fromDate} onChange={(e) => setFromDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 140 }} />
        <TextField type="date" label="To" size="small" value={toDate} onChange={(e) => setToDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 140 }} />
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Account</InputLabel>
          <Select value={accountId} label="Account" onChange={(e) => setAccountId(e.target.value)}>
            <MenuItem value="">All accounts</MenuItem>
            {accounts.map((a) => (
              <MenuItem key={a.accountId} value={a.accountId}>{a.accountCode} — {a.accountName}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }}>
        <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalanceIcon color="action" />
          <Typography variant="subtitle2">Entries</Typography>
        </Box>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Voucher</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Account</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Dr</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Cr</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.length === 0 && !loading ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}>No entries</TableCell></TableRow>
            ) : (
              entries.map((e) => (
                <TableRow key={e.ledgerEntryId} hover>
                  <TableCell>{e.transactionDate}</TableCell>
                  <TableCell>{e.voucherNo}</TableCell>
                  <TableCell>{e.accountCode} — {e.accountName}</TableCell>
                  <TableCell>{e.description}</TableCell>
                  <TableCell align="right">{Number(e.debitAmount) > 0 ? formatMoney(e.debitAmount) : '—'}</TableCell>
                  <TableCell align="right">{Number(e.creditAmount) > 0 ? formatMoney(e.creditAmount) : '—'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Paper>
      {trialBalance && (
        <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Trial balance as of {trialBalance.asOfDate}</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <Chip label={`Total Dr: ${formatMoney(trialBalance.totalDebit)}`} color="primary" variant="outlined" />
            <Chip label={`Total Cr: ${formatMoney(trialBalance.totalCredit)}`} color="secondary" variant="outlined" />
          </Box>
        </Paper>
      )}
      <Dialog open={manualOpen} onClose={() => !submitting && setManualOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Manual ledger entry</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Voucher no" value={manual.voucherNo} onChange={(e) => setManual((m) => ({ ...m, voucherNo: e.target.value }))} sx={{ mt: 1 }} />
          <TextField fullWidth type="date" label="Transaction date" value={manual.transactionDate} onChange={(e) => setManual((m) => ({ ...m, transactionDate: e.target.value }))} InputLabelProps={{ shrink: true }} sx={{ mt: 2 }} />
          <TextField fullWidth label="Description" value={manual.description} onChange={(e) => setManual((m) => ({ ...m, description: e.target.value }))} sx={{ mt: 2 }} />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Debit account</InputLabel>
            <Select value={manual.debitAccountId} label="Debit account" onChange={(e) => setManual((m) => ({ ...m, debitAccountId: e.target.value }))}>
              {accounts.map((a) => (
                <MenuItem key={a.accountId} value={a.accountId}>{a.accountCode} — {a.accountName}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Credit account</InputLabel>
            <Select value={manual.creditAccountId} label="Credit account" onChange={(e) => setManual((m) => ({ ...m, creditAccountId: e.target.value }))}>
              {accounts.map((a) => (
                <MenuItem key={a.accountId} value={a.accountId}>{a.accountCode} — {a.accountName}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField fullWidth type="number" label="Amount" value={manual.amount} onChange={(e) => setManual((m) => ({ ...m, amount: e.target.value }))} sx={{ mt: 2 }} inputProps={{ min: 0, step: 0.01 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManualOpen(false)} disabled={submitting}>Cancel</Button>
          <Button variant="contained" onClick={handleManualSubmit} disabled={submitting}>{submitting ? 'Posting…' : 'Post'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
