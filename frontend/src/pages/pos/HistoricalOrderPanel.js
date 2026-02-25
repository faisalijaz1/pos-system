/**
 * Historical Order Panel — Left column, read-only view of original invoice.
 * Muted archival styling; customer info, metadata, items table, historical total.
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

export default function HistoricalOrderPanel({ invoice }) {
  if (!invoice) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2,
          border: '1px dashed',
          borderColor: 'divider',
          bgcolor: 'grey.50',
          minHeight: 280,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Search an invoice to see original order.
        </Typography>
      </Paper>
    );
  }
  const items = invoice.items || [];
  const total = invoice.netTotal != null ? Number(invoice.netTotal) : 0;
  const dateStr = invoice.invoiceDate ? new Date(invoice.invoiceDate).toISOString().slice(0, 10) : '—';
  const timeStr = invoice.invoiceTime != null ? String(invoice.invoiceTime).slice(0, 5) : '';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'grey.50',
        minHeight: 280,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
        <LockIcon fontSize="small" color="action" />
        <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
          Original Order (Historical)
        </Typography>
      </Box>
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="body2" color="text.secondary">
          Invoice: <strong>{invoice.invoiceNumber}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Date: {dateStr} {timeStr ? ` · ${timeStr}` : ''}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Customer: {invoice.customerName || 'Cash'}
        </Typography>
      </Box>
      <TableContainer sx={{ maxHeight: 240, border: 1, borderColor: 'divider', borderRadius: 1 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Qty</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Price</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((it) => (
              <TableRow key={it.salesInvoiceItemId || it.productId}>
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
      <Box sx={{ mt: 1, textAlign: 'right' }}>
        <Typography variant="body2" color="text.secondary">
          Historical Total: <strong>{formatMoney(total)}</strong>
        </Typography>
      </Box>
    </Paper>
  );
}
