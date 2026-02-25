/**
 * Sales History Invoice Tab — 6-panel layout: sequential nav, customer details,
 * invoice header, product search bar, invoice table + net total, billing details + print options.
 * Backend-ready: uses invoicesApi.getById, navigate, update, addItem, updateItem, deleteItem.
 */
import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import { invoicesApi } from '../../api/invoices';
import { customersApi } from '../../api/customers';
import { productsApi } from '../../api/products';
import { formatMoney } from './posUtils';
import SequentialNavigationBar from './SequentialNavigationBar';
import CustomerDetailsPanel from './CustomerDetailsPanel';
import InvoiceHeaderPanel from './InvoiceHeaderPanel';
import ProductSearchBar from './ProductSearchBar';
import InvoiceGrid from './InvoiceGrid';
import InvoiceBottomStrip from './InvoiceBottomStrip';
import BillingDetailsPanel from './BillingDetailsPanel';
import PrintOptionsPanel from './PrintOptionsPanel';
import ProductSearchModal from './ProductSearchModal';
import { DATE_INPUT_SX } from './posUtils';
import ConfirmDialog from './ConfirmDialog';

const today = new Date().toISOString().slice(0, 10);

function formatSoldHist(inv) {
  if (!inv) return '';
  const items = inv.items || [];
  const first = items[0];
  const invNum = inv.invoiceNumber || '';
  const dateStr = inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString() : '';
  if (first) {
    const qty = first.quantity ?? '';
    const uom = first.uomName || first.productName || '';
    const rate = first.unitPrice ?? first.lineTotal ?? '';
    const line = (qty && uom ? qty + ' ' + uom + ' @ ' : '') + (rate ? '(' + formatMoney(rate) + ')' : '') + (invNum ? ' Inv # ' + invNum : '') + (dateStr ? ' Dated ' + dateStr : '');
    return line.trim();
  }
  return (invNum ? 'Inv # ' + invNum : '') + (dateStr ? ' Dated ' + dateStr : '') + (inv.netTotal != null ? ' — ' + formatMoney(inv.netTotal) : '');
}

export default function SalesHistoryInvoicePage({ onExit, onPrint, onNotify, onOpenPayment }) {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [navLoading, setNavLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [originalInvoice, setOriginalInvoice] = useState(null);
  const [invoiceNoSearch, setInvoiceNoSearch] = useState('');
  const [prevBalance, setPrevBalance] = useState(0);
  const [soldHist, setSoldHist] = useState('');
  const [soldHistLoading, setSoldHistLoading] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productSearchResults, setProductSearchResults] = useState([]);
  const [productSearchHighlight, setProductSearchHighlight] = useState(0);
  const [productSearchModalOpen, setProductSearchModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [saveLoading, setSaveLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [focusedRowIndex, setFocusedRowIndex] = useState(-1);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const invoiceId = currentInvoice?.salesInvoiceId ?? null;
  const items = currentInvoice?.items ?? [];
  const grandTotal = currentInvoice?.grandTotal != null ? Number(currentInvoice.grandTotal) : 0;
  const additionalDiscount = currentInvoice?.additionalDiscount != null ? Number(currentInvoice.additionalDiscount) : 0;
  const additionalExpenses = currentInvoice?.additionalExpenses != null ? Number(currentInvoice.additionalExpenses) : 0;
  const netTotal = currentInvoice?.netTotal != null ? Number(currentInvoice.netTotal) : 0;
  const noOfTitles = items.length;
  const totalQuantity = items.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);

  const loadInvoiceById = useCallback((id) => {
    if (!id) return;
    setLoading(true);
    setEditMode(false);
    setOriginalInvoice(null);
    invoicesApi
      .getById(id)
      .then((res) => setCurrentInvoice(res.data))
      .catch(() => setCurrentInvoice(null))
      .finally(() => setLoading(false));
  }, []);

  const loadFirstForDate = useCallback(() => {
    setNavLoading(true);
    invoicesApi
      .navigate(selectedDate, null, 'first')
      .then((res) => {
        if (res.data && res.data.salesInvoiceId) loadInvoiceById(res.data.salesInvoiceId);
        else setCurrentInvoice(null);
      })
      .catch(() => setCurrentInvoice(null))
      .finally(() => setNavLoading(false));
  }, [selectedDate, loadInvoiceById]);

  useEffect(() => {
    loadFirstForDate();
  }, [selectedDate]);

  const handleNavigate = useCallback(
    (direction) => {
      setNavLoading(true);
      const currentId = currentInvoice?.salesInvoiceId ?? null;
      invoicesApi
        .navigate(selectedDate, currentId, direction)
        .then((res) => {
          if (res.data && res.data.salesInvoiceId) loadInvoiceById(res.data.salesInvoiceId);
          else setCurrentInvoice(null);
        })
        .catch(() => setCurrentInvoice(null))
        .finally(() => setNavLoading(false));
    },
    [selectedDate, currentInvoice, loadInvoiceById]
  );

  const atFirst = !currentInvoice || navLoading;
  const atLast = !currentInvoice || navLoading;

  const handleInvoiceNoGo = useCallback(() => {
    const num = invoiceNoSearch.trim();
    if (!num) return;
    setNavLoading(true);
    invoicesApi
      .getByNumber(num)
      .then((res) => {
        setCurrentInvoice(res.data);
        if (res.data && res.data.invoiceDate) setSelectedDate(String(res.data.invoiceDate).slice(0, 10));
      })
      .catch(() => setCurrentInvoice(null))
      .finally(() => setNavLoading(false));
  }, [invoiceNoSearch]);

  useEffect(() => {
    if (!currentInvoice || currentInvoice.isCashCustomer) {
      setPrevBalance(0);
      return;
    }
    const cid = currentInvoice.customerId;
    if (!cid) {
      setPrevBalance(0);
      return;
    }
    customersApi
      .getBalance(cid)
      .then((res) => setPrevBalance(Number(res.data?.balance ?? res.data?.currentBalance ?? 0)))
      .catch(() => setPrevBalance(0));
  }, [currentInvoice?.customerId, currentInvoice?.isCashCustomer]);

  useEffect(() => {
    if (!currentInvoice || currentInvoice.isCashCustomer) {
      setSoldHist('');
      setSoldHistLoading(false);
      return;
    }
    const cid = currentInvoice.customerId;
    const curId = currentInvoice.salesInvoiceId;
    setSoldHistLoading(true);
    setSoldHist('');
    invoicesApi
      .getLastByCustomer(cid)
      .then((inv) => {
        if (!inv) {
          setSoldHist('');
          return;
        }
        if (inv.salesInvoiceId === curId) setSoldHist('This invoice');
        else setSoldHist(formatSoldHist(inv) || '—');
      })
      .catch(() => setSoldHist(''))
      .finally(() => setSoldHistLoading(false));
  }, [currentInvoice?.customerId, currentInvoice?.salesInvoiceId, currentInvoice?.isCashCustomer]);

  const handleEnterEdit = useCallback(() => {
    if (!currentInvoice) return;
    setOriginalInvoice(JSON.parse(JSON.stringify(currentInvoice)));
    setEditMode(true);
  }, [currentInvoice]);

  const handleCancelEdit = useCallback(() => {
    if (originalInvoice) setCurrentInvoice(originalInvoice);
    setEditMode(false);
    setOriginalInvoice(null);
    const msg = 'Changes discarded.';
    if (onNotify) onNotify(msg, 'info');
    else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  }, [originalInvoice, onNotify]);

  const handleSaveChanges = useCallback(() => {
    if (!invoiceId) return;
    setSaveLoading(true);
    setSuccessMsg('');
    const payload = {
      invoiceDate: currentInvoice.invoiceDate,
      invoiceTime: currentInvoice.invoiceTime,
      deliveryModeId: currentInvoice.deliveryModeId,
      additionalDiscount: currentInvoice.additionalDiscount ?? 0,
      additionalExpenses: currentInvoice.additionalExpenses ?? 0,
      printWithoutHeader: currentInvoice.printWithoutHeader ?? false,
      printWithoutBalance: currentInvoice.printWithoutBalance ?? false,
      remarks: currentInvoice.remarks ?? '',
      billingNo: currentInvoice.billingNo ?? '',
      billingDate: currentInvoice.billingDate || null,
      billingPacking: currentInvoice.billingPacking ?? '',
      billingAdda: currentInvoice.billingAdda ?? '',
    };
    invoicesApi
      .update(invoiceId, payload)
      .then((res) => {
        setCurrentInvoice(res.data);
        setEditMode(false);
        setOriginalInvoice(null);
        const msg = 'Saved.';
        if (onNotify) onNotify(msg, 'success');
        else {
          setSuccessMsg(msg);
          setTimeout(() => setSuccessMsg(''), 3000);
        }
      })
      .catch(() => {
        const msg = 'Save failed.';
        if (onNotify) onNotify(msg, 'error');
        else {
          setSuccessMsg(msg);
          setTimeout(() => setSuccessMsg(''), 4000);
        }
      })
      .finally(() => setSaveLoading(false));
  }, [invoiceId, currentInvoice, onNotify]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (editMode) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Leave anyway?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [editMode]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!editMode) return;
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSaveChanges();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancelEdit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editMode, handleSaveChanges, handleCancelEdit]);

  const updateLocalInvoice = useCallback((next) => {
    setCurrentInvoice((prev) => (prev ? { ...prev, ...next } : null));
  }, []);

  const handleAddItem = useCallback(
    (product, qty = 1) => {
      if (!invoiceId) return;
      const uomId = product.uomId ?? product.uom_id;
      const uomEntry = (product.uomPrices || []).find((e) => e.uomId === uomId);
      const unitPrice = uomEntry != null ? uomEntry.price : (product.sellingPrice ?? product.selling_price);
      setLoading(true);
      invoicesApi
        .addItem(invoiceId, {
          productId: product.productId,
          quantity: qty,
          unitPrice,
          uomId: uomId ?? product.uomId ?? product.uom_id,
        })
        .then((res) => setCurrentInvoice(res.data))
        .finally(() => setLoading(false));
    },
    [invoiceId]
  );

  const handleRemoveItem = useCallback(
    (rowId) => {
      if (!invoiceId) return;
      const item = items.find((it, i) => i === rowId || it.salesInvoiceItemId === rowId || it.productId === rowId);
      if (!item || !item.salesInvoiceItemId) return;
      setDeleteConfirmItem(item);
    },
    [invoiceId, items]
  );

  const handleConfirmRemoveItem = useCallback(() => {
    if (!invoiceId || !deleteConfirmItem?.salesInvoiceItemId) return;
    setDeleteLoading(true);
    invoicesApi
      .deleteItem(invoiceId, deleteConfirmItem.salesInvoiceItemId)
      .then(() => {
        setDeleteConfirmItem(null);
        loadInvoiceById(invoiceId);
        if (onNotify) onNotify('Line removed.', 'success');
        else {
          setSuccessMsg('Line removed.');
          setTimeout(() => setSuccessMsg(''), 3000);
        }
      })
      .catch(() => {
        if (onNotify) onNotify('Failed to remove line.', 'error');
        else {
          setSuccessMsg('Failed to remove line.');
          setTimeout(() => setSuccessMsg(''), 3000);
        }
      })
      .finally(() => setDeleteLoading(false));
  }, [invoiceId, deleteConfirmItem, loadInvoiceById, onNotify]);

  const handleCloseDeleteConfirm = useCallback(() => {
    if (!deleteLoading) setDeleteConfirmItem(null);
  }, [deleteLoading]);

  const handleQtyChange = useCallback(
    (rowId, delta) => {
      const item = items.find((it, i) => i === rowId || it.salesInvoiceItemId === rowId || it.productId === rowId);
      if (!item || !item.salesInvoiceItemId) return;
      const qty = Number(item.quantity) + delta;
      if (qty <= 0) {
        handleRemoveItem(rowId);
        return;
      }
      setLoading(true);
      invoicesApi
        .updateItem(invoiceId, item.salesInvoiceItemId, { quantity: qty })
        .then((res) => setCurrentInvoice(res.data))
        .finally(() => setLoading(false));
    },
    [invoiceId, items, handleRemoveItem]
  );

  const handleQtyDirect = useCallback(
    (rowId, val) => {
      const item = items.find((it, i) => i === rowId || it.salesInvoiceItemId === rowId || it.productId === rowId);
      if (!item || !item.salesInvoiceItemId) return;
      const qty = Number(val);
      if (qty <= 0) {
        handleRemoveItem(rowId);
        return;
      }
      setLoading(true);
      invoicesApi
        .updateItem(invoiceId, item.salesInvoiceItemId, { quantity: qty })
        .then((res) => setCurrentInvoice(res.data))
        .finally(() => setLoading(false));
    },
    [invoiceId, items, handleRemoveItem]
  );

  useEffect(() => {
    if (!editMode || productSearch.trim().length < 1) {
      setProductSearchResults([]);
      return;
    }
    const q = productSearch.trim().toLowerCase();
    productsApi
      .list({ search: q }, 0, 20)
      .then((res) => {
        const list = res.data?.content ?? res.data ?? [];
        setProductSearchResults(Array.isArray(list) ? list : []);
        setProductSearchHighlight(0);
      })
      .catch(() => setProductSearchResults([]));
  }, [productSearch, editMode]);

  const safeHighlightIndex = Math.min(productSearchHighlight, Math.max(0, productSearchResults.length - 1));

  const handleSearchKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const p = productSearchResults[safeHighlightIndex];
        if (p) {
          handleAddItem(p, 1);
          setProductSearch('');
          setProductSearchHighlight(0);
        }
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setProductSearchHighlight((i) => Math.min(i + 1, productSearchResults.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setProductSearchHighlight((i) => Math.max(i - 1, 0));
      }
    },
    [productSearchResults, safeHighlightIndex, handleAddItem]
  );

  const handlePrint = useCallback(() => {
    if (onPrint && currentInvoice) onPrint(currentInvoice);
  }, [onPrint, currentInvoice]);

  useEffect(() => {
    if (productSearchModalOpen) {
      productsApi.list({}, 0, 500).then((res) => {
        const list = res.data?.content ?? res.data ?? [];
        setProducts(Array.isArray(list) ? list : []);
      }).catch(() => setProducts([]));
    }
  }, [productSearchModalOpen]);

  const canNavigatePrev = !!currentInvoice;
  const canNavigateNext = !!currentInvoice;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <SequentialNavigationBar
        filterType="day"
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onNavigate={handleNavigate}
        disableFirst={!currentInvoice}
        disablePrev={!canNavigatePrev}
        disableNext={!canNavigateNext}
        disableLast={!currentInvoice}
        invoiceNoSearch={invoiceNoSearch}
        onInvoiceNoSearchChange={setInvoiceNoSearch}
        onInvoiceNoGo={handleInvoiceNoGo}
        loading={navLoading}
      />
      <Box sx={{ flex: 1, overflow: 'auto', px: { xs: 1, md: 2 }, py: 1 }}>
        {loading && !currentInvoice ? (
          <Typography color="text.secondary">Loading…</Typography>
        ) : !currentInvoice ? (
          <Typography color="text.secondary">No invoice for this date. Use By Invoice No or pick another date.</Typography>
        ) : (
          <>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 2,
                mb: 2,
              }}
            >
              <CustomerDetailsPanel
                customerId={currentInvoice.customerId}
                customerName={currentInvoice.customerName}
                isCashCustomer={currentInvoice.isCashCustomer}
                prevBalance={prevBalance}
                withThisBill={netTotal}
              />
              <InvoiceHeaderPanel
                invoiceNumber={currentInvoice.invoiceNumber}
                invoiceDate={currentInvoice.invoiceDate}
                invoiceTime={currentInvoice.invoiceTime}
                deliveryModeId={currentInvoice.deliveryModeId}
                soldHist={soldHistLoading ? '…' : soldHist}
                grandTotal={grandTotal}
                additionalDiscount={additionalDiscount}
                additionalExpenses={additionalExpenses}
                netTotal={netTotal}
                editMode={editMode}
                onEnterEdit={handleEnterEdit}
                onSaveChanges={handleSaveChanges}
                onCancelEdit={handleCancelEdit}
                saveLoading={saveLoading}
                onPrint={handlePrint}
                onExit={onExit}
                onConfirmPayment={onOpenPayment ? () => onOpenPayment(currentInvoice, prevBalance, setCurrentInvoice) : undefined}
                onInvoiceDateChange={(v) => updateLocalInvoice({ invoiceDate: v })}
                onInvoiceTimeChange={(v) => updateLocalInvoice({ invoiceTime: v })}
                onDeliveryModeChange={(v) => updateLocalInvoice({ deliveryModeId: v })}
                onAdditionalDiscountChange={(v) => updateLocalInvoice({ additionalDiscount: v })}
                onAdditionalExpensesChange={(v) => updateLocalInvoice({ additionalExpenses: v })}
              />
            </Box>

            {editMode && (
              <Box sx={{ mb: 1 }}>
                <ProductSearchBar
                  search={productSearch}
                  onSearchChange={setProductSearch}
                  searchResults={productSearchResults}
                  highlightedIndex={productSearchHighlight}
                  onSelectProduct={(p) => {
                    handleAddItem(p, 1);
                    setProductSearch('');
                    setProductSearchHighlight(0);
                  }}
                  onCloseDropdown={() => {
                    setProductSearch('');
                    setProductSearchHighlight(0);
                  }}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Add product: code or name — Enter to add"
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  Or open search: <Button size="small" onClick={() => setProductSearchModalOpen(true)}>F2 Search</Button>
                </Typography>
              </Box>
            )}

            <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'visible', border: '1px solid', borderColor: 'divider', mb: 1 }}>
              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'visible', bgcolor: 'background.paper' }}>
                <InvoiceGrid
                  cartItems={items}
                  focusedRowIndex={focusedRowIndex}
                  onRowClick={setFocusedRowIndex}
                  onQtyChange={editMode ? handleQtyChange : () => {}}
                  onQtyDirect={editMode ? handleQtyDirect : () => {}}
                  onRemove={editMode ? handleRemoveItem : () => {}}
                  emptyMessage={currentInvoice ? 'No line items.' : '—'}
                />
                <InvoiceBottomStrip
                  noOfTitles={noOfTitles}
                  totalQuantity={totalQuantity}
                  grandTotal={grandTotal}
                  additionalDiscount={additionalDiscount}
                  additionalExpenses={additionalExpenses}
                  netTotal={netTotal}
                  onDiscountChange={editMode ? (v) => updateLocalInvoice({ additionalDiscount: v }) : () => {}}
                  onExpensesChange={editMode ? (v) => updateLocalInvoice({ additionalExpenses: v }) : () => {}}
                />
              </Box>
            </Paper>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 2,
                mt: 2,
                pt: '22px',
              }}
            >
              <BillingDetailsPanel
                billingNo={currentInvoice.billingNo}
                billingDate={currentInvoice.billingDate}
                billingPacking={currentInvoice.billingPacking}
                billingAdda={currentInvoice.billingAdda}
                editable={editMode}
                onBillingNoChange={(v) => updateLocalInvoice({ billingNo: v })}
                onBillingDateChange={(v) => updateLocalInvoice({ billingDate: v })}
                onBillingPackingChange={(v) => updateLocalInvoice({ billingPacking: v })}
                onBillingAddaChange={(v) => updateLocalInvoice({ billingAdda: v })}
              />
              <PrintOptionsPanel
                noOfTitles={noOfTitles}
                totalQuantity={totalQuantity}
                remarks={currentInvoice.remarks}
                printWithoutHeader={currentInvoice.printWithoutHeader}
                printWithoutBalance={currentInvoice.printWithoutBalance}
                editable={editMode}
                onRemarksChange={(v) => updateLocalInvoice({ remarks: v })}
                onPrintWithoutHeaderChange={(v) => updateLocalInvoice({ printWithoutHeader: v })}
                onPrintWithoutBalanceChange={(v) => updateLocalInvoice({ printWithoutBalance: v })}
              />
            </Box>
            {successMsg && (
              <Typography variant="caption" color={successMsg.includes('failed') ? 'error.main' : 'success.main'} fontWeight={600} sx={{ display: 'block', mt: 1 }}>
                {successMsg}
              </Typography>
            )}
          </>
        )}
      </Box>
      <ProductSearchModal
        open={productSearchModalOpen}
        onClose={() => setProductSearchModalOpen(false)}
        products={products}
        uomList={[]}
        onSelectProduct={(p) => {
          handleAddItem(p, 1);
          setProductSearchModalOpen(false);
        }}
      />
      <ConfirmDialog
        open={!!deleteConfirmItem}
        title="Remove line"
        message={deleteConfirmItem ? `Remove "${deleteConfirmItem.productName || deleteConfirmItem.productCode || 'this item'}" from the invoice?` : ''}
        confirmLabel="Remove"
        cancelLabel="Cancel"
        confirmColor="error"
        loading={deleteLoading}
        onConfirm={handleConfirmRemoveItem}
        onCancel={handleCloseDeleteConfirm}
      />
    </Box>
  );
}
