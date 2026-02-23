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
import { alpha } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import HistoryIcon from '@mui/icons-material/History';
import PinIcon from '@mui/icons-material/Pin';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { invoicesApi } from '../../api/invoices';
import { customersApi } from '../../api/customers';
import { productsApi } from '../../api/products';
import { uomApi } from '../../api/uom';
import { formatMoney, formatTime, generateInvoiceNumber } from './posUtils';
import InvoiceTopBar from './InvoiceTopBar';
import CustomerStrip from './CustomerStrip';
import InvoiceBottomStrip from './InvoiceBottomStrip';
import InvoiceBottomPanel from './InvoiceBottomPanel';
import { DATE_INPUT_SX } from './posUtils';
import ProductSearchBar from './ProductSearchBar';
import InvoiceGrid from './InvoiceGrid';
import PaymentModal from './PaymentModal';
import InvoiceDetailModal from './InvoiceDetailModal';
import ProductSearchModal from './ProductSearchModal';
import SoldHistoryPanel from './SoldHistoryPanel';

const today = new Date().toISOString().slice(0, 10);

export default function PosBillingPage() {
  const theme = useTheme();
  const [tab, setTab] = useState(0);
  const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber);
  const [invoiceDate, setInvoiceDate] = useState(today);
  const [invoiceTime, setInvoiceTime] = useState(formatTime(new Date()));
  const [transactionTypeCode, setTransactionTypeCode] = useState('SALE');
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
  const [productSearchModalOpen, setProductSearchModalOpen] = useState(false);

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
    customersApi.list('', 0, 200).then(function (res) {
      setCustomerOptions(res.data && res.data.content ? res.data.content : []);
    }).catch(function () { setCustomerOptions([]); });
  }, []);

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
          if (productSearchModalOpen) {
            setProductSearchModalOpen(false);
          } else {
            setProductSearchModalOpen(true);
          }
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
  }, [tab, cart.length, focusedRowIndex, searchProducts, safeHighlightIndex, search.trim(), detailOpen, detailInvoice, productSearchModalOpen]);

  function addToCart(product, qty) {
    qty = qty || 1;
    console.log('Adding product:', product);
    const existing = cart.find(function (c) { return c.productId === product.productId; });
    const price = Number(product.sellingPrice) || Number(product.selling_price) || 0;
    const stock = product.currentStock != null ? Number(product.currentStock) : null;
    let nextCart;
    if (existing) {
      nextCart = cart.map(function (c) {
        if (c.productId !== product.productId) return c;
        const newQty = Number(c.quantity) + qty;
        return { ...c, quantity: newQty, lineTotal: newQty * (Number(c.unitPrice) || price), currentStock: c.currentStock != null ? c.currentStock : stock };
      });
    } else {
      const uomId = product.uomId != null ? product.uomId : (uomList[0] && uomList[0].uomId);
      const uomName = product.uomName || (uomList.find(function (u) { return u.uomId === uomId; }) && uomList.find(function (u) { return u.uomId === uomId; }).name) || '—';
      nextCart = [...cart, { productId: product.productId, productCode: product.code, productName: product.nameEn || product.name_en, quantity: qty, unitPrice: price, lineTotal: qty * price, currentStock: stock, uomId: uomId, uomName: uomName }];
    }
    setCart(nextCart);
    console.log('Updated cart:', nextCart);
    setFocusedRowIndex(nextCart.length - 1);
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

  function clearScreen() {
    setCart([]);
    setAmountReceived('');
    setAdditionalDiscount(0);
    setAdditionalExpenses(0);
    setRemarks('');
    setPaymentOpen(false);
    setFocusedRowIndex(-1);
    setInvoiceNumber(generateInvoiceNumber());
    setBillingNo('');
    setBillingDate('');
    setBillingPacking('');
    setBillingAdda('');
  }

  function handleSaveDraft() {
    if (cart.length === 0) return;
    setLoading(true);
    setSuccessMsg('');
    const body = {
      invoiceNumber,
      customerId: isCashCustomer ? null : (selectedCustomer && selectedCustomer.customerId) || null,
      invoiceDate,
      invoiceTime: invoiceTime ? (invoiceTime.length === 5 ? invoiceTime + ':00' : invoiceTime) : null,
      transactionTypeCode: transactionTypeCode || 'SALE',
      deliveryModeId: deliveryModeId != null ? Number(deliveryModeId) : null,
      isCashCustomer: !!isCashCustomer,
      items: cart.map(function (c) { return { productId: c.productId, quantity: c.quantity, unitPrice: c.unitPrice, uomId: c.uomId || null }; }),
      additionalDiscount: Number(additionalDiscount) || 0,
      additionalExpenses: Number(additionalExpenses) || 0,
      amountReceived: 0,
      changeReturned: 0,
      saveAsDraft: true,
      printWithoutHeader: !!printWithoutHeader,
      printWithoutBalance: !!printWithoutBalance,
      remarks: remarks.trim() || null,
      billingNo: billingNo.trim() || null,
      billingDate: billingDate || null,
      billingPacking: billingPacking.trim() || null,
      billingAdda: billingAdda.trim() || null,
    };
    invoicesApi.create(body).then(function (res) {
      clearScreen();
      setSuccessMsg('Draft saved.');
      setTimeout(function () { setSuccessMsg(''); }, 3000);
      if (tab === 1) loadHistory();
    }).catch(function (err) {
      alert((err.response && err.response.data && err.response.data.message) || 'Failed to save draft');
    }).finally(function () { setLoading(false); });
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
      transactionTypeCode: transactionTypeCode || 'SALE',
      deliveryModeId: deliveryModeId != null ? Number(deliveryModeId) : null,
      isCashCustomer: !!isCashCustomer,
      items: cart.map(function (c) { return { productId: c.productId, quantity: c.quantity, unitPrice: c.unitPrice, uomId: c.uomId || null }; }),
      additionalDiscount: Number(additionalDiscount) || 0,
      additionalExpenses: Number(additionalExpenses) || 0,
      amountReceived: amtReceived,
      changeReturned: change,
      saveAsDraft: false,
      printWithoutHeader: !!printWithoutHeader,
      printWithoutBalance: !!printWithoutBalance,
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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 88px)', minHeight: 480 }}>
      <Tabs value={tab} onChange={function (_, v) { setTab(v); }} sx={{ minHeight: 40, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Billing" id="pos-tab-0" />
        <Tab label="Sales History" icon={<HistoryIcon />} iconPosition="start" id="pos-tab-1" />
        <Tab label="By Invoice No" icon={<PinIcon />} iconPosition="start" id="pos-tab-2" />
      </Tabs>
      <Box role="region" id="pos-panel-0" hidden={tab !== 0} sx={{ flex: 1, display: tab === 0 ? 'flex' : 'none', flexDirection: 'column', minHeight: 0, overflow: 'auto' }}>
        <InvoiceTopBar
          invoiceNumber={invoiceNumber}
          invoiceDate={invoiceDate}
          invoiceTime={invoiceTime}
          transactionTypeCode={transactionTypeCode}
          deliveryModeId={deliveryModeId}
          onDateChange={setInvoiceDate}
          onTimeChange={setInvoiceTime}
          onTransactionTypeChange={setTransactionTypeCode}
          onDeliveryModeChange={setDeliveryModeId}
          onClear={clearScreen}
          isCashCustomer={isCashCustomer}
          onCashCustomerChange={function (v) { setIsCashCustomer(v); if (v) { setSelectedCustomer(null); setCustomerInput(''); } }}
        />
        <Box sx={{ px: { xs: 1, md: 2 } }}>
          <CustomerStrip
            isCashCustomer={isCashCustomer}
            onCashCustomerChange={function (v) { setIsCashCustomer(v); if (v) { setSelectedCustomer(null); setCustomerInput(''); } }}
            selectedCustomer={selectedCustomer}
            customerOptions={customerOptions}
            customerInput={customerInput}
            onCustomerInputChange={setCustomerInput}
            onCustomerChange={setSelectedCustomer}
            prevBalance={prevBalance}
            withThisBill={withThisBill}
            netTotal={netTotal}
          />
        </Box>
        <Paper elevation={0} sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, mx: { xs: 1, md: 2 }, mb: 1, borderRadius: 2, overflow: 'hidden', boxShadow: theme.palette.mode === 'dark' ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.08)' }}>
          <Box ref={searchRef}>
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
          <Box sx={{ flexShrink: 0, height: 320, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <InvoiceGrid cartItems={cart} cart={cart} focusedRowIndex={focusedRowIndex} onRowClick={setFocusedRowIndex} onQtyChange={updateQty} onQtyDirect={setQtyDirect} onRemove={removeFromCart} uomList={uomList} onUnitChange={setUnit} />
          </Box>
          <Box sx={{ flexShrink: 0 }}>
            <InvoiceBottomStrip
            noOfTitles={noOfTitles}
            totalQuantity={totalQuantity}
            grandTotal={grandTotal}
            additionalDiscount={additionalDiscount}
            additionalExpenses={additionalExpenses}
            netTotal={netTotal}
            onDiscountChange={setAdditionalDiscount}
            onExpensesChange={setAdditionalExpenses}
            />
          </Box>
          <Box sx={{ px: 1, pb: 1, flexShrink: 0 }}>
            <SoldHistoryPanel
              productId={focusedRowIndex >= 0 && cart[focusedRowIndex] ? cart[focusedRowIndex].productId : null}
              productCode={focusedRowIndex >= 0 && cart[focusedRowIndex] ? cart[focusedRowIndex].productCode : null}
              productName={focusedRowIndex >= 0 && cart[focusedRowIndex] ? cart[focusedRowIndex].productName : null}
              customerId={selectedCustomer && selectedCustomer.customerId}
              productsApiGetLastSale={function (pid, cid) { return productsApi.getLastSale(pid, cid); }}
            />
          </Box>
        </Paper>
        <Box sx={{ px: { xs: 1, md: 2 }, pb: 2 }}>
          <InvoiceBottomPanel
            billingNo={billingNo}
            billingDate={billingDate}
            billingPacking={billingPacking}
            billingAdda={billingAdda}
            remarks={remarks}
            printWithoutBalance={printWithoutBalance}
            printWithoutHeader={printWithoutHeader}
            onBillingNoChange={setBillingNo}
            onBillingDateChange={setBillingDate}
            onBillingPackingChange={setBillingPacking}
            onBillingAddaChange={setBillingAdda}
            onRemarksChange={setRemarks}
            onPrintWithoutBalanceChange={setPrintWithoutBalance}
            onPrintWithoutHeaderChange={setPrintWithoutHeader}
            onCompleteSale={function () { setPaymentOpen(true); }}
            completeDisabled={cart.length === 0}
            loading={loading}
          />
          {successMsg && <Typography variant="caption" color="success.main" fontWeight={600} sx={{ display: 'block', mt: 1 }}>{successMsg}</Typography>}
        </Box>
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
      <ProductSearchModal
        open={productSearchModalOpen}
        onClose={function () { setProductSearchModalOpen(false); }}
        products={products}
        uomList={uomList}
        onSelectProduct={function (p) { addToCart(p, 1); setProductSearchModalOpen(false); setFocusedRowIndex(cart.length); }}
      />
    </Box>
  );
}
