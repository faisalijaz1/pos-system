/**
 * By Invoice No tab — Order replication with price intelligence.
 * VERTICAL STACK layout: full-width sections so tables display all columns properly.
 */
import React, { useState, useCallback, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import PrintIcon from '@mui/icons-material/Print';
import { invoicesApi } from '../../api/invoices';
import { productsApi } from '../../api/products';
import { customersApi } from '../../api/customers';
import { formatMoney } from './posUtils';
import { printInvoice } from './printTemplate';
import InvoiceSearchHeader from './InvoiceSearchHeader';
import HistoricalOrderPanel from './HistoricalOrderPanel';
import PriceComparisonPanel from './PriceComparisonPanel';
import PriceImpactCalculator from './PriceImpactCalculator';
import NewOrderPanel from './NewOrderPanel';
import BillingPaymentPanel from './BillingPaymentPanel';
import CustomerSearchModal from './CustomerSearchModal';
import PriceHistoryModal from './PriceHistoryModal';
import PreviewOrderDialog from './PreviewOrderDialog';

const today = new Date().toISOString().slice(0, 10);

function buildReplicationItems(invoice, currentPricesMap) {
  if (!invoice || !invoice.items || !currentPricesMap) return [];
  return invoice.items.map((it) => {
    const productId = it.productId;
    const oldPrice = Number(it.unitPrice) || 0;
    const product = currentPricesMap[productId];
    const uomId = it.uomId || product?.uomId;
    const uomEntry = (product?.uomPrices || []).find((e) => e.uomId === uomId);
    const newPrice =
      uomEntry != null ? Number(uomEntry.price) : (product != null && product.sellingPrice != null ? Number(product.sellingPrice) : oldPrice);
    const qty = Number(it.quantity) || 0;
    return {
      ...it,
      productId,
      productCode: it.productCode,
      productName: it.productName,
      quantity: qty,
      oldPrice,
      newPrice,
      useNewPrice: true,
      unitPrice: newPrice,
      lineTotal: qty * newPrice,
      uomId: uomId || product?.uomId,
      uomName: product?.uomName ?? it.uomName ?? '—',
      currentStock: product?.currentStock != null ? Number(product.currentStock) : null,
      brandName: product?.brandName ?? it.brandName ?? null,
    };
  });
}

function recalcLineTotals(items) {
  return items.map((it) => ({
    ...it,
    unitPrice: it.useNewPrice ? it.newPrice : it.oldPrice,
    lineTotal: (Number(it.quantity) || 0) * (it.useNewPrice ? it.newPrice : it.oldPrice),
  }));
}

export default function ByInvoiceNoPage({ onCreated, onEnd, onNotify, onOpenPaymentBeforeCreate }) {
  const [invoiceNoInput, setInvoiceNoInput] = useState('');
  const [historicalInvoice, setHistoricalInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [replicationItems, setReplicationItems] = useState([]);
  const [newInvoiceNumber, setNewInvoiceNumber] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerPrevBalance, setCustomerPrevBalance] = useState(0);
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [soldHistory, setSoldHistory] = useState([]);
  const [customersList, setCustomersList] = useState([]);
  const [isCashCustomer, setIsCashCustomer] = useState(false);
  const [priceHistoryOpen, setPriceHistoryOpen] = useState(false);
  const [priceHistoryProduct, setPriceHistoryProduct] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [billingNo, setBillingNo] = useState('');
  const [billingDate, setBillingDate] = useState(today);
  const [packing, setPacking] = useState('');
  const [adda, setAdda] = useState('');
  const [additionalDiscount, setAdditionalDiscount] = useState(0);
  const [additionalExpenses, setAdditionalExpenses] = useState(0);
  const [amountReceived, setAmountReceived] = useState(0);
  const [printWithoutBalance, setPrintWithoutBalance] = useState(false);
  const [printWithoutHeader, setPrintWithoutHeader] = useState(false);
  const [remarks, setRemarks] = useState('');

  const historicalTotal = historicalInvoice?.netTotal != null ? Number(historicalInvoice.netTotal) : 0;
  const historicalSubtotal = replicationItems.reduce(
    (sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.oldPrice) || 0),
    0
  );
  const newTotal = replicationItems.reduce((sum, it) => sum + (Number(it.lineTotal) || 0), 0);
  const grandTotal = newTotal;
  const netTotal = grandTotal - Number(additionalDiscount) + Number(additionalExpenses);
  const allUseNew = replicationItems.length > 0 && replicationItems.every((it) => it.useNewPrice);

  const displayCustomer = selectedCustomer || (historicalInvoice?.customerId != null ? { customerId: historicalInvoice.customerId, name: historicalInvoice.customerName || 'Cash' } : (historicalInvoice?.customer_id != null ? { customerId: historicalInvoice.customer_id, customer_id: historicalInvoice.customer_id, name: historicalInvoice.customerName || 'Cash' } : null));
  function getEffectiveCustomerId(c) {
    if (!c) return null;
    return c.customerId != null ? c.customerId : (c.customer_id != null ? c.customer_id : null);
  }
  const customerIdForCreate = isCashCustomer ? null : (getEffectiveCustomerId(selectedCustomer) ?? getEffectiveCustomerId(historicalInvoice) ?? null);
  const byInvoiceNoCustomerMissing = !isCashCustomer && (customerIdForCreate == null || customerIdForCreate === '') && replicationItems.length > 0;

  const historicalDisplayItems =
    replicationItems.length > 0
      ? replicationItems.map((it) => ({
          ...it,
          unitPrice: it.oldPrice,
          lineTotal: (Number(it.quantity) || 0) * it.oldPrice,
        }))
      : null;

  useEffect(() => {
    const id = historicalInvoice?.customerId ?? selectedCustomer?.customerId;
    if (!id) {
      setCustomerPrevBalance(0);
      return;
    }
    customersApi
      .getBalance(id)
      .then((res) => setCustomerPrevBalance(Number(res.data?.balance) || 0))
      .catch(() => setCustomerPrevBalance(0));
  }, [historicalInvoice?.customerId, selectedCustomer?.customerId]);

  useEffect(() => {
    const customerId = historicalInvoice?.customerId;
    if (!customerId) {
      setSoldHistory([]);
      return;
    }
    const to = new Date();
    const from = new Date(to.getFullYear() - 1, to.getMonth(), 1);
    const fromStr = from.toISOString().slice(0, 10);
    const toStr = to.toISOString().slice(0, 10);
    invoicesApi
      .list(fromStr, toStr, customerId, 0, 15)
      .then((res) => {
        const content = res.data?.content ?? res.data ?? [];
        setSoldHistory(Array.isArray(content) ? content : []);
      })
      .catch(() => setSoldHistory([]));
  }, [historicalInvoice?.customerId]);

  useEffect(() => {
    customersApi
      .list('', 0, 300)
      .then((res) => {
        const content = res.data?.content ?? res.data ?? [];
        setCustomersList(Array.isArray(content) ? content : []);
      })
      .catch(() => setCustomersList([]));
  }, []);

  const fetchNextNewInvoiceNumber = useCallback(() => {
    invoicesApi.getNextNumber(billingDate || today).then((next) => setNewInvoiceNumber(next)).catch(() => {
      const d = (billingDate || today).replace(/-/g, '');
      setNewInvoiceNumber('INV-' + d + '-' + String(Date.now()).slice(-4));
    });
  }, [billingDate]);

  useEffect(() => {
    fetchNextNewInvoiceNumber();
  }, []);

  const handleSearch = useCallback(() => {
    const num = (invoiceNoInput || '').trim();
    if (!num) {
      setError('Enter an invoice number');
      return;
    }
    setError(null);
    setLoading(true);
    setHistoricalInvoice(null);
    setReplicationItems([]);
    setSelectedCustomer(null);
    invoicesApi
      .getByNumber(num)
      .then((res) => {
        const inv = res.data;
        setHistoricalInvoice(inv);
        fetchNextNewInvoiceNumber();
        setIsCashCustomer(!inv.customerId);
        if (inv.customerId) {
          setSelectedCustomer({ customerId: inv.customerId, name: inv.customerName || 'Cash' });
        } else {
          setSelectedCustomer(null);
        }
        setBillingNo('');
        setBillingDate(today);
        setPacking(inv.billingPacking ?? '');
        setAdda(inv.billingAdda ?? '');
        setAdditionalDiscount(Number(inv.additionalDiscount) || 0);
        setAdditionalExpenses(Number(inv.additionalExpenses) || 0);
        setAmountReceived(Number(inv.amountReceived) || 0);
        setPrintWithoutBalance(!!inv.printWithoutBalance);
        setPrintWithoutHeader(!!inv.printWithoutHeader);
        setRemarks(inv.remarks ?? '');
        const productIds = (inv.items || []).map((it) => it.productId).filter(Boolean);
        if (productIds.length === 0) {
          setReplicationItems([]);
          setLoading(false);
          return;
        }
        return productsApi.getBulk(productIds).then((pres) => {
          const list = pres.data || [];
          const map = {};
          list.forEach((p) => {
            map[p.productId] = p;
          });
          setReplicationItems(buildReplicationItems(inv, map));
        });
      })
      .catch((err) => {
        const msg = err.response?.status === 404 ? 'Invoice not found' : err.response?.data?.message || 'Failed to load invoice';
        setError(msg);
        setHistoricalInvoice(null);
        setReplicationItems([]);
      })
      .finally(() => setLoading(false));
  }, [invoiceNoInput]);

  const handleClear = useCallback(() => {
    setInvoiceNoInput('');
    setError(null);
    setHistoricalInvoice(null);
    setReplicationItems([]);
    setSelectedCustomer(null);
    setIsCashCustomer(false);
    setSoldHistory([]);
    fetchNextNewInvoiceNumber();
    setSuccessMsg(null);
    setBillingNo('');
    setBillingDate(today);
    setPacking('');
    setAdda('');
    setAdditionalDiscount(0);
    setAdditionalExpenses(0);
    setAmountReceived(0);
    setPrintWithoutBalance(false);
    setPrintWithoutHeader(false);
    setRemarks('');
  }, []);

  const handleEnd = useCallback(() => {
    if (onEnd) onEnd();
    else handleClear();
  }, [onEnd, handleClear]);

  const handlePriceSelection = useCallback((productId, useNew) => {
    setReplicationItems((prev) =>
      recalcLineTotals(prev.map((it) => (it.productId === productId ? { ...it, useNewPrice: useNew } : it)))
    );
  }, []);

  const handleSelectAllNew = useCallback((useNew) => {
    setReplicationItems((prev) => recalcLineTotals(prev.map((it) => ({ ...it, useNewPrice: useNew }))));
  }, []);

  const handleSelectAllOld = useCallback(() => {
    setReplicationItems((prev) => recalcLineTotals(prev.map((it) => ({ ...it, useNewPrice: false }))));
  }, []);

  const handleOnlyIncreased = useCallback(() => {
    setReplicationItems((prev) =>
      recalcLineTotals(
        prev.map((it) => ({ ...it, useNewPrice: (Number(it.newPrice) || 0) > (Number(it.oldPrice) || 0) }))
      )
    );
  }, []);

  const handleOnlyDecreased = useCallback(() => {
    setReplicationItems((prev) =>
      recalcLineTotals(
        prev.map((it) => ({ ...it, useNewPrice: (Number(it.newPrice) || 0) < (Number(it.oldPrice) || 0) }))
      )
    );
  }, []);

  const handleUpdateQuantity = useCallback((index, qty) => {
    const n = Number(qty);
    if (n < 0) return;
    setReplicationItems((prev) => {
      const next = [...prev];
      if (!next[index]) return prev;
      next[index] = { ...next[index], quantity: n };
      return recalcLineTotals(next);
    });
  }, []);

  const handleRemoveItem = useCallback((index) => {
    setReplicationItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSameQty = useCallback(() => {
    if (!historicalInvoice?.items?.length) return;
    const qtyByProductId = {};
    historicalInvoice.items.forEach((it) => {
      qtyByProductId[it.productId] = Number(it.quantity) || 0;
    });
    setReplicationItems((prev) =>
      recalcLineTotals(prev.map((it) => ({ ...it, quantity: qtyByProductId[it.productId] ?? it.quantity })))
    );
  }, [historicalInvoice]);

  const handleDoubleQty = useCallback(() => {
    setReplicationItems((prev) =>
      recalcLineTotals(prev.map((it) => ({ ...it, quantity: (Number(it.quantity) || 0) * 2 })))
    );
  }, []);

  const handleHalfQty = useCallback(() => {
    setReplicationItems((prev) =>
      recalcLineTotals(
        prev.map((it) => ({ ...it, quantity: Math.max(0, Math.floor((Number(it.quantity) || 0) / 2)) }))
      )
    );
  }, []);

  const handleClearAll = useCallback(() => {
    setReplicationItems([]);
  }, []);

  const buildCreateBody = useCallback(
    (saveAsDraft, paymentOverrides) => {
      const items = replicationItems.map((it) => ({
        productId: it.productId,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        uomId: it.uomId || undefined,
      }));
      const amt = paymentOverrides && paymentOverrides.amountReceived != null ? Number(paymentOverrides.amountReceived) : (Number(amountReceived) || 0);
      const ch = paymentOverrides && paymentOverrides.changeReturned != null ? Number(paymentOverrides.changeReturned) : 0;
      return {
        invoiceNumber: newInvoiceNumber,
        customerId: isCashCustomer ? null : customerIdForCreate,
        isCashCustomer: !!isCashCustomer,
        invoiceDate: today,
        invoiceTime: new Date().toTimeString().slice(0, 8),
        transactionTypeCode: 'SALE',
        deliveryModeId: historicalInvoice?.deliveryModeId ?? 1,
        items,
        additionalDiscount: Number(additionalDiscount) || 0,
        additionalExpenses: Number(additionalExpenses) || 0,
        amountReceived: amt,
        changeReturned: ch,
        saveAsDraft: !!saveAsDraft,
        printWithoutHeader: !!printWithoutHeader,
        printWithoutBalance: !!printWithoutBalance,
        remarks: remarks || undefined,
        billingNo: billingNo || undefined,
        billingDate: billingDate || undefined,
        billingPacking: packing || undefined,
        billingAdda: adda || undefined,
      };
    },
    [
      replicationItems,
      newInvoiceNumber,
      isCashCustomer,
      customerIdForCreate,
      historicalInvoice?.deliveryModeId,
      additionalDiscount,
      additionalExpenses,
      amountReceived,
      printWithoutHeader,
      printWithoutBalance,
      remarks,
      billingNo,
      billingDate,
      packing,
      adda,
    ]
  );

  const handleCreateOrder = useCallback(() => {
    if (replicationItems.length === 0) {
      const msg = 'Add at least one item.';
      if (onNotify) onNotify(msg, 'warning');
      else setSuccessMsg(msg);
      return;
    }
    if (byInvoiceNoCustomerMissing) {
      const msg = 'Please select a customer. Ledger is maintained against customer accounts.';
      if (onNotify) onNotify(msg, 'warning');
      else setSuccessMsg(msg);
      return;
    }
    if (onOpenPaymentBeforeCreate) {
      const received = Number(amountReceived) || 0;
      const changeVal = Math.max(0, received - netTotal);
      onOpenPaymentBeforeCreate({
        netTotal,
        grandTotal,
        additionalDiscount: Number(additionalDiscount) || 0,
        additionalExpenses: Number(additionalExpenses) || 0,
        prevBalance: customerPrevBalance,
        isCreditCustomer: !isCashCustomer,
        items: replicationItems.map((it) => ({ label: (it.productName || it.productCode) + ' x' + it.quantity, amount: it.lineTotal })),
        printWithoutHeader: !!printWithoutHeader,
        printWithoutBalance: !!printWithoutBalance,
        executeCreate: (amountReceivedVal, changeReturnedVal) => {
          setCreateLoading(true);
          setSuccessMsg(null);
          return invoicesApi
            .create(buildCreateBody(false, { amountReceived: amountReceivedVal, changeReturned: changeReturnedVal }))
            .then((res) => {
              const msg = `Order created: ${res.data?.invoiceNumber || newInvoiceNumber}`;
              if (onNotify) onNotify(msg, 'success');
              else setSuccessMsg(msg);
              if (onCreated) onCreated(res.data);
              fetchNextNewInvoiceNumber();
              return res.data;
            })
            .catch((err) => {
              const msg = err.response?.data?.message || 'Create failed.';
              if (onNotify) onNotify(msg, 'error');
              else setSuccessMsg(msg);
              throw err;
            })
            .finally(() => setCreateLoading(false));
        },
      });
      return;
    }
    setCreateLoading(true);
    setSuccessMsg(null);
    invoicesApi
      .create(buildCreateBody(false))
      .then((res) => {
        const msg = `Order created: ${res.data?.invoiceNumber || newInvoiceNumber}`;
        if (onNotify) onNotify(msg, 'success');
        else setSuccessMsg(msg);
        if (onCreated) onCreated(res.data);
        fetchNextNewInvoiceNumber();
      })
      .catch((err) => {
        const msg = err.response?.data?.message || 'Create failed.';
        if (onNotify) onNotify(msg, 'error');
        else setSuccessMsg(msg);
      })
      .finally(() => setCreateLoading(false));
  }, [replicationItems.length, replicationItems, buildCreateBody, newInvoiceNumber, onCreated, onNotify, onOpenPaymentBeforeCreate, netTotal, grandTotal, additionalDiscount, additionalExpenses, customerPrevBalance, isCashCustomer, amountReceived, printWithoutHeader, printWithoutBalance, byInvoiceNoCustomerMissing]);

  const handleSaveDraft = useCallback(() => {
    if (replicationItems.length === 0) {
      const msg = 'Add at least one item.';
      if (onNotify) onNotify(msg, 'warning');
      else setSuccessMsg(msg);
      return;
    }
    setCreateLoading(true);
    setSuccessMsg(null);
    invoicesApi
      .create(buildCreateBody(true))
      .then((res) => {
        const msg = `Draft saved: ${res.data?.invoiceNumber || newInvoiceNumber}`;
        if (onNotify) onNotify(msg, 'success');
        else setSuccessMsg(msg);
        if (onCreated) onCreated(res.data);
        fetchNextNewInvoiceNumber();
      })
      .catch((err) => {
        const msg = err.response?.data?.message || 'Save draft failed.';
        if (onNotify) onNotify(msg, 'error');
        else setSuccessMsg(msg);
      })
      .finally(() => setCreateLoading(false));
  }, [replicationItems.length, buildCreateBody, newInvoiceNumber, onCreated, onNotify]);

  const handleSelectCustomer = useCallback((customer) => {
    setSelectedCustomer({ customerId: customer.customerId, name: customer.name || customer.nameEnglish || customer.customerCode || `#${customer.customerId}` });
    setCustomerSearchOpen(false);
  }, []);

  const handlePrint = useCallback(() => {
    if (replicationItems.length === 0) return;
    const draftInvoice = {
      invoiceNumber: newInvoiceNumber,
      invoiceDate: today,
      invoiceTime: new Date().toTimeString().slice(0, 8),
      customerName: isCashCustomer ? 'Cash Bill' : (displayCustomer?.name || 'Cash'),
      remarks: remarks || undefined,
      grandTotal,
      additionalDiscount: Number(additionalDiscount) || 0,
      additionalExpenses: Number(additionalExpenses) || 0,
      netTotal,
      amountReceived: Number(amountReceived) || 0,
      billingNo: billingNo || undefined,
      billingDate: billingDate || undefined,
    };
    const printItems = replicationItems.map((it) => ({
      productCode: it.productCode,
      productName: it.productName,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      lineTotal: it.lineTotal,
      uomName: it.uomName || undefined,
    }));
    printInvoice({
      invoice: draftInvoice,
      items: printItems,
      printWithoutHeader: !!printWithoutHeader,
      printWithoutBalance: !!printWithoutBalance,
    });
  }, [
    replicationItems,
    newInvoiceNumber,
    isCashCustomer,
    displayCustomer?.name,
    remarks,
    grandTotal,
    additionalDiscount,
    additionalExpenses,
    netTotal,
    amountReceived,
    billingNo,
    billingDate,
    printWithoutHeader,
    printWithoutBalance,
  ]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (!customerSearchOpen) handleClear();
        return;
      }
      if (e.ctrlKey && e.key === 'Enter' && replicationItems.length > 0) {
        e.preventDefault();
        handleCreateOrder();
        return;
      }
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        if (replicationItems.length > 0) handleSaveDraft();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [replicationItems.length, handleCreateOrder, handleSaveDraft, handleClear, customerSearchOpen]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <InvoiceSearchHeader
        invoiceNo={invoiceNoInput}
        onInvoiceNoChange={setInvoiceNoInput}
        onSearch={handleSearch}
        onClear={handleClear}
        onEnd={handleEnd}
        loading={loading}
        error={error}
      />
      <Box sx={{ flex: 1, overflow: 'auto', overflowX: 'hidden', px: 2, py: 2, bgcolor: 'background.default' }}>
        {/* Vertical stack: each section full width */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 1400, mx: 'auto' }}>
          {/* 1. Historical Order — full width */}
          <Box sx={{ width: '100%' }}>
            <HistoricalOrderPanel
              invoice={historicalInvoice}
              displayItems={historicalDisplayItems}
              prevBalance={customerPrevBalance}
              soldHistory={soldHistory}
              currentInvoiceNumber={historicalInvoice?.invoiceNumber}
            />
          </Box>

          {/* 2. Price Comparison — full width */}
          <Box sx={{ width: '100%' }}>
            <PriceComparisonPanel
              items={replicationItems}
              onPriceSelection={handlePriceSelection}
              onSelectAllNew={handleSelectAllNew}
              onSelectAllOld={handleSelectAllOld}
              onPriceHistoryClick={(row) => {
                setPriceHistoryProduct({ productId: row.productId, productCode: row.productCode, productName: row.productName });
                setPriceHistoryOpen(true);
              }}
              allUseNew={allUseNew}
            />
          </Box>

          {/* 3. New Order (Draft) — full width */}
          <Box sx={{ width: '100%' }}>
            <NewOrderPanel
              invoiceNumber={newInvoiceNumber}
              customerName={displayCustomer?.name || 'Cash'}
              isCashCustomer={isCashCustomer}
              onCashCustomerChange={setIsCashCustomer}
              selectedCustomerId={displayCustomer?.customerId ?? null}
              onCustomerSelect={(c) => setSelectedCustomer(c ? { customerId: c.customerId, name: c.name || c.nameEnglish || c.customerCode || `#${c.customerId}` } : null)}
              customersList={customersList}
              items={replicationItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onSameQty={handleSameQty}
              onDoubleQty={handleDoubleQty}
              onHalfQty={handleHalfQty}
              onClearAll={handleClearAll}
            />
          </Box>

          {/* 4. Billing & Payment — full width */}
          <Box sx={{ width: '100%' }}>
            <BillingPaymentPanel
              billingNo={billingNo}
              billingDate={billingDate}
              packing={packing}
              adda={adda}
              grandTotal={grandTotal}
              additionalDiscount={additionalDiscount}
              additionalExpenses={additionalExpenses}
              netTotal={netTotal}
              amountReceived={amountReceived}
              printWithoutBalance={printWithoutBalance}
              printWithoutHeader={printWithoutHeader}
              remarks={remarks}
              onBillingNoChange={setBillingNo}
              onBillingDateChange={setBillingDate}
              onPackingChange={setPacking}
              onAddaChange={setAdda}
              onAdditionalDiscountChange={setAdditionalDiscount}
              onAdditionalExpensesChange={setAdditionalExpenses}
              onAmountReceivedChange={setAmountReceived}
              onPrintWithoutBalanceChange={setPrintWithoutBalance}
              onPrintWithoutHeaderChange={setPrintWithoutHeader}
              onRemarksChange={setRemarks}
            />
          </Box>

          {replicationItems.length > 0 && (
            <Box sx={{ width: '100%' }}>
              <PriceImpactCalculator historicalSubtotal={historicalSubtotal} newTotal={newTotal} />
            </Box>
          )}

          {replicationItems.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                alignItems: 'center',
                py: 2,
                borderTop: 1,
                borderColor: 'divider',
                width: '100%',
              }}
            >
            <Button
              variant="outlined"
              onClick={() => setPreviewOpen(true)}
              disabled={createLoading}
            >
              Preview Order
            </Button>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              disabled={createLoading || replicationItems.length === 0}
            >
              Print
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleCreateOrder}
              disabled={createLoading || byInvoiceNoCustomerMissing}
            >
              {createLoading ? '…' : 'Create Order from Selection'}
            </Button>
            <Button variant="outlined" onClick={handleSaveDraft} disabled={createLoading}>
              Save as Draft
            </Button>
            <Button variant="outlined" onClick={handleClear} disabled={createLoading}>
              Cancel
            </Button>
            {successMsg && !onNotify && (
              <Typography
                variant="body2"
                color={successMsg.startsWith('Order created') || successMsg.startsWith('Draft saved') ? 'success.main' : 'error.main'}
                fontWeight={600}
              >
                {successMsg}
              </Typography>
            )}
          </Box>
        )}
        </Box>
      </Box>
      <CustomerSearchModal
        open={customerSearchOpen}
        onClose={() => setCustomerSearchOpen(false)}
        onSelectCustomer={handleSelectCustomer}
      />
      <PriceHistoryModal
        open={priceHistoryOpen}
        onClose={() => setPriceHistoryOpen(false)}
        productId={priceHistoryProduct?.productId}
        productCode={priceHistoryProduct?.productCode}
        productName={priceHistoryProduct?.productName}
      />
      <PreviewOrderDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        invoiceNumber={newInvoiceNumber}
        customerName={displayCustomer?.name}
        isCashCustomer={isCashCustomer}
        items={replicationItems}
        grandTotal={grandTotal}
        additionalDiscount={additionalDiscount}
        additionalExpenses={additionalExpenses}
        netTotal={netTotal}
        amountReceived={amountReceived}
        billingNo={billingNo}
        billingDate={billingDate}
        packing={packing}
        adda={adda}
        remarks={remarks}
      />
    </Box>
  );
}
