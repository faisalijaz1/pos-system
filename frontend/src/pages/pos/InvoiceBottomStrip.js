import React from 'react';
import { Box, Typography, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { formatMoney } from './posUtils';

const WIDE_CONTAINER = '920px';

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
        width: '100%',
        paddingTop: 0.75,
        borderTop: '1px solid',
        borderColor: 'divider',
        flexShrink: 0,
        // Wide main content (typically sidebar closed): keep on same row and remove separator line.
        [`@container main (min-width: ${WIDE_CONTAINER})`]: {
          width: 'auto',
          paddingTop: 0,
          borderTop: 'none',
          marginLeft: 'auto',
          marginTop: 0,
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
          px: 2,
          py: 0.8,
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
            fontSize: '1.2rem',
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
  );

  return (
    <Box
      className="bottom-strip"
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        rowGap: 1,
        columnGap: 1.5,
        padding: '12px 16px',
        background: stripBg,
        borderTop: '2px solid',
        borderBottom: '1px solid',
        borderColor: 'divider',
        borderRadius: 0,
        flexShrink: 0,
        marginBottom: 1,
        // Wide main content: one-row emphasis.
        [`@container main (min-width: ${WIDE_CONTAINER})`]: {
          flexWrap: 'nowrap',
          rowGap: 0,
          columnGap: 2,
        },
      }}
    >
      {/* Summary + inputs naturally wrap before NET total when width is tight. */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 1.5,
          minWidth: 0,
          flex: '1 1 560px',
          [`@container main (min-width: ${WIDE_CONTAINER})`]: {
            flexWrap: 'nowrap',
            gap: 1,
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
          sx={{ width: 96, flexShrink: 0, '& .MuiInputBase-input': { fontSize: '0.875rem' }, '& .MuiInputLabel-root': { fontSize: '0.78rem' } }}
        />
        <TextField
          size="small"
          type="number"
          label="Expenses"
          value={additionalExpenses}
          onChange={(e) => onExpensesChange(Number(e.target.value) || 0)}
          inputProps={{ min: 0, 'aria-label': 'Expenses' }}
          sx={{ width: 96, flexShrink: 0, '& .MuiInputBase-input': { fontSize: '0.875rem' }, '& .MuiInputLabel-root': { fontSize: '0.78rem' } }}
        />
      </Box>

      {netTotalBlock}
    </Box>
  );
}
