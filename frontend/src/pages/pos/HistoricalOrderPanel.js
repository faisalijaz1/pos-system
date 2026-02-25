/**
 * Historical Order Panel — 1st column, read-only. Full invoice metadata, customer details, items table.
 */
import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableContainer from '@mui/material/TableContainer';
import LockIcon from '@mui/icons-material/Lock';
import { formatMoney } from './posUtils';
import { DELIVERY_MODES, TRANSACTION_TYPES } from './posUtils';

export default function HistoricalOrderPanel({
  invoice,
  displayItems,
  prevBalance = 0,
  soldHistory = [],
  currentInvoiceNumber,
  deliveryModeOptions = DELIVERY_MODES,
  transactionTypes = TRANSACTION_TYPES,
}) {
  const items = (displayItems != null && displayItems.length > 0)
    ? displayItems
    : (invoice?.items || []);

  if (!invoice) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2,
          border: '1px dashed',
          borderColor: 'divider',
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50'),
          minHeight: 320,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Search an invoice to see original order.
        </Typography>
      </Paper>
    );
  }

  const total = invoice.netTotal != null ? Number(invoice.netTotal) : 0;
  const dateStr = invoice.invoiceDate ? new Date(invoice.invoiceDate).toISOString().slice(0, 10) : '—';
  const timeStr = invoice.invoiceTime != null ? String(invoice.invoiceTime).slice(0, 5) : '—';
  const deliveryMode = deliveryModeOptions.find((m) => m.deliveryModeId === invoice.deliveryModeId);
  const txnType = transactionTypes.find((t) => t.code === invoice.transactionTypeCode);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : '#faf9f8'),
        minHeight: 320,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
        <LockIcon fontSize="small" color="action" />
        <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
          Historical Order (Read-Only)
        </Typography>
      </Box>
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="body2" color="text.secondary">
          Invoice: <strong>{invoice.invoiceNumber}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Date: {dateStr} · Time: {timeStr}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Del Mode: {deliveryMode?.modeName ?? '—'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Type: {txnType?.name ?? invoice.transactionTypeCode ?? '—'}
        </Typography>
      </Box>
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="caption" fontWeight={700} color="text.secondary">
          Customer Details
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ID: {invoice.customerId ?? '—'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Name: {invoice.customerName || 'Cash'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Prev Bal: <strong>{formatMoney(prevBalance)}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          With this Bill: <strong>{formatMoney(total)}</strong>
        </Typography>
      </Box>
      <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
        Historical Items
      </Typography>
      <TableContainer sx={{ width: '100%', maxHeight: 320, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
        <Table size="small" stickyHeader sx={{ minWidth: 720 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : '#f5f5f5') }}>
              <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Brand</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Stock</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Qty</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Unit</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Price</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((it) => (
              <TableRow key={it.salesInvoiceItemId || it.productId} sx={{ '&:nth-of-type(even)': { bgcolor: 'action.hover' } }}>
                <TableCell sx={{ fontFamily: 'monospace' }}>{it.productCode}</TableCell>
                <TableCell>{it.productName}</TableCell>
                <TableCell>{it.brandName ?? '—'}</TableCell>
                <TableCell align="right">{it.currentStock != null ? formatMoney(it.currentStock) : '—'}</TableCell>
                <TableCell align="right">{formatMoney(it.quantity)}</TableCell>
                <TableCell>{it.uomName ?? '—'}</TableCell>
                <TableCell align="right">{formatMoney(it.unitPrice)}</TableCell>
                <TableCell align="right">{formatMoney(it.lineTotal)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ mt: 1, textAlign: 'right' }}>
        <Typography variant="body2" fontWeight={700} sx={{ fontSize: 16 }}>
          Hist Total: {formatMoney(total)}
        </Typography>
      </Box>
      {soldHistory && soldHistory.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            Sold History (recent orders)
          </Typography>
          <Box
            component="ul"
            sx={{
              m: 0,
              pl: 2,
              py: 0.5,
              maxHeight: 120,
              overflow: 'auto',
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              bgcolor: 'background.default',
            }}
          >
            {soldHistory
              .filter((inv) => inv.invoiceNumber !== currentInvoiceNumber)
              .slice(0, 10)
              .map((inv) => (
                <Box component="li" key={inv.salesInvoiceId || inv.invoiceNumber} sx={{ py: 0.25 }}>
                  <Typography variant="body2" color="text.secondary">
                    {inv.invoiceNumber}
                    {inv.invoiceDate && ` · ${new Date(inv.invoiceDate).toISOString().slice(0, 10)}`}
                    {inv.netTotal != null && ` · ${formatMoney(inv.netTotal)}`}
                  </Typography>
                </Box>
              ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
}
