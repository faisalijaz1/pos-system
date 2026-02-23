import React from 'react';
import { Box, Typography, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { formatMoney } from './posUtils';

/**
 * Bottom strip directly below table: No. titles, Qty, Subtotal, Discount, Expenses, Net Total (right-aligned).
 * Matches table width; net total aligned with table's price/total column.
 */
export default function InvoiceBottomStrip({
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
  const stripBg = theme.palette.mode === 'dark' ? theme.palette.action.hover : '#f8f9fa';

  return (
    <Box
      className="bottom-strip"
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 2,
        padding: '12px 16px',
        background: stripBg,
        borderTop: '2px solid',
        borderColor: 'divider',
        borderRadius: 0,
        minHeight: 56,
      }}
    >
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          No. titles: <strong>{noOfTitles}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Qty: <strong>{totalQuantity}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Subtotal: <strong>{formatMoney(grandTotal)}</strong>
        </Typography>
        <TextField
          size="small"
          type="number"
          label="Discount"
          value={additionalDiscount}
          onChange={(e) => onDiscountChange(Number(e.target.value) || 0)}
          inputProps={{ min: 0, 'aria-label': 'Discount' }}
          sx={{ width: 100 }}
        />
        <TextField
          size="small"
          type="number"
          label="Expenses"
          value={additionalExpenses}
          onChange={(e) => onExpensesChange(Number(e.target.value) || 0)}
          inputProps={{ min: 0, 'aria-label': 'Expenses' }}
          sx={{ width: 100 }}
        />
      </Box>
      <Box
        className="net-total-container"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          marginRight: 1,
          marginLeft: 'auto',
          flexShrink: 0,
        }}
      >
        <Typography className="net-total-label" variant="body2" color="text.secondary">
          NET:
        </Typography>
        <Typography
          className="net-total-value"
          component="span"
          sx={{
            fontSize: 24,
            fontWeight: 700,
            color: 'primary.main',
            minWidth: 120,
            textAlign: 'right',
            bgcolor: 'background.paper',
            padding: '8px 16px',
            borderRadius: 1,
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {formatMoney(netTotal)}
        </Typography>
      </Box>
    </Box>
  );
}
