/**
 * New Order Panel — Editable draft: Cash checkbox, Customer dropdown (separate), items with +/- qty, quick actions.
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
import IconButton from '@mui/material/IconButton';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import DeleteIcon from '@mui/icons-material/Delete';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import { formatMoney } from './posUtils';

const TOUCH_TARGET = 44;

function getCustomerLabel(c) {
  if (!c) return '';
  return c.name || c.nameEnglish || c.customerCode || `#${c.customerId}`;
}

export default function NewOrderPanel({
  invoiceNumber,
  isCashCustomer = false,
  onCashCustomerChange,
  selectedCustomerId,
  onCustomerSelect,
  customersList = [],
  customerName,
  items = [],
  onUpdateQuantity,
  onRemoveItem,
  onSameQty,
  onDoubleQty,
  onHalfQty,
  onClearAll,
}) {
  const newTotal = items.reduce((sum, it) => sum + (Number(it.lineTotal) || 0), 0);
  const selectedCustomer = customersList.find((c) => c.customerId === selectedCustomerId);

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
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          New Invoice: <strong>{invoiceNumber}</strong>
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={!!isCashCustomer}
              onChange={(e) => onCashCustomerChange && onCashCustomerChange(e.target.checked)}
            />
          }
          label="Cash customer"
        />
        <FormControl size="small" fullWidth sx={{ mt: 0.5, minWidth: 200 }}>
          <InputLabel id="by-invoice-customer-label">Customer</InputLabel>
          <Select
            labelId="by-invoice-customer-label"
            label="Customer"
            value={selectedCustomerId ?? ''}
            onChange={(e) => {
              const id = e.target.value;
              if (!id) {
                onCustomerSelect && onCustomerSelect(null);
                return;
              }
              const c = customersList.find((x) => x.customerId === id);
              onCustomerSelect && onCustomerSelect(c);
            }}
            displayEmpty
            renderValue={(v) => {
              if (v && selectedCustomer) return getCustomerLabel(selectedCustomer);
              if (customerName) return customerName;
              return 'Select customer';
            }}
          >
            <MenuItem value="">
              <em>—</em>
            </MenuItem>
            {customersList.map((c) => (
              <MenuItem key={c.customerId} value={c.customerId}>
                {getCustomerLabel(c)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <TableContainer sx={{ width: '100%', maxHeight: 320, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
        <Table size="small" stickyHeader sx={{ minWidth: 560 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Qty</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Price</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Total</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }} width={48} />
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((it, idx) => {
              const qty = Number(it.quantity) || 0;
              const stock = it.currentStock != null ? Number(it.currentStock) : null;
              const overStock = stock != null && qty > stock;
              return (
                <TableRow key={it.productId || idx} sx={{ '&:nth-of-type(even)': { bgcolor: 'action.hover' } }}>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{it.productCode}</TableCell>
                  <TableCell>
                    <Box>
                      {it.productName}
                      {overStock && (
                        <Typography component="span" variant="caption" color="error.main" sx={{ display: 'block' }}>
                          Over stock ({formatMoney(stock)})
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0 }}>
                      <IconButton
                        size="small"
                        onClick={() => onUpdateQuantity && onUpdateQuantity(idx, Math.max(0, qty - 1))}
                        sx={{ minWidth: TOUCH_TARGET, minHeight: TOUCH_TARGET }}
                        aria-label="Decrease quantity"
                      >
                        <RemoveIcon />
                      </IconButton>
                      <Typography variant="body2" sx={{ minWidth: 32, textAlign: 'center' }}>
                        {formatMoney(qty)}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => onUpdateQuantity && onUpdateQuantity(idx, qty + 1)}
                        sx={{ minWidth: TOUCH_TARGET, minHeight: TOUCH_TARGET }}
                        aria-label="Increase quantity"
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell align="right">{formatMoney(it.unitPrice)}</TableCell>
                  <TableCell align="right">{formatMoney(it.lineTotal)}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => onRemoveItem && onRemoveItem(idx)}
                      sx={{ minWidth: TOUCH_TARGET, minHeight: TOUCH_TARGET }}
                      aria-label="Remove"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
        <ButtonGroup size="small" variant="outlined">
          <Button onClick={() => onSameQty && onSameQty()}>Same Qty</Button>
          <Button onClick={() => onDoubleQty && onDoubleQty()}>Double</Button>
          <Button onClick={() => onHalfQty && onHalfQty()}>Half</Button>
          <Button onClick={() => onClearAll && onClearAll()} color="secondary">
            Clear All
          </Button>
        </ButtonGroup>
      </Box>
      <Box sx={{ mt: 1, textAlign: 'right' }}>
        <Typography variant="body2" fontWeight={700} sx={{ fontSize: 16 }}>
          New Total: {formatMoney(newTotal)}
        </Typography>
      </Box>
    </Paper>
  );
}
