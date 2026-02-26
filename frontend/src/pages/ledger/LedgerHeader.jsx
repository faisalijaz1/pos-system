import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { formatMoney } from './ledgerUtils';

export default function LedgerHeader({ account, report }) {
  if (!account) {
    return (
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography color="text.secondary">Select an account and date range, then click Go to load the ledger.</Typography>
        </CardContent>
      </Card>
    );
  }

  const balanceStr = `${formatMoney(account.currentBalance)} ${account.balanceType || 'Dr'}`;
  const hasReport = report && (report.fromDate != null || report.toDate != null);
  const closingStr = hasReport && report.closingBalance != null
    ? `${formatMoney(report.closingBalance)} ${report.closingBalanceType || 'Dr'}`
    : null;

  return (
    <Card variant="outlined" sx={{ mb: 2, bgcolor: 'background.paper' }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary">Account</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'baseline', mt: 0.5 }}>
          <Typography variant="body1">
            <strong>A/C Code:</strong> {account.accountCode}
          </Typography>
          <Typography variant="body1">
            <strong>Account Name:</strong> {account.accountName}
            {account.accountType ? ` : ${account.accountType}` : ''}
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Current balance (account): {balanceStr}
          </Typography>
          {closingStr != null && (
            <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
              Closing balance (this period): {closingStr}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
