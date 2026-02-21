import { useState, useEffect } from 'react';
import { Box, Typography, TextField, Table, TableBody, TableCell, TableRow, TableHead, Paper } from '@mui/material';
import { customersApi } from '../api/customers';

function formatMoney(n) {
  if (n == null) return '—';
  return new Intl.NumberFormat('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Number(n));
}

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');

  useEffect(() => {
    setLoading(true);
    customersApi
      .list(name, 0, 100)
      .then((res) => setCustomers(res.data?.content || []))
      .catch(() => setCustomers([]))
      .finally(() => setLoading(false));
  }, [name]);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>Customers</Typography>
      <TextField size="small" placeholder="Search by name" value={name} onChange={(e) => setName(e.target.value)} sx={{ mb: 2, minWidth: 280 }} />
      <Paper sx={{ overflow: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>City</TableCell>
              <TableCell align="right">Balance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4}>Loading…</TableCell></TableRow>
            ) : (
              customers.map((c) => (
                <TableRow key={c.customerId}>
                  <TableCell>{c.customerCode}</TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.city}</TableCell>
                  <TableCell align="right">{formatMoney(c.currentBalance)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
