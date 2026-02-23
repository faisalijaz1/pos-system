import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  TableContainer,
  IconButton,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import { formatMoney } from './posUtils';

/** Min touch target (a11y). */
const TOUCH_MIN = 44;

/**
 * Invoice items table - PRIMARY, always visible.
 * All columns: Sr#, Code, Product, Stock, Qty, Unit, Price, Total, Actions.
 * Desktop: full width. Mobile: horizontal scroll, never hide columns.
 */
export default function InvoiceGrid({
  cartItems: cartItemsProp,
  cart: cartProp,
  focusedRowIndex,
  onRowClick,
  onQtyChange,
  onQtyDirect,
  onRemove,
  uomList = [],
  onUnitChange,
  emptyMessage = 'Scan barcode or type code/name — F2 Search, Enter to add',
}) {
  const theme = useTheme();
  const cartItems = cartItemsProp ?? cartProp ?? [];
  const items = Array.isArray(cartItems) ? cartItems : [];

  return (
    <Box
      sx={{
        height: 320,
        minHeight: 320,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
        <Table
          size="small"
          stickyHeader
          sx={{
            minWidth: 720,
            bgcolor: 'background.paper',
            '& thead th': {
              zIndex: 1,
              top: 0,
              backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.main,
              color: '#fff',
              fontWeight: 600,
              py: 0.75,
              fontSize: '0.75rem',
              borderBottom: 'none',
              whiteSpace: 'nowrap',
              boxShadow: theme.palette.mode === 'dark' ? '0 1px 0 rgba(255,255,255,0.08)' : '0 1px 0 rgba(0,0,0,0.08)',
            },
            '& tbody td': {
              borderColor: 'divider',
              borderBottomWidth: 1,
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell component="th" scope="col">Sr #</TableCell>
              <TableCell component="th" scope="col">Code</TableCell>
              <TableCell component="th" scope="col">Product Name</TableCell>
              <TableCell component="th" scope="col" align="right">Stock</TableCell>
              <TableCell component="th" scope="col" align="right">Qty</TableCell>
              <TableCell component="th" scope="col">Unit</TableCell>
              <TableCell component="th" scope="col" align="right">Price</TableCell>
              <TableCell component="th" scope="col" align="right">Total</TableCell>
              <TableCell component="th" scope="col" align="right" width={TOUCH_MIN + 8} />
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4, color: 'text.secondary', fontSize: '0.875rem' }}>
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              items.map((r, idx) => (
                <TableRow
                  key={r.productId}
                  hover
                  selected={focusedRowIndex === idx}
                  onClick={() => onRowClick(idx)}
                  sx={{
                    '& td': { py: 0.5, fontSize: '0.8rem' },
                    bgcolor: focusedRowIndex === idx ? alpha(theme.palette.primary.main, 0.08) : undefined,
                  }}
                >
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{r.productCode}</TableCell>
                  <TableCell>{r.productName || r.productCode}</TableCell>
                  <TableCell align="right">
                    <Typography
                      component="span"
                      variant="caption"
                      color={r.currentStock != null && Number(r.currentStock) < 0 ? 'error' : 'text.secondary'}
                    >
                      {r.currentStock != null ? formatMoney(r.currentStock) : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); onQtyChange(r.productId, -1); }}
                      sx={{ minWidth: TOUCH_MIN, minHeight: TOUCH_MIN, p: 0.5 }}
                      aria-label="Decrease quantity"
                    >
                      <RemoveIcon />
                    </IconButton>
                    <TextField
                      size="small"
                      type="number"
                      value={r.quantity}
                      onChange={(e) => onQtyDirect(r.productId, e.target.value)}
                      onBlur={(e) => onQtyDirect(r.productId, e.target.value)}
                      inputProps={{ min: 0, step: 0.001, 'aria-label': 'Quantity' }}
                      sx={{ width: 56, '& .MuiInputBase-input': { py: 0.75, textAlign: 'center' } }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); onQtyChange(r.productId, 1); }}
                      sx={{ minWidth: TOUCH_MIN, minHeight: TOUCH_MIN, p: 0.5 }}
                      aria-label="Increase quantity"
                    >
                      <AddIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    {uomList.length && onUnitChange ? (
                      <FormControl size="small" sx={{ minWidth: 88 }} onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={r.uomId ?? ''}
                          onChange={(e) => onUnitChange(r.productId, e.target.value)}
                          displayEmpty
                          sx={{ height: 28, fontSize: '0.8rem' }}
                        >
                          {uomList.map((u) => (
                            <MenuItem key={u.uomId} value={u.uomId}>{u.name || u.symbol || u.uomId}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <Typography variant="caption">{r.uomName || '—'}</Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">{formatMoney(r.unitPrice)}</TableCell>
                  <TableCell align="right">{formatMoney(r.lineTotal)}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); onRemove(r.productId); }}
                      sx={{ minWidth: TOUCH_MIN, minHeight: TOUCH_MIN }}
                      aria-label="Remove line"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
