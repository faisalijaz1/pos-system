/**
 * Customer Details Panel — Top-left in Sales History.
 * Displays customer id, name, prev balance, with this bill.
 * Cash customer checkbox and customer name are independent: when customerId is set, show that customer's name;
 * only show "Cash Customer" when there is no customer (cash sale).
 */
import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { formatMoney } from './posUtils';

export default function CustomerDetailsPanel({
  customerId,
  customerName,
  isCashCustomer,
  prevBalance,
  withThisBill,
  fetchCustomerName,
}) {
  const [resolvedName, setResolvedName] = useState(customerName);

  useEffect(() => {
    setResolvedName(customerName);
  }, [customerName]);

  useEffect(() => {
    if (customerId == null || customerId === '' || (customerName && customerName.trim())) return;
    if (!fetchCustomerName) return;
    let cancelled = false;
    fetchCustomerName(customerId)
      .then((name) => { if (!cancelled) setResolvedName(name || '—'); })
      .catch(() => { if (!cancelled) setResolvedName('—'); });
    return () => { cancelled = true; };
  }, [customerId, customerName, fetchCustomerName]);

  const nameDisplay =
    customerId != null && customerId !== ''
      ? (resolvedName || customerName || '—')
      : (isCashCustomer ? 'Cash Customer' : (customerName || '—'));

  const prevBal = prevBalance != null ? Number(prevBalance) : 0;
  const withBill = withThisBill != null ? Number(withThisBill) : 0;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        height: '100%',
        minHeight: 140,
      }}
    >
      <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1.5 }}>
        Customer Details
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Id:
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {customerId != null ? customerId : '—'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Name:
          </Typography>
          <Typography variant="body2" fontWeight={600} sx={{ flex: 1, minWidth: 0 }} noWrap>
            {nameDisplay}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Prev. Balance:
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {formatMoney(prevBal)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            With this Bill:
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {formatMoney(withBill)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
