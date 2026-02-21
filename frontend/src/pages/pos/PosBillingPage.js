import React, { useState, useRef, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import Collapse from '@mui/material/Collapse';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { alpha } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import PaymentIcon from '@mui/icons-material/Payment';
import HistoryIcon from '@mui/icons-material/History';
import PinIcon from '@mui/icons-material/Pin';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { invoicesApi } from '../../api/invoices';
import { customersApi } from '../../api/customers';
import { productsApi } from '../../api/products';
import { uomApi } from '../../api/uom';
import { formatMoney, formatTime, generateInvoiceNumber } from './posUtils';
import InvoiceHeaderBar from './InvoiceHeaderBar';
import { DATE_INPUT_SX } from './posUtils';
import ProductSearchBar from './ProductSearchBar';
import InvoiceGrid from './InvoiceGrid';
import CustomerPanel from './CustomerPanel';
import TotalsPanel from './TotalsPanel';
import PaymentModal from './PaymentModal';
import InvoiceDetailModal from './InvoiceDetailModal';

const today = new Date().toISOString().slice(0, 10);

export default function PosBillingPage() {
  const theme = useTheme();
  const [tab, setTab] = useState(0);
  const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber);
  const [invoiceDate, setInvoiceDate] = useState(today);
  const [invoiceTime, setInvoiceTime] = useState(formatTime(new Date()));
  const [transactionTypeCode] = useState('SALE');
  const [deliveryModeId, setDeliveryModeId] = useState(1);
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [focusedRowIndex, setFocusedRowIndex] = useState(-1);
  const searchRef = useRef(null);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [customerInput, setCustomerInput] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isCashCustomer, setIsCashCustomer] = useState(true);
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
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [amountReceived, setAmountReceived] = useState('');
  const [printReceiptAfterSave, setPrintReceiptAfterSave] = useState(true);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [historyFrom, setHistoryFrom] = useState(today);
  const [historyTo, setHistoryTo] = useState(today);
  const [historyList, setHistoryList] = useState([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyPageSize] = useState(10);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [invoiceNoSearch, setInvoiceNoSearch] = useState('');
  const [invoiceNoLoading, setInvoiceNoLoading] = useState(false);
  const [detailInvoice, setDetailInvoice] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [uomList, setUomList] = useState([]);
  const [searchHighlightIndex, setSearchHighlightIndex] = useState(0);

  const grandTotal = cart.reduce((s, r) => s + Number(r.lineTotal || 0), 0);
  const netTotal = Math.max(0, grandTotal - Number(additionalDiscount) + Number(additionalExpenses));
  const amtReceived = Number(amountReceived) || 0;
  const change = Math.max(0, amtReceived - netTotal);
  const noOfTitles = cart.length;
  const totalQuantity = cart.reduce((s, r) => s + Number(r.quantity || 0), 0);
  const prevBalance = selectedCustomer && selectedCustomer.currentBalance != null ? Number(selectedCustomer.currentBalance) : 0;
  const withThisBill = prevBalance + netTotal;

  const searchProducts = search.length >= 1
    ? products.filter(function (p) {
        const code = String(p.code || '').toLowerCase();
        const name = String(p.nameEn || p.name_en || '').toLowerCase();
        const q = search.toLowerCase();
        return code.includes(q) || name.includes(q);
      }).slice(0, 20)
    : [];
  const firstMatch = searchProducts[0];
  const safeHighlightIndex = Math.min(Math.max(0, searchHighlightIndex), Math.max(0, searchProducts.length - 1));

  const loadProducts = useCallback(function () {
    productsApi.list({}, 0, 500).then(function (res) {
      setProducts(res.data && res.data.content ? res.data.content : []);
    }).catch(function () { setProducts([]); });
  }, []);

  useEffect(function () { loadProducts(); }, [loadProducts]);
  useEffect(function () {
    uomApi.list().then(function (res) { setUomList(res.data || []); }).catch(function () { setUomList([]); });
  }, []);
  useEffect(function () { setSearchHighlightIndex(0); }, [search]);

  useEffect(function () {
    if (customerInput.length < 2) {
      setCustomerOptions([]);
      return;
    }
    const t = setTimeout(function () {
      customersApi.list(customerInput, 0, 15).then(function (res) {
        setCustomerOptions(res.data && res.data.content ? res.data.content : []);
      }).catch(function () { setCustomerOptions([]); });
    }, 200);
    return function () { clearTimeout(t); };
  }, [customerInput]);

  useEffect(function () {
    console.log('POS key listener attached');
    function onKey(e) {
      console.log('KEY pressed - ' + e.key); // This should now print
      const inInput = e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA');
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
        if (tab === 0) {
          setTimeout(function () {
            var wrapper = searchRef.current;
            if (!wrapper) return;
            var input = wrapper.querySelector ? wrapper.querySelector('input') : null;
            if (input && typeof input.focus === 'function') input.focus();
          }, 0);
        }
        return;
      }
      if (e.key === 'F4' && cart.length > 0) {
        e.preventDefault();
        setPaymentOpen(true);
        return;
      }
      if (inInput) return;
      if (e.key === 'Enter' && search.trim() && searchProducts.length > 0) {
        e.preventDefault();
        var toAdd = searchProducts[safeHighlightIndex] || searchProducts[0];
        if (toAdd) { addToCart(toAdd, 1); setSearch(''); setSearchHighlightIndex(0); setFocusedRowIndex(cart.length); }
        return;
      }
      if ((e.key === '+' || e.key === '=') && cart.length > 0) {
        e.preventDefault();
        const idx = focusedRowIndex >= 0 && focusedRowIndex < cart.length ? focusedRowIndex : cart.length - 1;
        updateQty(cart[idx].productId, 1);
        setFocusedRowIndex(idx);
        return;
      }
      if (e.key === '-' && cart.length > 0) {
        e.preventDefault();
        const idx = focusedRowIndex >= 0 && focusedRowIndex < cart.length ? focusedRowIndex : cart.length - 1;
        updateQty(cart[idx].productId, -1);
        setFocusedRowIndex(idx);
        return;
      }
    }
    var useCapture = true;
    document.addEventListener('keydown', onKey, useCapture);
    window.addEventListener('keydown', onKey, useCapture);
    return function () {
      document.removeEventListener('keydown', onKey, useCapture);
      window.removeEventListener('keydown', onKey, useCapture);
    };
  }, [tab, cart.length, focusedRowIndex, searchProducts, safeHighlightIndex, search.trim(), detailOpen, detailInvoice]);

  function addToCart(product, qty) {
    qty = qty || 1;
    const existing = cart.find(function (c) { return c.productId === product.productId; });
    const price = Number(product.sellingPrice) || Number(product.selling_price) || 0;
    const stock = product.currentStock != null ? Number(product.currentStock) : null;
    if (existing) {
      setCart(cart.map(function (c) {
        if (c.productId !== product.productId) return c;
        const newQty = Number(c.quantity) + qty;
        return { ...c, quantity: newQty, lineTotal: newQty * (Number(c.unitPrice) || price), currentStock: c.currentStock != null ? c.currentStock : stock };
      }));
    } else {
      const uomId = product.uomId != null ? product.uomId : (uomList[0] && uomList[0].uomId);
      const uomName = product.uomName || (uomList.find(function (u) { return u.uomId === uomId; }) && uomList.find(function (u) { return u.uomId === uomId; }).name) || '—';
      setCart([...cart, { productId: product.productId, productCode: product.code, productName: product.nameEn || product.name_en, quantity: qty, unitPrice: price, lineTotal: qty * price, currentStock: stock, uomId: uomId, uomName: uomName }]);
    }
    setFocusedRowIndex(cart.length);
  }

  function updateQty(productId, delta) {
    setCart(cart.map(function (c) {
      if (c.productId !== productId) return c;
      const newQty = Math.max(0, Number(c.quantity) + delta);
      if (newQty === 0) return null;
      return { ...c, quantity: newQty, lineTotal: newQty * Number(c.unitPrice) };
    }).filter(Boolean));
  }

  function setQtyDirect(productId, value) {
    const num = Math.max(0, Number(value) || 0);
    if (num === 0) {
      setCart(cart.filter(function (c) { return c.productId !== productId; }));
      return;
    }
    setCart(cart.map(function (c) {
      if (c.productId !== productId) return c;
      return { ...c, quantity: num, lineTotal: num * Number(c.unitPrice) };
    }));
  }

  function setUnit(productId, uomId) {
    const uom = uomList.find(function (u) { return u.uomId === uomId; });
    if (!uom) return;
    setCart(cart.map(function (c) {
      if (c.productId !== productId) return c;
      return { ...c, uomId: uom.uomId, uomName: uom.name };
    }));
  }

  function removeFromCart(productId) {
    setCart(cart.filter(function (c) { return c.productId !== productId; }));
    setFocusedRowIndex(function (i) { return i >= cart.length - 1 ? Math.max(-1, cart.length - 2) : i; });
  }

  function handleSearchKeyDown(e) {
    if (e.key === 'Escape' && search.trim()) {
      e.preventDefault();
      e.stopPropagation();
      setSearch('');
      setSearchHighlightIndex(0);
      return;
    }
    if (e.key === 'ArrowDown' && searchProducts.length > 0) {
      e.preventDefault();
      setSearchHighlightIndex(function (i) { return Math.min(i + 1, searchProducts.length - 1); });
      return;
    }
    if (e.key === 'ArrowUp' && searchProducts.length > 0) {
      e.preventDefault();
      setSearchHighlightIndex(function (i) { return Math.max(0, i - 1); });
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchProducts.length > 0) {
        var toAdd = searchProducts[safeHighlightIndex] || searchProducts[0];
        if (toAdd) {
          addToCart(toAdd, 1);
          setSearch('');
          setSearchHighlightIndex(0);
        }
      }
    }
  }

  function handleCompleteSale() {
    if (cart.length === 0) return;
    setLoading(true);
    setSuccessMsg('');
    const body = {
      invoiceNumber,
      customerId: isCashCustomer ? null : (selectedCustomer && selectedCustomer.customerId) || null,
      invoiceDate,
      invoiceTime: invoiceTime ? (invoiceTime.length === 5 ? invoiceTime + ':00' : invoiceTime) : null,
      transactionTypeCode: 'SALE',
      deliveryModeId: deliveryModeId != null ? Number(deliveryModeId) : null,
      isCashCustomer: !!isCashCustomer,
      items: cart.map(function (c) { return { productId: c.productId, quantity: c.quantity, unitPrice: c.unitPrice, uomId: c.uomId || null }; }),
      additionalDiscount: Number(additionalDiscount) || 0,
      additionalExpenses: Number(additionalExpenses) || 0,
      amountReceived: amtReceived,
      remarks: remarks.trim() || null,
      billingNo: billingNo.trim() || null,
      billingDate: billingDate || null,
      billingPacking: billingPacking.trim() || null,
      billingAdda: billingAdda.trim() || null,
    };
    invoicesApi.create(body).then(function (res) {
      setCart([]);
      setAmountReceived('');
      setAdditionalDiscount(0);
      setAdditionalExpenses(0);
      setRemarks('');
      setPaymentOpen(false);
      setFocusedRowIndex(-1);
      setInvoiceNumber(generateInvoiceNumber());
      setSuccessMsg('Invoice saved.');
      setTimeout(function () { setSuccessMsg(''); }, 3000);
      if (tab === 1) loadHistory();
      if (printReceiptAfterSave && res && res.data) {
        setDetailInvoice(res.data);
        setDetailOpen(true);
        setTimeout(handlePrint, 300);
      }
    }).catch(function (err) {
      alert((err.response && err.response.data && err.response.data.message) || 'Failed to create invoice');
    }).finally(function () { setLoading(false); });
  }

  const loadHistory = useCallback(function (pageOverride) {
    const page = pageOverride !== undefined ? pageOverride : historyPage;
    setHistoryLoading(true);
    return invoicesApi.list(historyFrom, historyTo, undefined, page, historyPageSize)
      .then(function (res) {
        setHistoryList(res.data && res.data.content ? res.data.content : []);
        setHistoryTotal(res.data && res.data.totalElements != null ? res.data.totalElements : 0);
        if (pageOverride !== undefined) setHistoryPage(page);
        return res.data && res.data.content ? res.data.content : [];
      })
      .catch(function () {
        setHistoryList([]);
        setHistoryTotal(0);
        return [];
      })
      .finally(function () { setHistoryLoading(false); });
  }, [historyFrom, historyTo, historyPage, historyPageSize]);

  useEffect(function () {
    if (tab === 1) loadHistory();
  }, [tab, loadHistory]);

  function handleFirst() { loadHistory(0); }
  function handlePrev() { loadHistory(Math.max(0, historyPage - 1)); }
  function handleNext() { loadHistory(Math.min(Math.ceil(historyTotal / historyPageSize) - 1, historyPage + 1)); }
  function handleLast() {
    const lastPage = Math.max(0, Math.ceil(historyTotal / historyPageSize) - 1);
    loadHistory(lastPage);
  }

  function handleFindByNumber() {
    const num = invoiceNoSearch && invoiceNoSearch.trim();
    if (!num) {
      alert('Enter invoice number');
      return;
    }
    setInvoiceNoLoading(true);
    invoicesApi.getByNumber(num).then(function (res) {
      setDetailInvoice(res.data);
      setDetailOpen(true);
    }).catch(function () { alert('Invoice not found'); }).finally(function () { setInvoiceNoLoading(false); });
  }

  function handlePrint() {
    if (!detailInvoice) return;
    const items = detailInvoice.items || [];
    const rows = items.map(function (it) {
      return '<tr><td>' + it.productCode + ' - ' + it.productName + '</td><td class="right">' + formatMoney(it.quantity) + '</td><td class="right">' + formatMoney(it.unitPrice) + '</td><td class="right">' + formatMoney(it.lineTotal) + '</td></tr>';
    }).join('');
    const header = printWithoutHeader ? '' : '<div class="header"><strong>INVOICE</strong><br/>' + detailInvoice.invoiceNumber + '</div>';
    const balance = printWithoutBalance ? '' : '<p>Amount Received: ' + formatMoney(detailInvoice.amountReceived) + '</p>';
    const html = '<!DOCTYPE html><html><head><title>Invoice ' + detailInvoice.invoiceNumber + '</title><style>body{font-family:system-ui,sans-serif;padding:16px;max-width:560px;margin:0 auto;font-size:13px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:6px;text-align:left}th{background:#f0f0f0}.right{text-align:right}.header{text-align:center;margin-bottom:12px}</style></head><body>' + header + '<p><strong>Date</strong> ' + detailInvoice.invoiceDate + (detailInvoice.invoiceTime ? ' ' + detailInvoice.invoiceTime : '') + ' <strong>Customer</strong> ' + (detailInvoice.customerName || 'Cash') + '</p>' + (detailInvoice.remarks ? '<p><strong>Remarks:</strong> ' + detailInvoice.remarks + '</p>' : '') + '<table><thead><tr><th>Product</th><th class="right">Qty</th><th class="right">Price</th><th class="right">Total</th></tr></thead><tbody>' + rows + '</tbody></table><p style="text-align:right;margin-top:12px">Net Total: <strong>' + formatMoney(detailInvoice.netTotal) + '</strong></p>' + balance + '</body></html>';
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.print();
    win.close();
  }

  const receiptPreviewLines = cart.map(function (r) {
    return (r.productName || r.productCode) + ' x' + r.quantity + ' = ' + formatMoney(r.lineTotal);
  }).join('\n');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 88px)', minHeight: 480, minWidth: 0, overflow: 'hidden' }}>
      <InvoiceHeaderBar
        invoiceNumber={invoiceNumber}
        invoiceDate={invoiceDate}
        invoiceTime={invoiceTime}
        transactionTypeCode={transactionTypeCode}
        deliveryModeId={deliveryModeId}
        successMsg={successMsg}
        onDateChange={setInvoiceDate}
        onTimeChange={setInvoiceTime}
        onDeliveryModeChange={setDeliveryModeId}
      />
      <Tabs value={tab} onChange={function (_, v) { setTab(v); }} sx={{ minHeight: 40, mb: 1 }}>
        <Tab label="Billing" id="pos-tab-0" />
        <Tab label="Sales History" icon={<HistoryIcon />} iconPosition="start" id="pos-tab-1" />
        <Tab label="By Invoice No" icon={<PinIcon />} iconPosition="start" id="pos-tab-2" />
      </Tabs>
      <Box role="region" id="pos-panel-0" hidden={tab !== 0} sx={{ flex: 1, display: tab === 0 ? 'flex' : 'none', flexDirection: { xs: 'column', md: 'row' }, gap: 1, minHeight: 0, overflow: 'hidden' }}>
        <Paper elevation={2} sx={{ flex: tab === 0 ? '1 1 70%' : '1 1 100%', display: 'flex', flexDirection: 'column', minWidth: 0, borderRadius: 1, overflow: 'hidden' }}>
          <Box ref={searchRef} sx={{ display: 'contents' }}>
            <ProductSearchBar
              search={search}
              onSearchChange={setSearch}
              searchResults={searchProducts}
              highlightedIndex={safeHighlightIndex}
              onSelectProduct={function (p) { addToCart(p, 1); setSearch(''); setSearchHighlightIndex(0); setFocusedRowIndex(cart.length); }}
              onCloseDropdown={function () { setSearch(''); setSearchHighlightIndex(0); }}
              onKeyDown={handleSearchKeyDown}
            />
          </Box>
          <InvoiceGrid cart={cart} focusedRowIndex={focusedRowIndex} onRowClick={setFocusedRowIndex} onQtyChange={updateQty} onQtyDirect={setQtyDirect} onRemove={removeFromCart} uomList={uomList} onUnitChange={setUnit} />
        </Paper>
        <Paper elevation={2} sx={{ flex: '0 0 30%', minWidth: 260, maxWidth: 380, p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5, borderRadius: 1, overflow: 'auto', overflowX: 'hidden' }}>
          <CustomerPanel
            isCashCustomer={isCashCustomer}
            onCashCustomerChange={function (v) { setIsCashCustomer(v); if (v) { setSelectedCustomer(null); setCustomerInput(''); } }}
            selectedCustomer={selectedCustomer}
            customerOptions={customerOptions}
            customerInput={customerInput}
            onCustomerInputChange={setCustomerInput}
            onCustomerChange={setSelectedCustomer}
            prevBalance={prevBalance}
            withThisBill={withThisBill}
          />
          <TotalsPanel noOfTitles={noOfTitles} totalQuantity={totalQuantity} grandTotal={grandTotal} additionalDiscount={additionalDiscount} additionalExpenses={additionalExpenses} netTotal={netTotal} onDiscountChange={setAdditionalDiscount} onExpensesChange={setAdditionalExpenses} />
          <TextField size="small" fullWidth label="Remarks" value={remarks} onChange={function (e) { setRemarks(e.target.value); }} multiline minRows={1} placeholder="Optional" />
          <Button fullWidth variant="contained" color="primary" size="large" startIcon={<PaymentIcon />} onClick={function () { setPaymentOpen(true); }} disabled={cart.length === 0} sx={{ py: 1.5, fontWeight: 700, minHeight: 48 }}>Complete Sale (F4)</Button>
          <Box>
            <Button size="small" startIcon={billingDetailsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />} onClick={function () { setBillingDetailsOpen(!billingDetailsOpen); }}>Billing details</Button>
            <Collapse in={billingDetailsOpen}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 0.5 }}>
                <TextField size="small" label="No." value={billingNo} onChange={function (e) { setBillingNo(e.target.value); }} />
                <TextField size="small" type="date" label="Date" value={billingDate} onChange={function (e) { setBillingDate(e.target.value); }} InputLabelProps={{ shrink: true }} sx={DATE_INPUT_SX} />
                <TextField size="small" label="Packing" value={billingPacking} onChange={function (e) { setBillingPacking(e.target.value); }} />
                <TextField size="small" label="Adda" value={billingAdda} onChange={function (e) { setBillingAdda(e.target.value); }} />
              </Box>
            </Collapse>
          </Box>
          <FormControlLabel control={<Checkbox size="small" checked={printWithoutBalance} onChange={function (e) { setPrintWithoutBalance(e.target.checked); }} />} label="Print without balance" />
          <FormControlLabel control={<Checkbox size="small" checked={printWithoutHeader} onChange={function (e) { setPrintWithoutHeader(e.target.checked); }} />} label="Print without header" />
        </Paper>
      </Box>
      <Box role="region" id="pos-panel-1" hidden={tab !== 1} sx={{ flex: 1, display: tab === 1 ? 'flex' : 'none', flexDirection: 'column', minHeight: 0 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
          <TextField type="date" size="small" label="From" value={historyFrom} onChange={function (e) { setHistoryFrom(e.target.value); }} InputLabelProps={{ shrink: true }} sx={DATE_INPUT_SX} />
          <TextField type="date" size="small" label="To" value={historyTo} onChange={function (e) { setHistoryTo(e.target.value); }} InputLabelProps={{ shrink: true }} sx={DATE_INPUT_SX} />
          <Button variant="outlined" size="small" onClick={function () { loadHistory(); }} disabled={historyLoading}>Apply</Button>
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
              {historyList.map(function (inv) {
                return (
                  <TableRow key={inv.salesInvoiceId} hover>
                    <TableCell>{inv.invoiceNumber}</TableCell>
                    <TableCell>{inv.invoiceDate}</TableCell>
                    <TableCell>{inv.customerName || 'Cash'}</TableCell>
                    <TableCell align="right">{formatMoney(inv.netTotal)}</TableCell>
                    <TableCell align="right">{formatMoney(inv.amountReceived)}</TableCell>
                    <TableCell align="right">
                      <Button size="small" startIcon={<VisibilityIcon />} onClick={function () { invoicesApi.getById(inv.salesInvoiceId).then(function (r) { setDetailInvoice(r.data); setDetailOpen(true); }); }}>View</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <TablePagination component="div" count={historyTotal} page={historyPage} onPageChange={function (_, p) { setHistoryPage(p); }} rowsPerPage={historyPageSize} rowsPerPageOptions={[historyPageSize]} />
        </Paper>
      </Box>
      <Box role="region" id="pos-panel-2" hidden={tab !== 2} sx={{ flex: 1, display: tab === 2 ? 'flex' : 'none', flexDirection: 'column', alignItems: 'flex-start', pt: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: '100%', maxWidth: 400 }}>
          <TextField fullWidth size="small" label="Invoice number" value={invoiceNoSearch} onChange={function (e) { setInvoiceNoSearch(e.target.value); }} onKeyDown={function (e) { if (e.key === 'Enter') handleFindByNumber(); }} placeholder="e.g. INV-123 or 34714" />
          <Button variant="contained" onClick={handleFindByNumber} disabled={invoiceNoLoading || !invoiceNoSearch.trim()}>Find</Button>
        </Box>
      </Box>
      <PaymentModal open={paymentOpen} onClose={function () { if (!loading) setPaymentOpen(false); }} netTotal={netTotal} amountReceived={amountReceived} onAmountChange={setAmountReceived} change={change} receiptPreviewLines={receiptPreviewLines} printReceiptAfterSave={printReceiptAfterSave} onPrintReceiptChange={setPrintReceiptAfterSave} onConfirm={handleCompleteSale} loading={loading} cartLength={cart.length} />
      <InvoiceDetailModal open={detailOpen} onClose={function () { setDetailOpen(false); }} invoice={detailInvoice} onPrint={handlePrint} />
    </Box>
  );
}
