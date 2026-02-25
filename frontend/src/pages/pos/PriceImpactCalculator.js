/**
 * Price Impact Calculator — Historical total, new total, difference and %.
 */
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { formatMoney } from './posUtils';

export default function PriceImpactCalculator({ historicalTotal = 0, newTotal = 0 }) {
  const diff = Number(newTotal) - Number(historicalTotal);
  const percent =
    historicalTotal !== 0 ? (((diff / Number(historicalTotal)) * 100).toFixed(1) + '%') : '—';

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 1,
        bgcolor: 'action.hover',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="body2" color="text.secondary">
        Historical Total: <strong>{formatMoney(historicalTotal)}</strong>
      </Typography>
      <Typography variant="body2" color="text.secondary">
        New Total: <strong>{formatMoney(newTotal)}</strong>
      </Typography>
      <Typography
        variant="body2"
        fontWeight={700}
        color={diff > 0 ? 'success.main' : diff < 0 ? 'error.main' : 'text.primary'}
      >
        Difference: {diff >= 0 ? '+' : ''}{formatMoney(diff)} ({diff >= 0 ? '+' : ''}{percent})
      </Typography>
    </Box>
  );
}
