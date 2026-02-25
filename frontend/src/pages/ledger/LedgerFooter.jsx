import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { formatMoney } from './ledgerUtils';

export default function LedgerFooter({ totalDr, totalCr, balance, balanceType }) {
  const balanceStr = balance != null ? `${formatMoney(balance)} ${balanceType || 'Dr'}` : '—';

  return (
    <Box
      sx={{
        mt: 2,
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 3,
        alignItems: 'center',
      }}
    >
      <Typography variant="body1" fontWeight={600}>
        Total Dr: {formatMoney(totalDr)}
      </Typography>
      <Typography variant="body1" fontWeight={600}>
        Total Cr: {formatMoney(totalCr)}
      </Typography>
      <Typography variant="body1" fontWeight={700} color="primary.main">
        Balance: {balanceStr}
      </Typography>
    </Box>
  );
}
