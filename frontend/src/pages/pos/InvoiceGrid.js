import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
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

/**
 * Invoice items grid: Sr, Code, Product, Stock, Qty (inline edit), Rate, Total, Remove.
 * Row focus for +/- keyboard. Low stock in red.
 */
export default function InvoiceGrid({
  cart,
  focusedRowIndex,
  onRowClick,
  onQtyChange,
  onQtyDirect,
  onRemove,
  uomList = [],
  onUnitChange,
  emptyMessage = 'Scan barcode or type code/name and press Enter to add',
}) {
  const theme = useTheme();

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow
              sx={{
                bgcolor: theme.palette.primary.main,
                '& th': {
                  color: theme.palette.primary.contrastText || 'white',
                  fontWeight: 600,
                  py: 0.75,
                  fontSize: '0.75rem',
                  borderBottom: 'none',
                },
              }}
            >
              <TableCell component="th" scope="col">Sr #</TableCell>
              <TableCell component="th" scope="col">Code</TableCell>
              <TableCell component="th" scope="col">Product Name</TableCell>
              <TableCell component="th" scope="col" align="right">Stock</TableCell>
              <TableCell component="th" scope="col" align="right">Qty</TableCell>
              <TableCell component="th" scope="col">Unit</TableCell>
              <TableCell component="th" scope="col" align="right">Price</TableCell>
              <TableCell component="th" scope="col" align="right">Total</TableCell>
              <TableCell component="th" scope="col" align="right" width={40} />
            </TableRow>
          </TableHead>
          <TableBody>
            {cart.map((r, idx) => (
              <TableRow
                key={r.productId}
                hover
                selected={focusedRowIndex === idx}
                onClick={() => onRowClick(idx)}
                sx={{
                  '& td': { py: 0.5, fontSize: '0.8rem' },
                  bgcolor:
                    focusedRowIndex === idx
                      ? alpha(theme.palette.primary.main, 0.08)
                      : undefined,
                }}
              >
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{r.productCode}</TableCell>
                <TableCell>{r.productName || r.productCode}</TableCell>
                <TableCell align="right">
                  <Typography
                    component="span"
                    variant="caption"
                    color={
                      r.currentStock != null && Number(r.currentStock) < 0
                        ? 'error'
                        : 'textSecondary'
                    }
                  >
                    {r.currentStock != null
                      ? formatMoney(r.currentStock)
                      : '—'}
                  </Typography>
                </TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onQtyChange(r.productId, -1);
                    }}
                    sx={{ p: 0.25 }}
                    aria-label="Decrease quantity"
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <TextField
                    size="small"
                    type="number"
                    value={r.quantity}
                    onChange={(e) => onQtyDirect(r.productId, e.target.value)}
                    onBlur={(e) => onQtyDirect(r.productId, e.target.value)}
                    inputProps={{
                      min: 0,
                      step: 0.001,
                      style: {
                        width: 44,
                        textAlign: 'center',
                        padding: '2px 4px',
                      },
                    }}
                    sx={{ width: 52, '& .MuiInputBase-input': { py: 0.25 } }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onQtyChange(r.productId, 1);
                    }}
                    sx={{ p: 0.25 }}
                    aria-label="Increase quantity"
                  >
                    <AddIcon fontSize="small" />
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
                <TableCell align="right">
                  {formatMoney(r.lineTotal)}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(r.productId);
                    }}
                    aria-label="Remove line"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      {cart.length === 0 && (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary',
            fontSize: '0.875rem',
            py: 4,
          }}
        >
          {emptyMessage}
        </Box>
      )}
    </Box>
  );
}
