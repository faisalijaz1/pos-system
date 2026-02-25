/**
 * New Order Panel — Right column. Draft order with editable qty, selected prices, new total.
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
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { formatMoney } from './posUtils';

export default function NewOrderPanel({
  invoiceNumber,
  customerName,
  onCustomerChange,
  items = [],
  onUpdateQuantity,
  onRemoveItem,
}) {
  const newTotal = items.reduce((sum, it) => sum + (Number(it.lineTotal) || 0), 0);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : '#f5f9ff'),
        minHeight: 280,
      }}
    >
      <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1 }}>
        New Order (Draft)
      </Typography>
      <Box sx={{ mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          New Invoice: <strong>{invoiceNumber}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Customer: {customerName || '—'}
          {onCustomerChange && (
            <Typography component="span" variant="body2" color="primary" sx={{ ml: 1 }} onClick={onCustomerChange}>
              [Change]
            </Typography>
          )}
        </Typography>
      </Box>
      <TableContainer sx={{ maxHeight: 200, border: 1, borderColor: 'divider', borderRadius: 1 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Qty</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Price</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Total</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }} width={48} />
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((it, idx) => (
              <TableRow key={it.productId || idx}>
                <TableCell sx={{ fontFamily: 'monospace' }}>{it.productCode}</TableCell>
                <TableCell>{it.productName}</TableCell>
                <TableCell align="right">
                  <TextField
                    size="small"
                    type="number"
                    inputProps={{ min: 0.01, step: 0.01 }}
                    value={it.quantity ?? ''}
                    onChange={(e) => onUpdateQuantity && onUpdateQuantity(idx, e.target.value)}
                    sx={{ width: 72, '& .MuiInputBase-input': { textAlign: 'right' } }}
                  />
                </TableCell>
                <TableCell align="right">{formatMoney(it.unitPrice)}</TableCell>
                <TableCell align="right">{formatMoney(it.lineTotal)}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => onRemoveItem && onRemoveItem(idx)} aria-label="Remove">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ mt: 1, textAlign: 'right' }}>
        <Typography variant="body2" color="text.secondary">
          New Total: <strong>{formatMoney(newTotal)}</strong>
        </Typography>
      </Box>
    </Paper>
  );
}
