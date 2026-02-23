import React from 'react';
import { Box, Typography, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
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
        alignContent: 'center',
        gap: 2,
        padding: '14px 24px 18px 16px',
        background: stripBg,
        borderTop: '2px solid',
        borderBottom: '1px solid',
        borderColor: 'divider',
        borderRadius: 0,
        minHeight: 64,
        flexShrink: 0,
        marginBottom: 2,
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
          gap: 1.5,
          marginRight: 1,
          marginLeft: 'auto',
          flexShrink: 0,
          paddingLeft: 2,
        }}
      >
        <Typography className="net-total-label" variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
          NET Total
        </Typography>
        <Box
          className="net-total-value"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            minWidth: 120,
            px: 2,
            py: 1.25,
            borderRadius: 2,
            bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.2) : alpha(theme.palette.primary.main, 0.08),
            border: '2px solid',
            borderColor: 'primary.main',
            boxShadow: theme.palette.mode === 'dark' ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <Typography
            component="span"
            sx={{
              fontSize: 24,
              fontWeight: 800,
              color: 'primary.main',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '0.02em',
            }}
          >
            {formatMoney(netTotal)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
