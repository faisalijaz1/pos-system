import React from 'react';
import { Box, Typography, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { formatMoney } from './posUtils';

/**
 * Bottom strip below table: Row 1 = No. titles, Qty, Subtotal, Discount, Expenses.
 * Row 2 = NET Total (full width, right-aligned). Uses column layout so both rows always visible.
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
        flexDirection: 'column',
        gap: 1.5,
        padding: '16px 20px',
        background: stripBg,
        borderTop: '2px solid',
        borderBottom: '1px solid',
        borderColor: 'divider',
        borderRadius: 0,
        flexShrink: 0,
        marginBottom: 2,
      }}
    >
      {/* Row 1: Summary + Discount + Expenses */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2.5,
          minWidth: 0,
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
          No. titles: <strong>{noOfTitles}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
          Qty: <strong>{totalQuantity}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
          Subtotal: <strong>{formatMoney(grandTotal)}</strong>
        </Typography>
        <TextField
          size="small"
          type="number"
          label="Discount"
          value={additionalDiscount}
          onChange={(e) => onDiscountChange(Number(e.target.value) || 0)}
          inputProps={{ min: 0, 'aria-label': 'Discount' }}
          sx={{ width: 100, flexShrink: 0 }}
        />
        <TextField
          size="small"
          type="number"
          label="Expenses"
          value={additionalExpenses}
          onChange={(e) => onExpensesChange(Number(e.target.value) || 0)}
          inputProps={{ min: 0, 'aria-label': 'Expenses' }}
          sx={{ width: 100, flexShrink: 0 }}
        />
      </Box>

      {/* Row 2: NET Total — always visible, right-aligned */}
      <Box
        className="net-total-row"
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 1.5,
          paddingTop: 1,
          borderTop: '1px solid',
          borderColor: 'divider',
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
            minWidth: 140,
            px: 2.5,
            py: 1.5,
            borderRadius: 2,
            bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.25) : alpha(theme.palette.primary.main, 0.12),
            border: '2px solid',
            borderColor: 'primary.main',
            boxShadow: theme.palette.mode === 'dark' ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <Typography
            component="span"
            sx={{
              fontSize: '1.5rem',
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
