import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  useTheme,
  alpha,
  Tabs,
  Tab,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Collapse,
  TablePagination,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PaymentIcon from '@mui/icons-material/Payment';
import HistoryIcon from '@mui/icons-material/History';
import PinIcon from '@mui/icons-material/Pin';
import PrintIcon from '@mui/icons-material/Print';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { invoicesApi } from '../api/invoices';
import { customersApi } from '../api/customers';
import { productsApi } from '../api/products';
import { printInvoice } from './pos/printTemplate';

function formatMoney(n) {
  if (n == null) return '0';
  return new Intl.NumberFormat('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Number(n));
}

function formatTime(d) {
  const t = d instanceof Date ? d : new Date();
  return t.toTimeString().slice(0, 8);
}

const today = new Date().toISOString().slice(0, 10);
const DELIVERY_MODES = [
  { deliveryModeId: 1, modeName: 'Counter' },
  { deliveryModeId: 2, modeName: 'Delivery' },
];

export default function PosBilling() {
  const theme = useTheme();
  const [tab, setTab] = useState(0);

  // Invoice context
  const [invoiceNumber, setInvoiceNumber] = useState(() => `INV-${Date.now()}`);
  const [invoiceDate, setInvoiceDate] = useState(today);
  const [invoiceTime, setInvoiceTime] = useState(formatTime(new Date()));
  const [transactionTypeCode] = useState('SALE');
  const [deliveryModeId, setDeliveryModeId] = useState(1);

  // Normal tab — product & cart
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [focusedRowIndex, setFocusedRowIndex] = useState(-1);
  const searchRef = useRef(null);

  // Customer
  const [customerOptions, setCustomerOptions] = useState([]);
  const [customerInput, setCustomerInput] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isCashCustomer, setIsCashCustomer] = useState(true);

  // Totals & options
  const [additionalDiscount, setAdditionalDiscount] = useState(0);
  const [additionalExpenses, setAdditionalExpenses] = useState(0);
  const [remarks, setRemarks] = useState('');
  const [billingDetailsOpen, setBillingDetailsOpen] = useState(false);
  const [billingNo, setBillingNo] = useState('');
  const [billingDate, setBillingDate] = useState('');
  const [billingPacking, setBillingPacking] = useState('');
  const [billingAdda, setBillingAdda] = useState('');
  const [printWithoutBalance, setPrintWithoutBalance] = useState(false);
  const [printWithoutHeader, setPrintWithoutHeader] = useState(false);

  // Payment
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [amountReceived, setAmountReceived] = useState('');
  const [printReceiptAfterSave, setPrintReceiptAfterSave] = useState(true);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Sales History
  const [historyFrom, setHistoryFrom] = useState(today);
  const [historyTo, setHistoryTo] = useState(today);
  const [historyList, setHistoryList] = useState([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyPageSize] = useState(10);
  const [historyLoading, setHistoryLoading] = useState(false);

  // By Invoice No
  const [invoiceNoSearch, setInvoiceNoSearch] = useState('');
  const [invoiceNoLoading, setInvoiceNoLoading] = useState(false);

  // Detail / print
  const [detailInvoice, setDetailInvoice] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const grandTotal = cart.reduce((s, r) => s + Number(r.lineTotal || 0), 0);
  const netTotal = Math.max(0, grandTotal - Number(additionalDiscount) + Number(additionalExpenses));
  const amtReceived = Number(amountReceived) || 0;
  const changeToReturn = Math.max(0, amtReceived - netTotal);
  const balanceDueThisBill = Math.max(0, netTotal - amtReceived);
  const change = changeToReturn;
  const noOfTitles = cart.length;
  const totalQuantity = cart.reduce((s, r) => s + Number(r.quantity || 0), 0);
  const prevBalance = selectedCustomer?.currentBalance != null ? Number(selectedCustomer.currentBalance) : 0;
  const withThisBill = prevBalance + netTotal;

  const searchProducts =
    search.length >= 1
      ? products
          .filter(
            (p) =>
              String(p.code || '').toLowerCase().includes(search.toLowerCase()) ||
              String(p.nameEn || p.name_en || '').toLowerCase().includes(search.toLowerCase())
          )
          .slice(0, 20)
      : [];
  const firstMatch = searchProducts[0];

  const loadProducts = useCallback(() => {
    productsApi.list({}, 0, 500).then((res) => setProducts(res.data?.content || [])).catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (customerInput.length < 2) {
      setCustomerOptions([]);
      return;
    }
    const t = setTimeout(() => {
      customersApi.list(customerInput, 0, 15).then((res) => setCustomerOptions(res.data?.content || [])).catch(() => setCustomerOptions([]));
    }, 200);
    return () => clearTimeout(t);
  }, [customerInput]);

  // Keyboard-first
  useEffect(() => {
    const onKey = (e) => {
      const inInput = ['INPUT', 'TEXTAREA'].includes(e.target?.tagName);
      console.log('KEY pressed - '+ e.key);
      if (e.key === 'Escape') {
        setPaymentOpen(false);
        setDetailOpen(false);
        e.preventDefault();
        return;
      }
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        if (detailOpen && detailInvoice) handlePrint();
        return;
      }
      if (e.key === 'F2') {
        e.preventDefault();
        e.stopPropagation();
        console.log('Search ref exists, focusing...');
        searchRef.current?.focus();
        return;
      }
      if (e.key === 'F4' && cart.length > 0) {
        e.preventDefault();
        setPaymentOpen(true);
        return;
      }
      if (inInput) return;
      if (e.key === 'Enter' && search.trim() && firstMatch) {
        e.preventDefault();
        addToCart(firstMatch, 1);
        setSearch('');
        setFocusedRowIndex(cart.length);
        return;
      }
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        if (cart.length === 0) return;
        const idx = focusedRowIndex >= 0 && focusedRowIndex < cart.length ? focusedRowIndex : cart.length - 1;
        updateQty(cart[idx].productId, 1);
        setFocusedRowIndex(idx);
        return;
      }
      if (e.key === '-') {
        e.preventDefault();
        if (cart.length === 0) return;
        const idx = focusedRowIndex >= 0 && focusedRowIndex < cart.length ? focusedRowIndex : cart.length - 1;
        updateQty(cart[idx].productId, -1);
        setFocusedRowIndex(idx);
        return;
      }
    };

    
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cart.length, focusedRowIndex, firstMatch, search.trim(), detailOpen, detailInvoice]);

  const addToCart = (product, qty = 1) => {
    const existing = cart.find((c) => c.productId === product.productId);
    const price = Number(product.sellingPrice) ?? Number(product.selling_price) ?? 0;
    const stock = product.currentStock != null ? Number(product.currentStock) : null;
    if (existing) {
      setCart(
        cart.map((c) =>
          c.productId === product.productId
            ? {
                ...c,
                quantity: Number(c.quantity) + qty,
                lineTotal: (Number(c.quantity) + qty) * (Number(c.unitPrice) || price),
                currentStock: c.currentStock ?? stock,
              }
            : c
        )
      );
    } else {
      setCart([
        ...cart,
        {
          productId: product.productId,
          productCode: product.code,
          productName: product.nameEn || product.name_en,
          quantity: qty,
          unitPrice: price,
          lineTotal: qty * price,
          currentStock: stock,
        },
      ]);
    }
    setFocusedRowIndex(cart.length);
  };

  const updateQty = (productId, delta) => {
    setCart(
      cart
        .map((c) => {
          if (c.productId !== productId) return c;
          const newQty = Math.max(0, Number(c.quantity) + delta);
          if (newQty === 0) return null;
          return { ...c, quantity: newQty, lineTotal: newQty * Number(c.unitPrice) };
        })
        .filter(Boolean)
    );
  };

  const setQtyDirect = (productId, value) => {
    const num = Math.max(0, Number(value) || 0);
    if (num === 0) {
      setCart(cart.filter((c) => c.productId !== productId));
      return;
    }
    setCart(
      cart.map((c) =>
        c.productId === productId ? { ...c, quantity: num, lineTotal: num * Number(c.unitPrice) } : c
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter((c) => c.productId !== productId));
    setFocusedRowIndex((i) => (i >= cart.length - 1 ? Math.max(-1, cart.length - 2) : i));
  };

  const handleBarcodeOrSearch = (e) => {
    const v = e.target.value.trim();
    if (!v) return;
    const byCode = products.find((p) => String(p.code).toLowerCase() === v.toLowerCase());
    const byId = products.find((p) => String(p.productId) === v);
    const product = byCode || byId;
    if (product) {
      addToCart(product, 1);
      setSearch('');
      e.target.value = '';
    }
  };

  const handleCompleteSale = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    setSuccessMsg('');
    const body = {
      invoiceNumber,
      customerId: isCashCustomer ? null : selectedCustomer?.customerId ?? null,
      invoiceDate,
      invoiceTime: invoiceTime ? (invoiceTime.length === 5 ? `${invoiceTime}:00` : invoiceTime) : null,
      transactionTypeCode: 'SALE',
      deliveryModeId: deliveryModeId || null,
      isCashCustomer: !!isCashCustomer,
      items: cart.map((c) => ({ productId: c.productId, quantity: c.quantity, unitPrice: c.unitPrice })),
      additionalDiscount: Number(additionalDiscount) || 0,
      additionalExpenses: Number(additionalExpenses) || 0,
      amountReceived: amtReceived,
      remarks: remarks.trim() || null,
      billingNo: billingNo.trim() || null,
      billingDate: billingDate || null,
      billingPacking: billingPacking.trim() || null,
      billingAdda: billingAdda.trim() || null,
    };
    try {
      const res = await invoicesApi.create(body);
      setCart([]);
      setAmountReceived('');
      setAdditionalDiscount(0);
      setAdditionalExpenses(0);
      setRemarks('');
      setPaymentOpen(false);
      setFocusedRowIndex(-1);
      setInvoiceNumber(`INV-${Date.now()}`);
      setSuccessMsg('Invoice saved.');
      setTimeout(() => setSuccessMsg(''), 3000);
      if (tab === 1) loadHistory();
      if (printReceiptAfterSave && res?.data) {
        setDetailInvoice(res.data);
        setDetailOpen(true);
        setTimeout(handlePrint, 300);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = useCallback((pageOverride) => {
    const page = pageOverride !== undefined ? pageOverride : historyPage;
    setHistoryLoading(true);
    return invoicesApi
      .list(historyFrom, historyTo, undefined, page, historyPageSize)
      .then((res) => {
        setHistoryList(res.data?.content ?? []);
        setHistoryTotal(res.data?.totalElements ?? 0);
        if (pageOverride !== undefined) setHistoryPage(page);
        return res.data?.content ?? [];
      })
      .catch(() => {
        setHistoryList([]);
        setHistoryTotal(0);
        return [];
      })
      .finally(() => setHistoryLoading(false));
  }, [historyFrom, historyTo, historyPage, historyPageSize]);

  useEffect(() => {
    if (tab === 1) loadHistory();
  }, [tab, loadHistory]);

  const openInvoiceDetail = (inv) => {
    invoicesApi.getById(inv.salesInvoiceId).then((res) => {
      setDetailInvoice(res.data);
      setDetailOpen(true);
    }).catch(() => alert('Failed to load invoice'));
  };

  const handleFirst = () => {
    loadHistory(0);
  };
  const handlePrev = () => {
    const p = Math.max(0, historyPage - 1);
    loadHistory(p);
  };
  const handleNext = () => {
    const p = Math.min(Math.ceil(historyTotal / historyPageSize) - 1, historyPage + 1);
    loadHistory(p);
  };
  const handleLast = () => {
    const lastPage = Math.max(0, Math.ceil(historyTotal / historyPageSize) - 1);
    loadHistory(lastPage);
  };

  const handleFindByNumber = () => {
    const num = invoiceNoSearch?.trim();
    if (!num) {
      alert('Enter invoice number');
      return;
    }
    setInvoiceNoLoading(true);
    invoicesApi
      .getByNumber(num)
      .then((res) => {
        setDetailInvoice(res.data);
        setDetailOpen(true);
      })
      .catch(() => alert('Invoice not found'))
      .finally(() => setInvoiceNoLoading(false));
  };

  const handlePrint = () => {
    if (!detailInvoice) return;
    printInvoice({
      invoice: {
        invoiceNumber: detailInvoice.invoiceNumber,
        invoiceDate: detailInvoice.invoiceDate,
        invoiceTime: detailInvoice.invoiceTime,
        customerName: detailInvoice.customerName || 'Cash Bill',
        remarks: detailInvoice.remarks,
        grandTotal: detailInvoice.grandTotal,
        additionalDiscount: detailInvoice.additionalDiscount,
        additionalExpenses: detailInvoice.additionalExpenses,
        netTotal: detailInvoice.netTotal,
        amountReceived: detailInvoice.amountReceived,
        billingNo: detailInvoice.billingNo,
        billingDate: detailInvoice.billingDate,
        userName: detailInvoice.userName,
      },
      items: detailInvoice.items || [],
      printWithoutHeader: !!printWithoutHeader,
      printWithoutBalance: !!printWithoutBalance,
    });
  };

  const receiptPreviewLines = cart.map((r) => `${r.productName || r.productCode} x${r.quantity} = ${formatMoney(r.lineTotal)}`).join('\n');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 88px)', minHeight: 480 }}>
      {/* Invoice context bar — full business context */}
      <Paper
        elevation={0}
        sx={{
          py: 1,
          px: 2,
          mb: 1,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.06),
          borderRadius: 1,
          border: '1px solid',
          borderColor: alpha(theme.palette.primary.main, 0.2),
        }}
      >
        <Typography variant="body2" fontWeight={700} color="primary">
          Invoice #
        </Typography>
        <Typography variant="body2" sx={{ minWidth: 100 }}>{invoiceNumber}</Typography>
        <TextField type="date" size="small" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: 130 }} />
        <TextField type="time" size="small" value={invoiceTime} onChange={(e) => setInvoiceTime(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: 100 }} />
        <Typography variant="body2" color="text.secondary">Trans.</Typography>
        <Typography variant="body2" fontWeight={600}>{transactionTypeCode}</Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Del. Mode</InputLabel>
          <Select value={deliveryModeId} label="Del. Mode" onChange={(e) => setDeliveryModeId(e.target.value)}>
            {DELIVERY_MODES.map((d) => (
              <MenuItem key={d.deliveryModeId} value={d.deliveryModeId}>{d.modeName}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {successMsg && <Typography variant="caption" color="success.main" fontWeight={600}>{successMsg}</Typography>}
        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
          F2 Search · Enter Add · +/- Qty · F4 Payment · Ctrl+P Print · Esc Close
        </Typography>
      </Paper>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ minHeight: 40, mb: 1 }}>
        <Tab label="Billing" id="pos-tab-0" />
        <Tab label="Sales History" icon={<HistoryIcon />} iconPosition="start" id="pos-tab-1" />
        <Tab label="By Invoice No" icon={<PinIcon />} iconPosition="start" id="pos-tab-2" />
      </Tabs>

      {/* Billing tab — 70/30 split */}
      <Box
        role="region"
        id="pos-panel-0"
        hidden={tab !== 0}
        sx={{
          flex: 1,
          display: tab === 0 ? 'flex' : 'none',
          flexDirection: 'row',
          gap: 1,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {/* LEFT 70% — Product search + Invoice items grid */}
        <Paper
          elevation={2}
          sx={{
            flex: '0 0 70%',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Barcode / Code / Name (F2) — Enter to add"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (firstMatch) {
                    addToCart(firstMatch, 1);
                    setSearch('');
                  }
                }
              }}
              inputRef={searchRef}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiInputBase-input': { py: 0.75 } }}
            />
            {firstMatch && (
              <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                {firstMatch.code} · {firstMatch.nameEn || firstMatch.name_en} · Stock: {formatMoney(firstMatch.currentStock)} · {formatMoney(firstMatch.sellingPrice ?? firstMatch.selling_price)}/u
              </Typography>
            )}
          </Box>
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.primary.main, '& th': { color: 'white', fontWeight: 600, py: 0.75, fontSize: '0.75rem' } }}>
                <TableCell>Sr</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Product</TableCell>
                <TableCell align="right">Stock</TableCell>
                <TableCell align="right">Qty</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="right" width={40}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cart.map((r, idx) => (
                <TableRow
                  key={r.productId}
                  hover
                  selected={focusedRowIndex === idx}
                  onClick={() => setFocusedRowIndex(idx)}
                  sx={{
                    '& td': { py: 0.5, fontSize: '0.8rem' },
                    bgcolor: focusedRowIndex === idx ? alpha(theme.palette.primary.main, 0.08) : undefined,
                  }}
                >
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{r.productCode}</TableCell>
                  <TableCell>{r.productName || r.productCode}</TableCell>
                  <TableCell align="right">
                    <Typography component="span" variant="caption" color={r.currentStock != null && Number(r.currentStock) < 0 ? 'error' : 'textSecondary'}>
                      {r.currentStock != null ? formatMoney(r.currentStock) : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); updateQty(r.productId, -1); }} sx={{ p: 0.25 }}>
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <TextField
                      size="small"
                      type="number"
                      value={r.quantity}
                      onChange={(e) => setQtyDirect(r.productId, e.target.value)}
                      onBlur={(e) => setQtyDirect(r.productId, e.target.value)}
                      inputProps={{ min: 0, step: 0.001, style: { width: 44, textAlign: 'center', padding: '2px 4px' } }}
                      sx={{ width: 52, '& .MuiInputBase-input': { py: 0.25 } }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); updateQty(r.productId, 1); }} sx={{ p: 0.25 }}>
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                  <TableCell align="right">{formatMoney(r.unitPrice)}</TableCell>
                  <TableCell align="right">{formatMoney(r.lineTotal)}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); removeFromCart(r.productId); }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </Box>
          {cart.length === 0 && (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', fontSize: '0.875rem' }}>
              Scan barcode or type code/name and press Enter to add
            </Box>
          )}
        </Paper>

        {/* RIGHT 30% — Customer, totals, payment, sequential nav */}
        <Paper
          elevation={2}
          sx={{
            flex: '0 0 30%',
            minWidth: 280,
            maxWidth: 380,
            p: 1.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            borderRadius: 1,
            overflow: 'auto',
          }}
        >
          <Typography variant="subtitle2" fontWeight={700} color="primary">Customer</Typography>
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={isCashCustomer}
                onChange={(e) => setIsCashCustomer(e.target.checked)}
              />
            }
            label={<Typography variant="body2">Cash Customer</Typography>}
          />
          <Box sx={{ mt: 0.5 }}>
            <Autocomplete
              size="small"
              options={customerOptions}
              getOptionLabel={(o) => `${o.name || o.nameEnglish || ''} ${o.customerCode ? `(${o.customerCode})` : ''}`.trim() || 'Select'}
              value={selectedCustomer}
              inputValue={customerInput}
              onInputChange={(_, v) => setCustomerInput(v)}
              onChange={(_, v) => setSelectedCustomer(v)}
              renderInput={(params) => <TextField {...params} placeholder="Customer name/code" />}
            />
            {selectedCustomer && !isCashCustomer && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', mt: 0.5 }}>
                  <span>Prev. Balance</span>
                  <strong>{formatMoney(prevBalance)}</strong>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span>With this Bill</span>
                  <strong>{formatMoney(withThisBill)}</strong>
                </Box>
              </>
            )}
          </Box>

          <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 1, mt: 0.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span>No. of titles</span>
              <strong>{noOfTitles}</strong>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span>Total qty</span>
              <strong>{totalQuantity}</strong>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', mt: 0.5 }}>
              <span>Grand Total</span>
              <strong>{formatMoney(grandTotal)}</strong>
            </Box>
            <TextField
              size="small"
              type="number"
              label="Add. Disc."
              value={additionalDiscount}
              onChange={(e) => setAdditionalDiscount(e.target.value)}
              sx={{ width: '100%', mt: 0.5 }}
              inputProps={{ min: 0, step: 0.01 }}
            />
            <TextField
              size="small"
              type="number"
              label="Add. Expenses"
              value={additionalExpenses}
              onChange={(e) => setAdditionalExpenses(e.target.value)}
              sx={{ width: '100%', mt: 0.5 }}
              inputProps={{ min: 0, step: 0.01 }}
            />
            <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 1 }}>
              Net Total: {formatMoney(netTotal)}
            </Typography>
          </Box>

          <TextField size="small" fullWidth label="Remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} multiline minRows={1} placeholder="Optional" />

          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            startIcon={<PaymentIcon />}
            onClick={() => setPaymentOpen(true)}
            disabled={cart.length === 0}
            sx={{ py: 1.25, fontWeight: 700 }}
          >
            Complete Sale (F4)
          </Button>

          {/* Billing details collapsible */}
          <Box>
            <Button size="small" startIcon={billingDetailsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />} onClick={() => setBillingDetailsOpen(!billingDetailsOpen)}>
              Billing details
            </Button>
            <Collapse in={billingDetailsOpen}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                <TextField size="small" label="No." value={billingNo} onChange={(e) => setBillingNo(e.target.value)} />
                <TextField size="small" type="date" label="Date" value={billingDate} onChange={(e) => setBillingDate(e.target.value)} InputLabelProps={{ shrink: true }} />
                <TextField size="small" label="Packing" value={billingPacking} onChange={(e) => setBillingPacking(e.target.value)} />
                <TextField size="small" label="Adda" value={billingAdda} onChange={(e) => setBillingAdda(e.target.value)} />
              </Box>
            </Collapse>
          </Box>

          <FormControlLabel control={<Checkbox size="small" checked={printWithoutBalance} onChange={(e) => setPrintWithoutBalance(e.target.checked)} />} label="Print without balance" />
          <FormControlLabel control={<Checkbox size="small" checked={printWithoutHeader} onChange={(e) => setPrintWithoutHeader(e.target.checked)} />} label="Print without header" />

          {/* Sequential navigation */}
          <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 1.5, mt: 1 }}>
            <Typography variant="caption" fontWeight={600} color="text.secondary">Navigate</Typography>
            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
              <TextField type="date" size="small" value={historyFrom} onChange={(e) => setHistoryFrom(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: 110 }} />
              <IconButton size="small" onClick={handleFirst} title="First"><FirstPageIcon /></IconButton>
              <IconButton size="small" onClick={handlePrev} title="Prev"><NavigateBeforeIcon /></IconButton>
              <IconButton size="small" onClick={handleNext} title="Next"><NavigateNextIcon /></IconButton>
              <IconButton size="small" onClick={handleLast} title="Last"><LastPageIcon /></IconButton>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="Invoice #"
                value={invoiceNoSearch}
                onChange={(e) => setInvoiceNoSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFindByNumber()}
                sx={{ flex: 1, minWidth: 0 }}
              />
              <Button size="small" variant="outlined" onClick={handleFindByNumber} disabled={invoiceNoLoading || !invoiceNoSearch?.trim()}>
                Find
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Sales History tab */}
      <Box role="region" id="pos-panel-1" hidden={tab !== 1} sx={{ flex: 1, display: tab === 1 ? 'flex' : 'none', flexDirection: 'column', minHeight: 0 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
          <TextField type="date" size="small" label="From" value={historyFrom} onChange={(e) => setHistoryFrom(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: 130 }} />
          <TextField type="date" size="small" label="To" value={historyTo} onChange={(e) => setHistoryTo(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: 130 }} />
          <Button variant="outlined" size="small" onClick={loadHistory} disabled={historyLoading}>Apply</Button>
        </Box>
        <Paper sx={{ flex: 1, overflow: 'auto' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                <TableCell sx={{ fontWeight: 600 }}>Invoice #</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Net Total</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Received</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historyList.map((inv) => (
                <TableRow key={inv.salesInvoiceId} hover>
                  <TableCell>{inv.invoiceNumber}</TableCell>
                  <TableCell>{inv.invoiceDate}</TableCell>
                  <TableCell>{inv.customerName || 'Cash'}</TableCell>
                  <TableCell align="right">{formatMoney(inv.netTotal)}</TableCell>
                  <TableCell align="right">{formatMoney(inv.amountReceived)}</TableCell>
                  <TableCell align="right">
                    <Button size="small" startIcon={<VisibilityIcon />} onClick={() => invoicesApi.getById(inv.salesInvoiceId).then((r) => { setDetailInvoice(r.data); setDetailOpen(true); })}>View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={historyTotal}
            page={historyPage}
            onPageChange={(_, p) => setHistoryPage(p)}
            rowsPerPage={historyPageSize}
            rowsPerPageOptions={[historyPageSize]}
          />
        </Paper>
      </Box>

      {/* By Invoice No tab */}
      <Box role="region" id="pos-panel-2" hidden={tab !== 2} sx={{ flex: 1, display: tab === 2 ? 'flex' : 'none', flexDirection: 'column', alignItems: 'flex-start', pt: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: '100%', maxWidth: 400 }}>
          <TextField
            fullWidth
            size="small"
            label="Invoice number"
            value={invoiceNoSearch}
            onChange={(e) => setInvoiceNoSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFindByNumber()}
            placeholder="e.g. INV-123 or 34714"
          />
          <Button variant="contained" onClick={handleFindByNumber} disabled={invoiceNoLoading || !invoiceNoSearch?.trim()}>Find</Button>
        </Box>
      </Box>

      {/* Payment modal — with receipt preview */}
      <Dialog open={paymentOpen} onClose={() => !loading && setPaymentOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Payment</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">Net total: {formatMoney(netTotal)}</Typography>
          <TextField
            fullWidth
            label="Amount received"
            type="number"
            value={amountReceived}
            onChange={(e) => setAmountReceived(e.target.value)}
            sx={{ mt: 1 }}
            autoFocus
          />
          {amtReceived > 0 && (
            <>
              {changeToReturn > 0 && (
                <Typography variant="body1" fontWeight={600} sx={{ mt: 1 }}>Change: {formatMoney(changeToReturn)}</Typography>
              )}
              {balanceDueThisBill > 0 && (
                <Typography variant="body1" fontWeight={600} sx={{ mt: 1 }} color="warning.main">Balance due (this bill): {formatMoney(balanceDueThisBill)}</Typography>
              )}
            </>
          )}
          <Box sx={{ mt: 2, p: 1.5, bgcolor: 'grey.100', borderRadius: 1, fontFamily: 'monospace', fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}>
            <Typography variant="caption" fontWeight={600}>Receipt preview</Typography>
            <pre style={{ margin: '4px 0 0', overflow: 'auto', maxHeight: 120 }}>
              {receiptPreviewLines + '\n\nNet: ' + formatMoney(netTotal) + '  Received: ' + formatMoney(amtReceived) + (changeToReturn > 0 ? '  Change: ' + formatMoney(changeToReturn) : balanceDueThisBill > 0 ? '  Balance due: ' + formatMoney(balanceDueThisBill) : '')}
            </pre>
          </Box>
          <FormControlLabel
            control={<Checkbox checked={printReceiptAfterSave} onChange={(e) => setPrintReceiptAfterSave(e.target.checked)} />}
            label="Print receipt after save"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentOpen(false)} disabled={loading}>Cancel (Esc)</Button>
          <Button variant="contained" onClick={handleCompleteSale} disabled={loading || cart.length === 0}>{loading ? 'Saving…' : 'Confirm'}</Button>
        </DialogActions>
      </Dialog>

      {/* Invoice detail — view & print (Ctrl+P) */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Invoice — {detailInvoice?.invoiceNumber}</DialogTitle>
        <DialogContent>
          {detailInvoice && (
            <>
              <Typography variant="body2"><strong>Date</strong> {detailInvoice.invoiceDate} {detailInvoice.invoiceTime != null && `· ${detailInvoice.invoiceTime}`}</Typography>
              <Typography variant="body2"><strong>Customer</strong> {detailInvoice.customerName || 'Cash'}</Typography>
              {detailInvoice.remarks && <Typography variant="body2"><strong>Remarks</strong> {detailInvoice.remarks}</Typography>}
              <Table size="small" sx={{ mt: 2 }}>
                <TableHead>
                  <TableRow><TableCell>Product</TableCell><TableCell align="right">Qty</TableCell><TableCell align="right">Price</TableCell><TableCell align="right">Total</TableCell></TableRow>
                </TableHead>
                <TableBody>
                  {detailInvoice.items?.map((it) => (
                    <TableRow key={it.salesInvoiceItemId}>
                      <TableCell>{it.productCode} — {it.productName}</TableCell>
                      <TableCell align="right">{formatMoney(it.quantity)}</TableCell>
                      <TableCell align="right">{formatMoney(it.unitPrice)}</TableCell>
                      <TableCell align="right">{formatMoney(it.lineTotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Typography variant="body2">Net Total: {formatMoney(detailInvoice.netTotal)}</Typography>
                <Typography variant="body2">Amount Received: {formatMoney(detailInvoice.amountReceived)}</Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Close (Esc)</Button>
          <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint}>Print (Ctrl+P)</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
