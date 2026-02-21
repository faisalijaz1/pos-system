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
  IconButton,
  useTheme,
  alpha,
  Autocomplete,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { purchasesApi } from '../api/purchases';
import { suppliersApi } from '../api/suppliers';
import { productsApi } from '../api/products';

const today = new Date().toISOString().slice(0, 10);
const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);

function formatMoney(n) {
  if (n == null) return '—';
  return new Intl.NumberFormat('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(Number(n));
}

export default function Purchases() {
  const theme = useTheme();
  const [list, setList] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [fromDate, setFromDate] = useState(monthStart);
  const [toDate, setToDate] = useState(today);
  const [supplierId, setSupplierId] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailPo, setDetailPo] = useState(null);
  const [createForm, setCreateForm] = useState({
    orderNumber: '',
    supplierId: '',
    orderDate: today,
    remarks: '',
    items: [{ productId: null, productLabel: '', quantity: '', unitPrice: '' }],
  });
  const [productOptions, setProductOptions] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadList = useCallback(() => {
    setLoading(true);
    purchasesApi
      .list(fromDate, toDate, supplierId || undefined, page, rowsPerPage)
      .then((res) => {
        setList(res.data?.content ?? []);
        setTotalElements(res.data?.totalElements ?? 0);
      })
      .catch(() => {
        setList([]);
        setTotalElements(0);
      })
      .finally(() => setLoading(false));
  }, [fromDate, toDate, supplierId, page, rowsPerPage]);

  useEffect(() => loadList(), [loadList]);
  useEffect(() => {
    suppliersApi.list().then((res) => setSuppliers(res.data || [])).catch(() => setSuppliers([]));
  }, []);

  useEffect(() => {
    if (!createOpen) return;
    const q = productSearch || ' ';
    productsApi.list({ name: q }, 0, 25).then((res) => {
      const data = res.data?.content ?? [];
      setProductOptions(data.map((p) => ({ ...p, label: `${p.code} — ${p.nameEn || p.nameUr || ''}` })));
    }).catch(() => setProductOptions([]));
  }, [createOpen, productSearch]);

  const openDetail = (id) => {
    purchasesApi.getById(id).then((res) => {
      setDetailPo(res.data);
      setDetailOpen(true);
    }).catch(() => alert('Failed to load PO'));
  };

  const handleReceive = async (id) => {
    if (!confirm('Receive this order and update stock?')) return;
    setSubmitting(true);
    try {
      await purchasesApi.receive(id);
      setDetailOpen(false);
      setDetailPo(null);
      loadList();
    } catch (err) {
      alert(err.response?.data?.message || 'Receive failed');
    } finally {
      setSubmitting(false);
    }
  };

  const addItem = () => setCreateForm((f) => ({ ...f, items: [...f.items, { productId: null, productLabel: '', quantity: '', unitPrice: '' }] }));
  const removeItem = (idx) => setCreateForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  const updateItem = (idx, field, value) => setCreateForm((f) => ({
    ...f,
    items: f.items.map((it, i) => i === idx ? { ...it, [field]: value } : it),
  }));

  const submitCreate = async () => {
    if (!createForm.orderNumber || !createForm.supplierId || !createForm.orderDate) {
      alert('Fill order number, supplier and date.');
      return;
    }
    const items = createForm.items
      .filter((it) => it.productId != null && it.quantity !== '' && Number(it.quantity) > 0 && it.unitPrice !== '' && Number(it.unitPrice) >= 0)
      .map((it) => ({ productId: it.productId, quantity: Number(it.quantity), unitPrice: Number(it.unitPrice) }));
    if (items.length === 0) {
      alert('Add at least one item with product, quantity and unit price.');
      return;
    }
    setSubmitting(true);
    try {
      await purchasesApi.create({
        orderNumber: createForm.orderNumber,
        supplierId: Number(createForm.supplierId),
        orderDate: createForm.orderDate,
        remarks: createForm.remarks || null,
        items,
      });
      setCreateOpen(false);
      setCreateForm({ orderNumber: '', supplierId: '', orderDate: today, remarks: '', items: [{ productId: null, productLabel: '', quantity: '', unitPrice: '' }] });
      loadList();
    } catch (err) {
      alert(err.response?.data?.message || 'Create PO failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Purchases</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>New purchase order</Button>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <TextField type="date" label="From" size="small" value={fromDate} onChange={(e) => setFromDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 140 }} />
        <TextField type="date" label="To" size="small" value={toDate} onChange={(e) => setToDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ minWidth: 140 }} />
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Supplier</InputLabel>
          <Select value={supplierId} label="Supplier" onChange={(e) => setSupplierId(e.target.value)}>
            <MenuItem value="">All suppliers</MenuItem>
            {suppliers.map((s) => (
              <MenuItem key={s.supplierId} value={s.supplierId}>{s.supplierCode} — {s.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalShippingIcon color="action" />
          <Typography variant="subtitle2">Purchase orders</Typography>
        </Box>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
              <TableCell sx={{ fontWeight: 600 }}>Order #</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Supplier</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Total</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.length === 0 && !loading ? (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}>No purchase orders</TableCell></TableRow>
            ) : (
              list.map((po) => (
                <TableRow key={po.purchaseOrderId} hover>
                  <TableCell>{po.orderNumber}</TableCell>
                  <TableCell>{po.supplierName}</TableCell>
                  <TableCell>{po.orderDate}</TableCell>
                  <TableCell align="right">{formatMoney(po.totalAmount)}</TableCell>
                  <TableCell>{po.status || '—'}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openDetail(po.purchaseOrderId)} title="View"><VisibilityIcon fontSize="small" /></IconButton>
                    {po.status !== 'RECEIVED' && (
                      <Button size="small" color="primary" onClick={() => handleReceive(po.purchaseOrderId)} disabled={submitting}>Receive</Button>
                    )}
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

      <Dialog open={createOpen} onClose={() => !submitting && setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New purchase order</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Order number" value={createForm.orderNumber} onChange={(e) => setCreateForm((f) => ({ ...f, orderNumber: e.target.value }))} sx={{ mt: 1 }} required />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Supplier</InputLabel>
            <Select value={createForm.supplierId} label="Supplier" onChange={(e) => setCreateForm((f) => ({ ...f, supplierId: e.target.value }))}>
              {suppliers.map((s) => (
                <MenuItem key={s.supplierId} value={s.supplierId}>{s.supplierCode} — {s.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField fullWidth type="date" label="Order date" value={createForm.orderDate} onChange={(e) => setCreateForm((f) => ({ ...f, orderDate: e.target.value }))} InputLabelProps={{ shrink: true }} sx={{ mt: 2 }} />
          <TextField fullWidth label="Remarks" value={createForm.remarks} onChange={(e) => setCreateForm((f) => ({ ...f, remarks: e.target.value }))} multiline minRows={1} sx={{ mt: 2 }} />
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Items</Typography>
          {createForm.items.map((it, idx) => (
            <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 1 }}>
              <Autocomplete
                size="small"
                options={productOptions}
                getOptionLabel={(o) => o.label || ''}
                value={productOptions.find((o) => o.productId === it.productId) || null}
                onInputChange={(_, v) => setProductSearch(v)}
                onChange={(_, v) => setCreateForm((f) => ({
                  ...f,
                  items: f.items.map((item, i) => i === idx ? { ...item, productId: v?.productId ?? null, productLabel: v?.label ?? '' } : item),
                }))}
                renderInput={(params) => <TextField {...params} label="Product" />}
                sx={{ flex: 2 }}
              />
              <TextField size="small" label="Qty" type="number" value={it.quantity} onChange={(e) => updateItem(idx, 'quantity', e.target.value)} sx={{ width: 90 }} inputProps={{ min: 0, step: 0.001 }} />
              <TextField size="small" label="Unit price" type="number" value={it.unitPrice} onChange={(e) => updateItem(idx, 'unitPrice', e.target.value)} sx={{ width: 110 }} inputProps={{ min: 0, step: 0.01 }} />
              <IconButton size="small" onClick={() => removeItem(idx)} disabled={createForm.items.length <= 1}><DeleteOutlineIcon /></IconButton>
            </Box>
          ))}
          <Button size="small" startIcon={<AddIcon />} onClick={addItem}>Add line</Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)} disabled={submitting}>Cancel</Button>
          <Button variant="contained" onClick={submitCreate} disabled={submitting}>{submitting ? 'Creating…' : 'Create'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={detailOpen} onClose={() => !submitting && setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Purchase order — {detailPo?.orderNumber}</DialogTitle>
        <DialogContent>
          {detailPo && (
            <>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Typography variant="body2"><strong>Supplier:</strong> {detailPo.supplierName}</Typography>
                <Typography variant="body2"><strong>Date:</strong> {detailPo.orderDate}</Typography>
                <Typography variant="body2"><strong>Status:</strong> {detailPo.status}</Typography>
                {detailPo.remarks && <Typography variant="body2"><strong>Remarks:</strong> {detailPo.remarks}</Typography>}
              </Box>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
                    <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Qty</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Unit price</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detailPo.items?.map((it) => (
                    <TableRow key={it.purchaseOrderItemId}>
                      <TableCell>{it.productCode} — {it.productName}</TableCell>
                      <TableCell align="right">{formatMoney(it.quantity)}</TableCell>
                      <TableCell align="right">{formatMoney(it.unitPrice)}</TableCell>
                      <TableCell align="right">{formatMoney(it.lineTotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Typography variant="subtitle2" sx={{ mt: 2 }}>Order total: {formatMoney(detailPo.totalAmount)}</Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Close</Button>
          {detailPo?.status !== 'RECEIVED' && (
            <Button variant="contained" onClick={() => handleReceive(detailPo.purchaseOrderId)} disabled={submitting}>{submitting ? 'Receiving…' : 'Receive order'}</Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
