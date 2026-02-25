/**
 * Price comparison display: old vs new with change indicator.
 */
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function PriceCell({ oldPrice, newPrice }) {
  const old = Number(oldPrice);
  const newVal = Number(newPrice);
  const change = newVal - old;
  const percent = old !== 0 ? ((change / old) * 100).toFixed(1) : '0';

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
        {old.toLocaleString('en-PK', { maximumFractionDigits: 0 })}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={700}
        color={change > 0 ? 'success.main' : change < 0 ? 'error.main' : 'text.primary'}
      >
        {newVal.toLocaleString('en-PK', { maximumFractionDigits: 0 })}
        {change !== 0 && (
          <Box component="span" sx={{ ml: 0.5 }}>
            {change > 0 ? '▲' : '▼'} {percent}%
          </Box>
        )}
      </Typography>
    </Box>
  );
}
