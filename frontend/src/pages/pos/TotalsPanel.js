import React from 'react';
import { Box, Typography, TextField, Divider } from '@mui/material';
import { formatMoney } from './posUtils';

export default function TotalsPanel({
  noOfTitles,
  totalQuantity,
  grandTotal,
  additionalDiscount,
  additionalExpenses,
  netTotal,
  onDiscountChange,
  onExpensesChange,
}) {
  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={700} color="text.primary" sx={{ mb: 0.5 }}>Totals</Typography>
      <Divider sx={{ mb: 1 }} />
      <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
        <span>No. of titles</span>
        <strong>{noOfTitles}</strong>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
        <span>Total qty</span>
        <strong>{totalQuantity}</strong>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', mt: 0.5 }}>
        <span>Subtotal</span>
        <strong>{formatMoney(grandTotal)}</strong>
      </Box>
      <TextField
        size="small"
        type="number"
        label="Discount"
        value={additionalDiscount}
        onChange={(e) => onDiscountChange(e.target.value)}
        sx={{ width: '100%', mt: 0.5 }}
        inputProps={{ min: 0, step: 0.01 }}
      />
      <TextField
        size="small"
        type="number"
        label="Expenses"
        value={additionalExpenses}
        onChange={(e) => onExpensesChange(e.target.value)}
        sx={{ width: '100%', mt: 0.5 }}
        inputProps={{ min: 0, step: 0.01 }}
      />
      <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 1 }}>
        Net Total: {formatMoney(netTotal)}
      </Typography>
    </Box>
  );
}
