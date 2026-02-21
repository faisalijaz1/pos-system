import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Typography,
  Box,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import { formatMoney } from './posUtils';

export default function InvoiceDetailModal({
  open,
  onClose,
  invoice,
  onPrint,
}) {
  if (!invoice) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Invoice - {invoice.invoiceNumber}</DialogTitle>
      <DialogContent>
        <Typography variant="body2">
          <strong>Date</strong> {invoice.invoiceDate}
          {invoice.invoiceTime != null && ` · ${invoice.invoiceTime}`}
        </Typography>
        <Typography variant="body2">
          <strong>Customer</strong> {invoice.customerName || 'Cash'}
        </Typography>
        {invoice.remarks && (
          <Typography variant="body2">
            <strong>Remarks</strong> {invoice.remarks}
          </Typography>
        )}
        <Table size="small" sx={{ mt: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell align="right">Qty</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(invoice.items || []).map((it) => (
              <TableRow key={it.salesInvoiceItemId}>
                <TableCell>
                  {it.productCode} - {it.productName}
                </TableCell>
                <TableCell align="right">{formatMoney(it.quantity)}</TableCell>
                <TableCell align="right">{formatMoney(it.unitPrice)}</TableCell>
                <TableCell align="right">{formatMoney(it.lineTotal)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Box sx={{ mt: 2, textAlign: 'right' }}>
          <Typography variant="body2">
            Net Total: {formatMoney(invoice.netTotal)}
          </Typography>
          <Typography variant="body2">
            Amount Received: {formatMoney(invoice.amountReceived)}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close (Esc)</Button>
        <Button variant="contained" startIcon={<PrintIcon />} onClick={onPrint}>
          Print (Ctrl+P)
        </Button>
      </DialogActions>
    </Dialog>
  );
}
