/**
 * Preview Order Dialog — Summary of new order before create (customer, items, totals, billing).
 */
import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableContainer from '@mui/material/TableContainer';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { formatMoney } from './posUtils';

export default function PreviewOrderDialog({
  open,
  onClose,
  invoiceNumber,
  customerName,
  isCashCustomer,
  items = [],
  grandTotal,
  additionalDiscount,
  additionalExpenses,
  netTotal,
  amountReceived,
  billingNo,
  billingDate,
  packing,
  adda,
  remarks,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  confirmLoading = false,
  onAmountReceivedChange,
}) {
  const received = Number(amountReceived) || 0;
  const isAmountEditable = typeof onAmountReceivedChange === 'function';
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Preview Order</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Invoice: <strong>{invoiceNumber}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Customer: {isCashCustomer ? 'Cash' : (customerName || '—')}
            </Typography>
          </Box>
          <TableContainer sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : '#f5f5f5') }}>
                  <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Qty</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Price</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((it, idx) => (
                  <TableRow key={it.productId || idx}>
                    <TableCell sx={{ fontFamily: 'monospace' }}>{it.productCode}</TableCell>
                    <TableCell>{it.productName}</TableCell>
                    <TableCell align="right">{formatMoney(it.quantity)}</TableCell>
                    <TableCell align="right">{formatMoney(it.unitPrice)}</TableCell>
                    <TableCell align="right">{formatMoney(it.lineTotal)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="body2">Grand Total: <strong>{formatMoney(grandTotal)}</strong></Typography>
            <Typography variant="body2">Add Disc: {formatMoney(additionalDiscount)}</Typography>
            <Typography variant="body2">Add Exp: {formatMoney(additionalExpenses)}</Typography>
            <Typography variant="body2" fontWeight={700}>Net Total: {formatMoney(netTotal)}</Typography>
            {isAmountEditable ? (
              <TextField
                fullWidth
                label="Amount received"
                type="number"
                value={amountReceived ?? ''}
                onChange={(e) => onAmountReceivedChange(e.target.value)}
                size="small"
                inputProps={{ min: 0, step: 0.01 }}
                sx={{ mt: 0.5 }}
              />
            ) : (
              <Typography variant="body2">Amt Received: {formatMoney(amountReceived)}</Typography>
            )}
          </Box>
          {(billingNo || billingDate || packing || adda) && (
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary">Billing</Typography>
              <Typography variant="body2">Billing No: {billingNo || '—'}</Typography>
              <Typography variant="body2">Billing Date: {billingDate || '—'}</Typography>
              <Typography variant="body2">Packing: {packing || '—'}</Typography>
              <Typography variant="body2">Adda: {adda || '—'}</Typography>
            </Box>
          )}
          {remarks && (
            <Typography variant="body2" color="text.secondary">Remarks: {remarks}</Typography>
          )}
        </Box>
      </DialogContent>
      {onConfirm && (
        <DialogActions sx={{ px: 2, pb: 1 }}>
          <Button onClick={onClose} disabled={confirmLoading}>{cancelLabel}</Button>
          <Button variant="contained" onClick={onConfirm} disabled={confirmLoading}>
            {confirmLoading ? 'Saving…' : (confirmLabel || 'Confirm')}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
