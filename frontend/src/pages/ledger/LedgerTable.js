import React from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { formatMoney, formatLedgerDate } from './ledgerUtils';

export default function LedgerTable({ entries, emptyMessage }) {
  const theme = useTheme();

  if (!entries || entries.length === 0) {
    return (
      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Vch #</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Particulars</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Dr</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Cr</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Balance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    {emptyMessage || 'No entries found for selected period.'}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 480, overflow: 'auto' }}>
        <Table size="small" stickyHeader sx={{ minWidth: 640 }}>
          <TableHead>
            <TableRow
              sx={{
                '& th': {
                  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.main,
                  color: '#fff',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                },
              }}
            >
              <TableCell>Vch #</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Particulars</TableCell>
              <TableCell align="right">Dr</TableCell>
              <TableCell align="right">Cr</TableCell>
              <TableCell align="right">Balance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map((row) => (
              <TableRow
                key={row.ledgerEntryId}
                hover
                sx={{
                  '&:nth-of-type(even)': { bgcolor: alpha(theme.palette.action.hover, 0.04) },
                }}
              >
                <TableCell sx={{ fontFamily: 'monospace' }}>{row.voucherNo}</TableCell>
                <TableCell>{formatLedgerDate(row.transactionDate)}</TableCell>
                <TableCell>{row.description || '—'}</TableCell>
                <TableCell align="right">
                  {Number(row.debitAmount) > 0 ? formatMoney(row.debitAmount) : '—'}
                </TableCell>
                <TableCell align="right">
                  {Number(row.creditAmount) > 0 ? formatMoney(row.creditAmount) : '—'}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 500 }}>
                  {formatMoney(row.runningBalance)} {row.balanceType || 'Dr'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
