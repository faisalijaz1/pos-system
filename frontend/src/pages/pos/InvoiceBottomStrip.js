import React from 'react';
import { Box, Typography, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { formatMoney } from './posUtils';

const CONTAINER_WIDE = '800px'; // main content above this = one row (sidebar closed); below = two rows (sidebar open)

/**
 * Bottom strip below table.
 * - When main content is WIDE (sidebar closed): single row — summary + Discount + Expenses left, NET Total right (original look).
 * - When main content is NARROW (sidebar open): two rows — Row 1 = summary + inputs, Row 2 = NET Total (full visibility).
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
        gap: 1.5,
        paddingTop: 1,
        borderTop: '1px solid',
        borderColor: 'divider',
        marginLeft: 'auto',
        flexShrink: 0,
        // Wide container: same row, no top border
        [`@container main (min-width: ${CONTAINER_WIDE})`]: {
          paddingTop: 0,
          borderTop: 'none',
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
  );

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
        // Wide container: single row, same as original
        [`@container main (min-width: ${CONTAINER_WIDE})`]: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 2,
        },
      }}
    >
      {/* Row 1 (or left part when wide): Summary + Discount + Expenses */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2.5,
          minWidth: 0,
          flex: '1 1 auto',
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

      {netTotalBlock}
    </Box>
  );
}
