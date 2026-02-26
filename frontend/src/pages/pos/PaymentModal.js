import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  FormControlLabel,
  Checkbox,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  Divider,
} from '@mui/material';
import { formatMoney } from './posUtils';

export default function PaymentModal({
  open,
  onClose,
  netTotal,
  grandTotal = 0,
  additionalDiscount = 0,
  additionalExpenses = 0,
  prevBalance = 0,
  amountReceived,
  change,
  receiptPreviewLines,
  receiptPreviewItems = [],
  printReceiptAfterSave,
  onPrintReceiptChange,
  onAmountChange,
  onConfirm,
  loading,
  cartLength,
  isCreditCustomer = false,
}) {
  const received = Number(amountReceived) || 0;
  const net = Number(netTotal) || 0;
  const changeToReturn = Math.max(0, received - net);
  const balanceDueThisBill = Math.max(0, net - received);
  const changeAmt = change != null ? Number(change) : changeToReturn;
  const balanceDue = isCreditCustomer ? Math.max(0, prevBalance + net - received) : 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Payment</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Net total: {formatMoney(netTotal)}
        </Typography>
        <TextField
          fullWidth
          label="Amount received"
          type="number"
          value={amountReceived}
          onChange={(e) => onAmountChange(e.target.value)}
          sx={{ mt: 0.5 }}
          autoFocus
          inputProps={{ min: 0, step: 0.01 }}
        />
        {received > 0 && (
          <>
            {changeToReturn > 0 && (
              <Typography variant="body1" fontWeight={600} sx={{ mt: 1 }}>
                Change: {formatMoney(changeAmt)}
              </Typography>
            )}
            {balanceDueThisBill > 0 && (
              <Typography variant="body1" fontWeight={600} sx={{ mt: 1 }} color="warning.main">
                Balance due (this bill): {formatMoney(balanceDueThisBill)}
              </Typography>
            )}
          </>
        )}

        <Box
          sx={{
            mt: 2,
            p: 1.5,
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100'),
            borderRadius: 2,
            overflow: 'auto',
            maxHeight: 280,
          }}
        >
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
            Receipt preview
          </Typography>
          {receiptPreviewItems.length > 0 ? (
            <Table size="small" sx={{ '& td, & th': { border: 0, py: 0.25 }, fontSize: '0.8rem' }}>
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {receiptPreviewItems.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.label}</TableCell>
                    <TableCell align="right">{formatMoney(row.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Box component="pre" sx={{ margin: 0, fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}>
              {receiptPreviewLines || '—'}
            </Box>
          )}
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, fontSize: '0.8rem' }}>
            {Number(grandTotal) > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Grand total</span>
                <strong>{formatMoney(grandTotal)}</strong>
              </Box>
            )}
            {Number(additionalDiscount) > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Discount</span>
                <span>-{formatMoney(additionalDiscount)}</span>
              </Box>
            )}
            {Number(additionalExpenses) > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Expenses</span>
                <span>+{formatMoney(additionalExpenses)}</span>
              </Box>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span>Net total</span>
              <span>{formatMoney(netTotal)}</span>
            </Box>
            {isCreditCustomer && Number(prevBalance) > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Prev balance</span>
                <span>{formatMoney(prevBalance)}</span>
              </Box>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Received</span>
              <span>{formatMoney(received)}</span>
            </Box>
            {changeToReturn > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Change</span>
                <span>{formatMoney(changeAmt)}</span>
              </Box>
            )}
            {balanceDueThisBill > 0 && received > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                <span>Balance due (this bill)</span>
                <span>{formatMoney(balanceDueThisBill)}</span>
              </Box>
            )}
            {isCreditCustomer && balanceDue > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'primary.main' }}>
                <span>Balance due</span>
                <span>{formatMoney(balanceDue)}</span>
              </Box>
            )}
          </Box>
        </Box>
        <FormControlLabel
          control={<Checkbox checked={printReceiptAfterSave} onChange={(e) => onPrintReceiptChange(e.target.checked)} />}
          label="Print receipt after save"
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel (Esc)
        </Button>
        <Button variant="contained" onClick={onConfirm} disabled={loading || cartLength === 0}>
          {loading ? 'Saving…' : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
