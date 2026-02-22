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
} from '@mui/material';
import { formatMoney } from './posUtils';

export default function PaymentModal({
  open,
  onClose,
  netTotal,
  amountReceived,
  change,
  receiptPreviewLines,
  printReceiptAfterSave,
  onPrintReceiptChange,
  onAmountChange,
  onConfirm,
  loading,
  cartLength,
}) {
  const previewText = receiptPreviewLines + '\n\nNet: ' + formatMoney(netTotal) + '  Received: ' + formatMoney(amountReceived) + '  Change: ' + formatMoney(change);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Payment</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">Net total: {formatMoney(netTotal)}</Typography>
        <TextField fullWidth label="Amount received" type="number" value={amountReceived} onChange={(e) => onAmountChange(e.target.value)} sx={{ mt: 1 }} autoFocus />
        {Number(amountReceived) > 0 && <Typography variant="body1" fontWeight={600} sx={{ mt: 1 }}>Change: {formatMoney(change)}</Typography>}
        <Box sx={{ mt: 2, p: 1.5, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100', borderRadius: 1, fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}>
          <Typography variant="caption" fontWeight={600}>Receipt preview</Typography>
          <Box component="pre" sx={{ margin: '4px 0 0', overflow: 'auto', maxHeight: 120 }}>{previewText}</Box>
        </Box>
        <FormControlLabel control={<Checkbox checked={printReceiptAfterSave} onChange={(e) => onPrintReceiptChange(e.target.checked)} />} label="Print receipt after save" />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel (Esc)</Button>
        <Button variant="contained" onClick={onConfirm} disabled={loading || cartLength === 0}>{loading ? 'Saving…' : 'Confirm'}</Button>
      </DialogActions>
    </Dialog>
  );
}
