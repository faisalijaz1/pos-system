import React from 'react';
import { Box, Typography, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { formatMoney } from './posUtils';

export default function FinancialSummaryStrip({
  noOfTitles,
  totalQuantity,
  grandTotal,
  additionalDiscount,
  additionalExpenses,
  netTotal,
  onDiscountChange,
  onExpensesChange,
}) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        flexWrap: 'wrap',
        alignItems: { md: 'center' },
        justifyContent: 'space-between',
        gap: 1.5,
        py: 1.5,
        px: 2,
        borderTop: 1,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: theme.palette.mode === 'dark' ? 'action.hover' : 'grey.50',
        borderRadius: 1,
      }}
    >
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography variant="body2" color="text.secondary">No. of titles: <strong>{noOfTitles}</strong></Typography>
        <Typography variant="body2" color="text.secondary">Total qty: <strong>{totalQuantity}</strong></Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography variant="body2" color="text.secondary">Subtotal: <strong>{formatMoney(grandTotal)}</strong></Typography>
        <TextField size="small" type="number" label="Discount" value={additionalDiscount} onChange={(e) => onDiscountChange(Number(e.target.value) || 0)} inputProps={{ min: 0, 'aria-label': 'Discount' }} sx={{ width: 100 }} />
        <TextField size="small" type="number" label="Expenses" value={additionalExpenses} onChange={(e) => onExpensesChange(Number(e.target.value) || 0)} inputProps={{ min: 0, 'aria-label': 'Expenses' }} sx={{ width: 100 }} />
      </Box>
      <Box sx={{ px: 2, py: 0.75, borderRadius: 1, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Typography variant="caption" sx={{ opacity: 0.9 }}>Net Total</Typography>
        <Typography variant="h6" fontWeight={700}>{formatMoney(netTotal)}</Typography>
      </Box>
    </Box>
  );
}
