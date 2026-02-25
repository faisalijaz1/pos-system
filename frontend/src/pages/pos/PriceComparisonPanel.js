/**
 * Price Comparison Panel — Center column. Old vs New price per item, Use New checkbox, bulk actions, Stock/Unit.
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
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import PriceCell from './PriceCell';
import { formatMoney } from './posUtils';

export default function PriceComparisonPanel({
  items = [],
  onPriceSelection,
  onSelectAllNew,
  onSelectAllOld,
  onOnlyIncreased,
  onOnlyDecreased,
  onPriceHistoryClick,
  allUseNew,
}) {
  if (items.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2,
          border: '1px dashed',
          borderColor: 'divider',
          minHeight: 280,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Price comparison will appear after loading an invoice.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        minHeight: 280,
      }}
    >
      <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1 }}>
        Price Comparison
      </Typography>
      <FormControlLabel
        control={
          <Checkbox
            checked={!!allUseNew}
            onChange={(e) => onSelectAllNew && onSelectAllNew(e.target.checked)}
            color="primary"
          />
        }
        label="Use all new prices"
        sx={{ mb: 1 }}
      />
      <Box sx={{ mb: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        <ButtonGroup size="small" variant="outlined">
          <Button onClick={() => onSelectAllNew && onSelectAllNew(true)}>All New</Button>
          <Button onClick={() => onSelectAllOld && onSelectAllOld()}>All Old</Button>
          <Button onClick={() => onOnlyIncreased && onOnlyIncreased()}>Only ↑</Button>
          <Button onClick={() => onOnlyDecreased && onOnlyDecreased()}>Only ↓</Button>
        </ButtonGroup>
      </Box>
      <TableContainer sx={{ maxHeight: 220, border: 1, borderColor: 'divider', borderRadius: 1 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Stock</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Unit</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Old</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>New</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>Use New</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((row) => (
              <TableRow key={row.productId || row.salesInvoiceItemId} sx={{ '&:nth-of-type(even)': { bgcolor: 'action.hover' } }}>
                <TableCell sx={{ fontFamily: 'monospace' }}>{row.productCode}</TableCell>
                <TableCell>{row.productName}</TableCell>
                <TableCell align="right">{row.currentStock != null ? formatMoney(row.currentStock) : '—'}</TableCell>
                <TableCell>{row.uomName ?? '—'}</TableCell>
                <TableCell align="right">
                  {Number(row.oldPrice ?? row.unitPrice).toLocaleString('en-PK', { maximumFractionDigits: 0 })}
                </TableCell>
                <TableCell align="right">
                  <Box
                    component="span"
                    onClick={() => onPriceHistoryClick && onPriceHistoryClick(row)}
                    sx={{ cursor: onPriceHistoryClick ? 'pointer' : 'default', display: 'inline-block' }}
                    title={onPriceHistoryClick ? 'View price history' : undefined}
                  >
                    <PriceCell oldPrice={row.oldPrice ?? row.unitPrice} newPrice={row.newPrice} />
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Checkbox
                    size="small"
                    checked={!!row.useNewPrice}
                    onChange={(e) => onPriceSelection && onPriceSelection(row.productId, e.target.checked)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
