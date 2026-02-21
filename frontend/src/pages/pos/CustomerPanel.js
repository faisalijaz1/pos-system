import React from 'react';
import { Box, Typography, TextField, FormControlLabel, Checkbox, Autocomplete } from '@mui/material';
import { formatMoney } from './posUtils';

export default function CustomerPanel({
  isCashCustomer,
  onCashCustomerChange,
  selectedCustomer,
  customerOptions,
  customerInput,
  onCustomerInputChange,
  onCustomerChange,
  prevBalance,
  withThisBill,
}) {
  const getOptionLabel = (o) => {
    if (typeof o === 'string') return o;
    const name = o.name || o.nameEnglish || '';
    const code = o.customerCode ? ` (${o.customerCode})` : '';
    return (name + code).trim() || 'Select';
  };

  return (
    <>
      <Typography variant="subtitle1" fontWeight={700} color="primary" sx={{ fontSize: '1.0625rem', mb: 0.5 }}>
        Customer
      </Typography>
      <FormControlLabel
        control={
          <Checkbox
            size="small"
            checked={isCashCustomer}
            onChange={(e) => onCashCustomerChange(e.target.checked)}
          />
        }
        label={<Typography variant="body2">Cash Customer</Typography>}
      />
      {!isCashCustomer && (
        <>
          <Autocomplete
            size="small"
            options={customerOptions}
            getOptionLabel={getOptionLabel}
            value={selectedCustomer}
            inputValue={customerInput}
            onInputChange={(_, v) => onCustomerInputChange(v)}
            onChange={(_, v) => onCustomerChange(v)}
            renderInput={(params) => (
              <TextField {...params} placeholder="Customer name/code" />
            )}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9375rem', mt: 0.5 }}>
            <span>Prev. Balance</span>
            <strong>{formatMoney(prevBalance)}</strong>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9375rem', mt: 0.25 }}>
            <span>With this Bill</span>
            <strong>{formatMoney(withThisBill)}</strong>
          </Box>
        </>
      )}
    </>
  );
}
