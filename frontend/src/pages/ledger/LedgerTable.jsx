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
  const isDark = theme.palette.mode === 'dark';
  const headerBg = isDark ? '#3b4b63' : '#4f6696';
  const rowOddBg = isDark ? '#1e2a40' : '#ffffff';
  const rowEvenBg = isDark ? '#223048' : '#f7faff';
  const rowHoverBg = isDark ? '#2a3953' : '#edf3ff';

  if (!entries || entries.length === 0) {
    return (
      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        <TableContainer>
          <Table
            size="small"
            stickyHeader
            sx={{
              '& thead th': {
                backgroundColor: headerBg,
                color: '#fff',
                fontWeight: 600,
                borderBottom: '1px solid',
                borderBottomColor: isDark ? alpha('#ffffff', 0.08) : alpha('#000000', 0.12),
                whiteSpace: 'nowrap',
              },
              '& tbody td': {
                borderColor: isDark ? alpha('#ffffff', 0.07) : alpha('#000000', 0.1),
              },
              '& tbody tr:nth-of-type(odd) td': {
                bgcolor: rowOddBg,
              },
              '& tbody tr:nth-of-type(even) td': {
                bgcolor: rowEvenBg,
              },
            }}
          >
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
        <Table
          size="small"
          stickyHeader
          sx={{
            minWidth: 640,
            '& thead th': {
              backgroundColor: headerBg,
              color: '#fff',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              borderBottom: '1px solid',
              borderBottomColor: isDark ? alpha('#ffffff', 0.08) : alpha('#000000', 0.12),
            },
            '& tbody td': {
              borderColor: isDark ? alpha('#ffffff', 0.07) : alpha('#000000', 0.1),
              fontSize: '0.8125rem',
              lineHeight: 1.25,
            },
            '& tbody tr:nth-of-type(odd) td': {
              bgcolor: rowOddBg,
            },
            '& tbody tr:nth-of-type(even) td': {
              bgcolor: rowEvenBg,
            },
            '& tbody tr:hover td': {
              bgcolor: rowHoverBg,
            },
          }}
        >
          <TableHead>
            <TableRow>
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
                sx={{}}
              >
                <TableCell sx={{ fontFamily: 'monospace' }}>{row.voucherNo}</TableCell>
                <TableCell>{formatLedgerDate(row.transactionDate)}</TableCell>
                <TableCell>{row.description || '—'}</TableCell>
                <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  {Number(row.debitAmount) > 0 ? formatMoney(row.debitAmount) : '—'}
                </TableCell>
                <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  {Number(row.creditAmount) > 0 ? formatMoney(row.creditAmount) : '—'}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
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
