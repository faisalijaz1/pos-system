import React from 'react';
import { Box, Typography, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { formatMoney } from './posUtils';

const NARROW_CONTAINER = '760px';

/**
 * Bottom strip below table.
 * Uses fluid wrapping so NET Total stays visible at all container widths.
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

  const netTotalBlock = (
    <Box
      className="net-total-row"
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 1.25,
        width: 'auto',
        paddingTop: 0,
        borderTop: 'none',
        borderColor: 'divider',
        marginLeft: 'auto',
        flexShrink: 0,
        // Narrow main content: move NET Total to its own row for readability.
        [`@container main (max-width: ${NARROW_CONTAINER})`]: {
          width: '100%',
          paddingTop: 0.5,
          borderTop: 'none',
          marginTop: 0,
          marginLeft: 0,
        },
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
          px: 2.25,
          py: 0.9,
          borderRadius: 2,
          bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.28) : alpha(theme.palette.primary.main, 0.14),
          border: '1.5px solid',
          borderColor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.light, 0.8) : alpha(theme.palette.primary.main, 0.7),
          boxShadow: theme.palette.mode === 'dark' ? '0 2px 7px rgba(0,0,0,0.28)' : '0 1px 6px rgba(0,0,0,0.08)',
        }}
      >
        <Typography
          component="span"
          sx={{
            fontSize: '1.38rem',
            fontWeight: 800,
            color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '0.02em',
            lineHeight: 1,
          }}
        >
          {formatMoney(netTotal)}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box
      className="bottom-strip"
      sx={{
        display: 'flex',
        flexWrap: 'nowrap',
        alignItems: 'center',
        rowGap: 0,
        columnGap: 1.25,
        padding: '12px 16px',
        background: stripBg,
        borderTop: '2px solid',
        borderBottom: '1px solid',
        borderColor: 'divider',
        borderRadius: 0,
        flexShrink: 0,
        marginBottom: 1,
        // Narrow main content: allow stacked rows.
        [`@container main (max-width: ${NARROW_CONTAINER})`]: {
          flexWrap: 'wrap',
          rowGap: 1,
          columnGap: 1.25,
        },
      }}
    >
      {/* Summary + inputs naturally wrap before NET total when width is tight. */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'nowrap',
          alignItems: 'center',
          gap: 1.25,
          minWidth: 0,
          flex: '1 1 auto',
          [`@container main (max-width: ${NARROW_CONTAINER})`]: {
            flexWrap: 'wrap',
            gap: 1.25,
            flex: '1 1 auto',
          },
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
          sx={{ width: 88, flexShrink: 0, '& .MuiInputBase-input': { fontSize: '0.875rem' }, '& .MuiInputLabel-root': { fontSize: '0.78rem' } }}
        />
        <TextField
          size="small"
          type="number"
          label="Expenses"
          value={additionalExpenses}
          onChange={(e) => onExpensesChange(Number(e.target.value) || 0)}
          inputProps={{ min: 0, 'aria-label': 'Expenses' }}
          sx={{ width: 88, flexShrink: 0, '& .MuiInputBase-input': { fontSize: '0.875rem' }, '& .MuiInputLabel-root': { fontSize: '0.78rem' } }}
        />
      </Box>

      {netTotalBlock}
    </Box>
  );
}
