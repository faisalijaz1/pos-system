import React from 'react';
import { Box, Typography, TextField } from '@mui/material';
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
    <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 1.5, mt: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9375rem', mb: 0.5 }}>
        <span>No. of titles</span>
        <strong>{noOfTitles}</strong>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9375rem', mb: 0.5 }}>
        <span>Total qty</span>
        <strong>{totalQuantity}</strong>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.125rem', fontWeight: 600, mb: 1 }}>
        <span>Subtotal</span>
        <strong>{formatMoney(grandTotal)}</strong>
      </Box>
      <TextField
        size="small"
        type="number"
        label="Discount"
        value={additionalDiscount}
        onChange={(e) => onDiscountChange(e.target.value)}
        sx={{ width: '100%', mt: 0.5, '& .MuiInputBase-root': { minHeight: 44 } }}
        inputProps={{ min: 0, step: 0.01 }}
      />
      <TextField
        size="small"
        type="number"
        label="Expenses"
        value={additionalExpenses}
        onChange={(e) => onExpensesChange(e.target.value)}
        sx={{ width: '100%', mt: 1, '& .MuiInputBase-root': { minHeight: 44 } }}
        inputProps={{ min: 0, step: 0.01 }}
      />
      <Typography sx={{ mt: 1.5, fontSize: '1.375rem', fontWeight: 700 }}>
        Net Total: {formatMoney(netTotal)}
      </Typography>
    </Box>
  );
}
