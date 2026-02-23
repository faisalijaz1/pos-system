import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import { KEYBOARD_HINTS, formatMoney } from './posUtils';
import CustomerPanel from './CustomerPanel';

/**
 * Card below top bar: Customer (Cash Customer or name) + [Change], optional prev balance, quick actions.
 */
export default function CustomerCardSection({
  isCashCustomer,
  onCashCustomerChange,
  selectedCustomer,
  customerOptions,
  customerInput,
  onCustomerInputChange,
  onCustomerChange,
  prevBalance,
  withThisBill,
  netTotal,
  onChangeClick,
}) {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        mb: 1.5,
        borderRadius: 2,
        boxShadow: theme.palette.mode === 'dark' ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon fontSize="small" color="action" aria-hidden />
          <Typography variant="subtitle2" fontWeight={700} color="text.primary">
            Customer
          </Typography>
          {isCashCustomer ? (
            <Typography variant="body2" color="text.secondary">Cash Customer</Typography>
          ) : selectedCustomer ? (
            <Typography variant="body2" fontWeight={600}>
              {selectedCustomer.name || selectedCustomer.nameEnglish || '—'}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">Select customer</Typography>
          )}
        </Box>
        <Button
          size="small"
          variant="outlined"
          onClick={onChangeClick}
          sx={{ minHeight: 44, minWidth: 64 }}
          aria-label="Change customer"
        >
          Change
        </Button>
      </Box>
      <CustomerPanel
        hideTitle
        isCashCustomer={isCashCustomer}
        onCashCustomerChange={onCashCustomerChange}
        selectedCustomer={selectedCustomer}
        customerOptions={customerOptions}
        customerInput={customerInput}
        onCustomerInputChange={onCustomerInputChange}
        onCustomerChange={onCustomerChange}
        prevBalance={prevBalance}
        withThisBill={withThisBill}
        netTotal={netTotal}
      />
      {selectedCustomer && !isCashCustomer && prevBalance != null && Number(prevBalance) !== 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          Prev balance: {formatMoney(prevBalance)}
        </Typography>
      )}
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        {KEYBOARD_HINTS}
      </Typography>
    </Paper>
  );
}
