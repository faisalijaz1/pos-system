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
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
  IconButton,
  useTheme,
  alpha,
  Tabs,
  Tab,
  Autocomplete,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { stockApi } from '../api/stock';
import { productsApi } from '../api/products';
import { uomApi } from '../api/uom';

const today = new Date().toISOString().slice(0, 10);
const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);

function formatNum(n) {
  if (n == null) return '—';
  return new Intl.NumberFormat('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 3 }).format(Number(n));
}

export default function Stock() {
  const theme = useTheme();
  const [tab, setTab] = useState(0);
  const [movements, setMovements] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [fromDate, setFromDate] = useState(monthStart);
  const [toDate, setToDate] = useState(today);
  const [productId, setProductId] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [loading, setLoading] = useState(true);
  const [inOpen, setInOpen] = useState(false);
  const [outOpen, setOutOpen] = useState(false);
  const [inForm, setInForm] = useState({ transactionDate: today, description: '', items: [{ productId: null, productLabel: '', quantity: '', priceAtTransaction: '', uomId: '' }] });
  const [outForm, setOutForm] = useState({ transactionDate: today, description: '', items: [{ productId: null, productLabel: '', quantity: '', uomId: '' }] });
  const [submitting, setSubmitting] = useState(false);
  const [productOptions, setProductOptions] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [productSearchDebounce, setProductSearchDebounce] = useState('');
  const [uomList, setUomList] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const loadMovements = useCallback(() => {
    setLoading(true);
    stockApi
      .movements(fromDate, toDate, productId || undefined, page, rowsPerPage)
      .then((res) => {
        setMovements(res.data?.content ?? []);
        setTotalElements(res.data?.totalElements ?? 0);
      })
      .catch(() => {
        setMovements([]);
        setTotalElements(0);
      })
      .finally(() => setLoading(false));
  }, [fromDate, toDate, productId, page, rowsPerPage]);

  useEffect(() => loadMovements(), [loadMovements]);

  useEffect(() => {
    if (!inOpen && !outOpen) return;
    const t = setTimeout(() => setProductSearchDebounce(productSearch), 350);
    return () => clearTimeout(t);
  }, [inOpen, outOpen, productSearch]);

  useEffect(() => {
    if (!inOpen && !outOpen) return;
    const q = (productSearchDebounce || '').trim();
    productsApi.list(q ? { name: q } : {}, 0, 25).then((res) => {
      const list = res.data?.content ?? [];
      setProductOptions(list.map((p) => ({ ...p, label: `${p.code} — ${p.nameEn || p.nameUr || ''}` })));
    }).catch(() => setProductOptions([]));
  }, [inOpen, outOpen, productSearchDebounce]);

  useEffect(() => {
    if (inOpen || outOpen) {
      uomApi.list().then((res) => setUomList(res.data || [])).catch(() => setUomList([]));
      setProductSearch('');
      setProductSearchDebounce('');
    }
  }, [inOpen, outOpen]);

  const loadLowStock = useCallback(() => {
    productsApi.list({}, 0, 100).then((res) => {
      const list = res.data?.content ?? [];
      setLowStockProducts(list.filter((p) => Number(p.currentStock) < 10));
    }).catch(() => setLowStockProducts([]));
  }, []);
  useEffect(() => loadLowStock(), [loadLowStock]);

  const addInItem = () => setInForm((f) => ({ ...f, items: [...f.items, { productId: null, productLabel: '', quantity: '', priceAtTransaction: '', uomId: '' }] }));
  const removeInItem = (idx) => setInForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  const updateInItem = (idx, field, value) => setInForm((f) => ({
    ...f,
    items: f.items.map((it, i) => i === idx ? { ...it, [field]: value } : it),
  }));

  const addOutItem = () => setOutForm((f) => ({ ...f, items: [...f.items, { productId: null, productLabel: '', quantity: '', uomId: '' }] }));
  const removeOutItem = (idx) => setOutForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  const updateOutItem = (idx, field, value) => setOutForm((f) => ({
    ...f,
    items: f.items.map((it, i) => i === idx ? { ...it, [field]: value } : it),
  }));

  const submitIn = async () => {
    const items = inForm.items
      .filter((it) => it.productId != null && it.quantity !== '' && Number(it.quantity) > 0)
      .map((it) => ({
        productId: it.productId,
        quantity: Number(it.quantity),
        priceAtTransaction: it.priceAtTransaction ? Number(it.priceAtTransaction) : null,
        uomId: it.uomId ? Number(it.uomId) : null,
      }));
    if (items.length === 0) {
      setSnackbar({ open: true, message: 'Add at least one item with product and quantity.', severity: 'warning' });
      return;
    }
    setSubmitting(true);
    try {
      await stockApi.in({
        transactionDate: inForm.transactionDate,
        description: inForm.description || null,
        items,
      });
      setInOpen(false);
      setInForm({ transactionDate: today, description: '', items: [{ productId: null, productLabel: '', quantity: '', priceAtTransaction: '', uomId: '' }] });
      loadMovements();
      loadLowStock();
      setSnackbar({ open: true, message: 'Stock In saved successfully.', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Stock In failed.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const submitOut = async () => {
    const items = outForm.items
      .filter((it) => it.productId != null && it.quantity !== '' && Number(it.quantity) > 0)
      .map((it) => ({
        productId: it.productId,
        quantity: Number(it.quantity),
        uomId: it.uomId ? Number(it.uomId) : null,
      }));
    if (items.length === 0) {
      setSnackbar({ open: true, message: 'Add at least one item with product and quantity.', severity: 'warning' });
      return;
    }
    setSubmitting(true);
    try {
      await stockApi.out({
        transactionDate: outForm.transactionDate,
        description: outForm.description || null,
        items,
      });
      setOutOpen(false);
      setOutForm({ transactionDate: today, description: '', items: [{ productId: null, productLabel: '', quantity: '', uomId: '' }] });
      loadMovements();
      loadLowStock();
      setSnackbar({ open: true, message: 'Stock Out saved successfully.', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Stock Out failed.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Stock</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setInOpen(true)}>Stock In</Button>
          <Button variant="contained" color="secondary" startIcon={<RemoveIcon />} onClick={() => setOutOpen(true)}>Stock Out</Button>
        </Box>
      </Box>
      {lowStockProducts.length > 0 && (
        <Paper elevation={2} sx={{ p: 2, borderRadius: 2, mb: 2, borderLeft: 4, borderColor: 'warning.main' }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <WarningAmberIcon fontSize="small" /> Low stock (&lt; 10)
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {lowStockProducts.map((p) => (
              <Chip key={p.productId} label={`${p.code} — ${p.nameEn || ''}: ${formatNum(p.currentStock)}`} size="small" color="warning" variant="outlined" />
            ))}
          </Box>
        </Paper>
      )}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <TextField type="date" label="From" size="small" value={fromDate} onChange={(e) => setFromDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 140 }} />
        <TextField type="date" label="To" size="small" value={toDate} onChange={(e) => setToDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 140 }} />
        <TextField
          size="small"
          label="Product ID (filter)"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          placeholder="Optional"
          sx={{ minWidth: 140 }}
        />
      </Box>
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
          <InventoryIcon color="action" />
          <Typography variant="subtitle2">Movements</Typography>
        </Box>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Record #</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Items</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movements.length === 0 && !loading ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}>No movements</TableCell></TableRow>
            ) : (
              movements.map((m) => (
                <TableRow key={m.stockTransactionId} hover>
                  <TableCell>{m.transactionDate}</TableCell>
                  <TableCell>{m.recordNo}</TableCell>
                  <TableCell><Chip size="small" label={m.transactionTypeCode || '—'} variant="outlined" /></TableCell>
                  <TableCell>{m.description || '—'}</TableCell>
                  <TableCell>
                    {m.items?.length ? (
                      <Box component="span" sx={{ fontSize: '0.875rem' }}>
                        {m.items.map((it, i) => (
                          <span key={i}>{it.productCode} {it.productName}: {formatNum(it.quantityChange)}{i < m.items.length - 1 ? '; ' : ''}</span>
                        ))}
                      </Box>
                    ) : '—'}
                  </TableCell>
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

      <Dialog open={inOpen} onClose={() => !submitting && setInOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Stock In</DialogTitle>
        <DialogContent>
          <TextField fullWidth type="date" label="Transaction date" value={inForm.transactionDate} onChange={(e) => setInForm((f) => ({ ...f, transactionDate: e.target.value }))} InputLabelProps={{ shrink: true }} sx={{ mt: 1 }} />
          <TextField fullWidth label="Description" value={inForm.description} onChange={(e) => setInForm((f) => ({ ...f, description: e.target.value }))} sx={{ mt: 2 }} />
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Items</Typography>
          {inForm.items.map((it, idx) => (
            <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 1, flexWrap: 'wrap' }}>
              <Autocomplete
                size="small"
                options={productOptions}
                getOptionLabel={(o) => o.label || ''}
                value={productOptions.find((o) => o.productId === it.productId) || null}
                onInputChange={(_, v) => {
                  const selectedLabel = it.productLabel;
                  if (v !== selectedLabel) setProductSearch(v);
                }}
                onChange={(_, v) => setInForm((f) => ({
                  ...f,
                  items: f.items.map((item, i) => i === idx ? { ...item, productId: v?.productId ?? null, productLabel: v?.label ?? '' } : item),
                }))}
                renderInput={(params) => <TextField {...params} label="Product" />}
                sx={{ flex: '1 1 200px', minWidth: 200 }}
              />
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel id={`in-uom-${idx}`}>Unit</InputLabel>
                <Select
                  labelId={`in-uom-${idx}`}
                  label="Unit"
                  value={it.uomId ?? ''}
                  onChange={(e) => updateInItem(idx, 'uomId', e.target.value)}
                >
                  <MenuItem value="">—</MenuItem>
                  {uomList.map((u) => (
                    <MenuItem key={u.uomId} value={u.uomId}>{u.name || u.symbol || u.uomId}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField size="small" label="Qty" type="number" value={it.quantity} onChange={(e) => updateInItem(idx, 'quantity', e.target.value)} sx={{ width: 90 }} inputProps={{ min: 0, step: 0.001 }} />
              <TextField size="small" label="Price" type="number" value={it.priceAtTransaction} onChange={(e) => updateInItem(idx, 'priceAtTransaction', e.target.value)} sx={{ width: 100 }} inputProps={{ min: 0, step: 0.01 }} />
              <IconButton size="small" onClick={() => removeInItem(idx)} disabled={inForm.items.length <= 1}><DeleteOutlineIcon /></IconButton>
            </Box>
          ))}
          <Button size="small" startIcon={<AddIcon />} onClick={addInItem}>Add line</Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInOpen(false)} disabled={submitting}>Cancel</Button>
          <Button variant="contained" onClick={submitIn} disabled={submitting}>{submitting ? 'Saving…' : 'Save'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={outOpen} onClose={() => !submitting && setOutOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Stock Out</DialogTitle>
        <DialogContent>
          <TextField fullWidth type="date" label="Transaction date" value={outForm.transactionDate} onChange={(e) => setOutForm((f) => ({ ...f, transactionDate: e.target.value }))} InputLabelProps={{ shrink: true }} sx={{ mt: 1 }} />
          <TextField fullWidth label="Description" value={outForm.description} onChange={(e) => setOutForm((f) => ({ ...f, description: e.target.value }))} sx={{ mt: 2 }} />
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Items</Typography>
          {outForm.items.map((it, idx) => (
            <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 1, flexWrap: 'wrap' }}>
              <Autocomplete
                size="small"
                options={productOptions}
                getOptionLabel={(o) => o.label || ''}
                value={productOptions.find((o) => o.productId === it.productId) || null}
                onInputChange={(_, v) => {
                  const selectedLabel = it.productLabel;
                  if (v !== selectedLabel) setProductSearch(v);
                }}
                onChange={(_, v) => setOutForm((f) => ({
                  ...f,
                  items: f.items.map((item, i) => i === idx ? { ...item, productId: v?.productId ?? null, productLabel: v?.label ?? '' } : item),
                }))}
                renderInput={(params) => <TextField {...params} label="Product" />}
                sx={{ flex: '1 1 200px', minWidth: 200 }}
              />
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel id={`out-uom-${idx}`}>Unit</InputLabel>
                <Select
                  labelId={`out-uom-${idx}`}
                  label="Unit"
                  value={it.uomId ?? ''}
                  onChange={(e) => updateOutItem(idx, 'uomId', e.target.value)}
                >
                  <MenuItem value="">—</MenuItem>
                  {uomList.map((u) => (
                    <MenuItem key={u.uomId} value={u.uomId}>{u.name || u.symbol || u.uomId}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField size="small" label="Qty" type="number" value={it.quantity} onChange={(e) => updateOutItem(idx, 'quantity', e.target.value)} sx={{ width: 90 }} inputProps={{ min: 0, step: 0.001 }} />
              <IconButton size="small" onClick={() => removeOutItem(idx)} disabled={outForm.items.length <= 1}><DeleteOutlineIcon /></IconButton>
            </Box>
          ))}
          <Button size="small" startIcon={<AddIcon />} onClick={addOutItem}>Add line</Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOutOpen(false)} disabled={submitting}>Cancel</Button>
          <Button variant="contained" color="secondary" onClick={submitOut} disabled={submitting}>{submitting ? 'Saving…' : 'Save'}</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
