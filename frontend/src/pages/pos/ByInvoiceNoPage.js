/**
 * By Invoice No tab — Order replication with price intelligence.
 * 4-column: Historical | Price Comparison | New Order Draft | Billing & Payment.
 */
import React, { useState, useCallback, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { invoicesApi } from '../../api/invoices';
import { productsApi } from '../../api/products';
import { customersApi } from '../../api/customers';
import { formatMoney, generateInvoiceNumber } from './posUtils';
import InvoiceSearchHeader from './InvoiceSearchHeader';
import HistoricalOrderPanel from './HistoricalOrderPanel';
import PriceComparisonPanel from './PriceComparisonPanel';
import PriceImpactCalculator from './PriceImpactCalculator';
import NewOrderPanel from './NewOrderPanel';
import BillingPaymentPanel from './BillingPaymentPanel';
import CustomerSearchModal from './CustomerSearchModal';

const today = new Date().toISOString().slice(0, 10);

function buildReplicationItems(invoice, currentPricesMap) {
  if (!invoice || !invoice.items || !currentPricesMap) return [];
  return invoice.items.map((it) => {
    const productId = it.productId;
    const oldPrice = Number(it.unitPrice) || 0;
    const product = currentPricesMap[productId];
    const newPrice = product != null && product.sellingPrice != null ? Number(product.sellingPrice) : oldPrice;
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
      uomId: it.uomId || product?.uomId,
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

export default function ByInvoiceNoPage({ onCreated, onEnd }) {
  const [invoiceNoInput, setInvoiceNoInput] = useState('');
  const [historicalInvoice, setHistoricalInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [replicationItems, setReplicationItems] = useState([]);
  const [newInvoiceNumber, setNewInvoiceNumber] = useState(generateInvoiceNumber);
  const [createLoading, setCreateLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerPrevBalance, setCustomerPrevBalance] = useState(0);
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);

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
  const newTotal = replicationItems.reduce((sum, it) => sum + (Number(it.lineTotal) || 0), 0);
  const grandTotal = newTotal;
  const netTotal = grandTotal - Number(additionalDiscount) + Number(additionalExpenses);
  const allUseNew = replicationItems.length > 0 && replicationItems.every((it) => it.useNewPrice);

  const displayCustomer = selectedCustomer || (historicalInvoice ? { customerId: historicalInvoice.customerId, name: historicalInvoice.customerName || 'Cash' } : null);
  const customerIdForCreate = displayCustomer?.customerId ?? historicalInvoice?.customerId ?? null;
  const isCashCustomer = !customerIdForCreate;

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
        setNewInvoiceNumber(generateInvoiceNumber());
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
    setNewInvoiceNumber(generateInvoiceNumber());
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

  const handleSameQty = useCallback(() => {}, []);

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
    (saveAsDraft) => {
      const items = replicationItems.map((it) => ({
        productId: it.productId,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        uomId: it.uomId || undefined,
      }));
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
        amountReceived: Number(amountReceived) || 0,
        changeReturned: 0,
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
      setSuccessMsg('Add at least one item.');
      return;
    }
    setCreateLoading(true);
    setSuccessMsg(null);
    invoicesApi
      .create(buildCreateBody(false))
      .then((res) => {
        setSuccessMsg(`Order created: ${res.data?.invoiceNumber || newInvoiceNumber}`);
        if (onCreated) onCreated(res.data);
        setNewInvoiceNumber(generateInvoiceNumber());
      })
      .catch((err) => {
        setSuccessMsg(err.response?.data?.message || 'Create failed.');
      })
      .finally(() => setCreateLoading(false));
  }, [replicationItems.length, buildCreateBody, newInvoiceNumber, onCreated]);

  const handleSaveDraft = useCallback(() => {
    if (replicationItems.length === 0) {
      setSuccessMsg('Add at least one item.');
      return;
    }
    setCreateLoading(true);
    setSuccessMsg(null);
    invoicesApi
      .create(buildCreateBody(true))
      .then((res) => {
        setSuccessMsg(`Draft saved: ${res.data?.invoiceNumber || newInvoiceNumber}`);
        if (onCreated) onCreated(res.data);
        setNewInvoiceNumber(generateInvoiceNumber());
      })
      .catch((err) => {
        setSuccessMsg(err.response?.data?.message || 'Save draft failed.');
      })
      .finally(() => setCreateLoading(false));
  }, [replicationItems.length, buildCreateBody, newInvoiceNumber, onCreated]);

  const handleSelectCustomer = useCallback((customer) => {
    setSelectedCustomer({ customerId: customer.customerId, name: customer.name || customer.nameEnglish || customer.customerCode || `#${customer.customerId}` });
    setCustomerSearchOpen(false);
  }, []);

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
      <Box sx={{ flex: 1, overflow: 'auto', px: 2, py: 2 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' },
            gap: 2,
            mb: 2,
          }}
        >
          <HistoricalOrderPanel
            invoice={historicalInvoice}
            displayItems={historicalDisplayItems}
            prevBalance={customerPrevBalance}
          />
          <PriceComparisonPanel
            items={replicationItems}
            onPriceSelection={handlePriceSelection}
            onSelectAllNew={handleSelectAllNew}
            onSelectAllOld={handleSelectAllOld}
            onOnlyIncreased={handleOnlyIncreased}
            onOnlyDecreased={handleOnlyDecreased}
            allUseNew={allUseNew}
          />
          <NewOrderPanel
            invoiceNumber={newInvoiceNumber}
            customerName={displayCustomer?.name || 'Cash'}
            onCustomerChange={() => setCustomerSearchOpen(true)}
            items={replicationItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onSameQty={handleSameQty}
            onDoubleQty={handleDoubleQty}
            onHalfQty={handleHalfQty}
            onClearAll={handleClearAll}
          />
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
          <Box sx={{ mb: 2 }}>
            <PriceImpactCalculator historicalTotal={historicalTotal} newTotal={newTotal} />
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
            }}
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleCreateOrder}
              disabled={createLoading}
            >
              {createLoading ? '…' : 'Create Order from Selection'}
            </Button>
            <Button variant="outlined" onClick={handleSaveDraft} disabled={createLoading}>
              Save as Draft
            </Button>
            <Button variant="outlined" onClick={handleClear} disabled={createLoading}>
              Cancel
            </Button>
            {successMsg && (
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
      <CustomerSearchModal
        open={customerSearchOpen}
        onClose={() => setCustomerSearchOpen(false)}
        onSelectCustomer={handleSelectCustomer}
      />
    </Box>
  );
}
