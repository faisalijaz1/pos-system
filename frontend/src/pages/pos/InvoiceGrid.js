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

/** Min touch target for qty/actions (slightly reduced for compact rows). */
const TOUCH_MIN = 36;

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
  useRowIndex = false,
  emptyMessage = 'Scan barcode or type code/name — F2 Search, Enter to add',
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const headerBg = isDark ? '#3b4b63' : '#4f6696';
  const rowOddBg = isDark ? '#1e2a40' : '#ffffff';
  const rowEvenBg = isDark ? '#223048' : '#f7faff';
  const rowHoverBg = isDark ? '#2a3953' : '#edf3ff';
  const rowSelectedBg = isDark ? alpha(theme.palette.primary.main, 0.2) : alpha(theme.palette.primary.main, 0.12);
  const cartItems = cartItemsProp ?? cartProp ?? [];
  const items = Array.isArray(cartItems) ? cartItems : [];

  const getRowId = (r, idx) => r.salesInvoiceItemId ?? r.sales_invoice_item_id ?? r.productId ?? r.product_id ?? idx;
  const getKey = (r, idx) => (useRowIndex ? `row-${idx}` : getRowId(r, idx));
  const getIdForCallback = (r, idx) => (useRowIndex ? idx : getRowId(r, idx));

  return (
    <Box
      sx={{
        height: 320,
        minHeight: 320,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >
      <TableContainer sx={{ flex: 1, minHeight: 0, overflow: 'auto' }} component="div">
        <Table
          size="small"
          stickyHeader
          sx={{
            minWidth: 720,
            bgcolor: 'background.paper',
            '& thead th': {
              zIndex: 1,
              top: 0,
              backgroundColor: headerBg,
              color: '#fff',
              fontWeight: 600,
              py: 0.5,
              fontSize: '0.8125rem',
              borderBottom: '1px solid',
              borderBottomColor: isDark ? alpha('#ffffff', 0.08) : alpha('#000000', 0.12),
              whiteSpace: 'nowrap',
              lineHeight: 1.2,
              boxShadow: 'none',
            },
            '& tbody': {
              minHeight: 80,
            },
            '& tbody td': {
              borderColor: isDark ? alpha('#ffffff', 0.07) : alpha('#000000', 0.1),
              borderBottomWidth: 1,
              color: 'text.primary',
              paddingTop: 4,
              paddingBottom: 4,
              fontSize: '0.8125rem',
              lineHeight: 1.25,
            },
            '& tbody tr:nth-of-type(odd) td': {
              bgcolor: rowOddBg,
            },
            '& tbody tr:nth-of-type(even) td': {
              bgcolor: rowEvenBg,
            },
            '& tbody tr:hover td': {
              bgcolor: rowHoverBg,
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell component="th" scope="col">Sr #</TableCell>
              <TableCell component="th" scope="col">Code</TableCell>
              <TableCell component="th" scope="col">Product Name</TableCell>
              <TableCell component="th" scope="col" align="right">Stock</TableCell>
              <TableCell component="th" scope="col" align="center">Qty</TableCell>
              <TableCell component="th" scope="col">Unit</TableCell>
              <TableCell component="th" scope="col" align="right">Price</TableCell>
              <TableCell component="th" scope="col" align="right">Total</TableCell>
              <TableCell component="th" scope="col" align="right" width={TOUCH_MIN + 8} />
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4, color: 'text.primary', fontSize: '0.875rem', bgcolor: 'background.default' }}>
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              items.map((r, idx) => {
                const rowKey = getKey(r, idx);
                const callbackId = getIdForCallback(r, idx);
                return (
                <TableRow
                  key={rowKey}
                  hover
                  selected={focusedRowIndex === idx}
                  onClick={() => onRowClick(idx)}
                  sx={{
                    '& td': { py: 0.25, fontSize: '0.8125rem', lineHeight: 1.25 },
                    ...(focusedRowIndex === idx
                      ? {
                          '& td': {
                            bgcolor: rowSelectedBg,
                          },
                        }
                      : {}),
                  }}
                >
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{r.productCode ?? r.code}</TableCell>
                  <TableCell>{r.productName ?? r.product_name ?? r.productCode ?? r.code}</TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    <Typography
                      component="span"
                      variant="caption"
                      color={(r.currentStock != null ? Number(r.currentStock) : (r.current_stock != null ? Number(r.current_stock) : null)) < 0 ? 'error' : 'text.secondary'}
                    >
                      {r.currentStock != null ? formatMoney(r.currentStock) : (r.current_stock != null ? formatMoney(r.current_stock) : '—')}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); onQtyChange(callbackId, -1); }}
                      sx={{ minWidth: TOUCH_MIN, minHeight: TOUCH_MIN, p: 0.5 }}
                      aria-label="Decrease quantity"
                    >
                      <RemoveIcon />
                    </IconButton>
                    <TextField
                      size="small"
                      type="number"
                      value={r.quantity}
                      onChange={(e) => onQtyDirect(callbackId, e.target.value)}
                      onBlur={(e) => onQtyDirect(callbackId, e.target.value)}
                      inputProps={{ min: 0, step: 0.001, 'aria-label': 'Quantity' }}
                      sx={{
                        width: 52,
                        '& .MuiInputBase-root': { minHeight: 32 },
                        '& .MuiInputBase-input': {
                          py: 0.85,
                          minHeight: 20,
                          lineHeight: 1.5,
                          textAlign: 'center',
                          fontSize: '0.875rem',
                          boxSizing: 'border-box',
                        },
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); onQtyChange(callbackId, 1); }}
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
                          value={r.uomId ?? r.uom_id ?? ''}
                          onChange={(e) => onUnitChange(callbackId, e.target.value)}
                          displayEmpty
                          sx={{ height: 26, fontSize: '0.8rem' }}
                        >
                          {uomList.map((u) => (
                            <MenuItem key={u.uomId} value={u.uomId}>{u.name || u.symbol || u.uomId}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <Typography variant="caption">{r.uomName ?? r.uom_name ?? '—'}</Typography>
                    )}
                  </TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>{formatMoney(r.unitPrice ?? r.unit_price)}</TableCell>
                  <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>{formatMoney(r.lineTotal ?? r.line_total ?? (Number(r.quantity) * Number(r.unitPrice ?? r.unit_price)))}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); onRemove(callbackId); }}
                      sx={{ minWidth: TOUCH_MIN, minHeight: TOUCH_MIN }}
                      aria-label="Remove line"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
