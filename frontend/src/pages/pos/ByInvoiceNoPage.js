/**
 * By Invoice No tab — Order replication with price intelligence.
 * Search historical invoice → compare old vs new prices → create new order from selection.
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

export default function ByInvoiceNoPage({ onCreated }) {
  const [invoiceNoInput, setInvoiceNoInput] = useState('');
  const [historicalInvoice, setHistoricalInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [replicationItems, setReplicationItems] = useState([]);
  const [newInvoiceNumber, setNewInvoiceNumber] = useState(generateInvoiceNumber);
  const [createLoading, setCreateLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const historicalTotal = historicalInvoice?.netTotal != null ? Number(historicalInvoice.netTotal) : 0;
  const newTotal = replicationItems.reduce((sum, it) => sum + (Number(it.lineTotal) || 0), 0);
  const allUseNew = replicationItems.length > 0 && replicationItems.every((it) => it.useNewPrice);

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
    invoicesApi
      .getByNumber(num)
      .then((res) => {
        const inv = res.data;
        setHistoricalInvoice(inv);
        setNewInvoiceNumber(generateInvoiceNumber());
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
          const items = buildReplicationItems(inv, map);
          setReplicationItems(items);
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
    setNewInvoiceNumber(generateInvoiceNumber());
    setSuccessMsg(null);
  }, []);

  const handlePriceSelection = useCallback((productId, useNew) => {
    setReplicationItems((prev) =>
      recalcLineTotals(
        prev.map((it) => (it.productId === productId ? { ...it, useNewPrice: useNew } : it))
      )
    );
  }, []);

  const handleSelectAllNew = useCallback((useNew) => {
    setReplicationItems((prev) =>
      recalcLineTotals(prev.map((it) => ({ ...it, useNewPrice: useNew })))
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

  const handleCreateOrder = useCallback(() => {
    if (replicationItems.length === 0) {
      setSuccessMsg('Add at least one item.');
      return;
    }
    setCreateLoading(true);
    setSuccessMsg(null);
    const customerId = historicalInvoice?.customerId ?? null;
    const isCashCustomer = historicalInvoice?.isCashCustomer ?? !customerId;
    const items = replicationItems.map((it) => ({
      productId: it.productId,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      uomId: it.uomId || undefined,
    }));
    const body = {
      invoiceNumber: newInvoiceNumber,
      customerId: isCashCustomer ? null : customerId,
      isCashCustomer: !!isCashCustomer,
      invoiceDate: today,
      invoiceTime: new Date().toTimeString().slice(0, 8),
      transactionTypeCode: 'SALE',
      deliveryModeId: historicalInvoice?.deliveryModeId ?? 1,
      items,
      additionalDiscount: 0,
      additionalExpenses: 0,
      amountReceived: 0,
      changeReturned: 0,
      saveAsDraft: false,
      printWithoutHeader: false,
      printWithoutBalance: false,
    };
    invoicesApi
      .create(body)
      .then((res) => {
        setSuccessMsg(`Order created: ${res.data?.invoiceNumber || newInvoiceNumber}`);
        if (onCreated) onCreated(res.data);
        setNewInvoiceNumber(generateInvoiceNumber());
      })
      .catch((err) => {
        setSuccessMsg(err.response?.data?.message || 'Create failed.');
      })
      .finally(() => setCreateLoading(false));
  }, [replicationItems, historicalInvoice, newInvoiceNumber, onCreated]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'Enter' && replicationItems.length > 0) {
        e.preventDefault();
        handleCreateOrder();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [replicationItems.length, handleCreateOrder]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <InvoiceSearchHeader
        invoiceNo={invoiceNoInput}
        onInvoiceNoChange={setInvoiceNoInput}
        onSearch={handleSearch}
        onClear={handleClear}
        loading={loading}
        error={error}
      />
      <Box sx={{ flex: 1, overflow: 'auto', px: 2, py: 2 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' },
            gap: 2,
            mb: 2,
          }}
        >
          <HistoricalOrderPanel invoice={historicalInvoice} />
          <PriceComparisonPanel
            items={replicationItems}
            onPriceSelection={handlePriceSelection}
            onSelectAllNew={handleSelectAllNew}
            allUseNew={allUseNew}
          />
          <NewOrderPanel
            invoiceNumber={newInvoiceNumber}
            customerName={historicalInvoice?.customerName || 'Cash'}
            items={replicationItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
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
            <Button variant="outlined" onClick={handleClear} disabled={createLoading}>
              Cancel
            </Button>
            {successMsg && (
              <Typography
                variant="body2"
                color={successMsg.startsWith('Order created') ? 'success.main' : 'error.main'}
                fontWeight={600}
              >
                {successMsg}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
