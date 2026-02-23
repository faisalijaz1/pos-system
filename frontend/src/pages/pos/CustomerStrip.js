import React from 'react';
import { Box, Typography, Autocomplete, TextField } from '@mui/material';
import { formatMoney } from './posUtils';

/**
 * Customer strip: Customer label + dropdown (only database customers, no "Cash Customer" option).
 * When Cash Customer is checked in header, display "Cash Customer" in the field; otherwise show selected customer.
 */
export default function CustomerStrip({
  isCashCustomer,
  onCashCustomerChange,
  selectedCustomer,
  customerOptions = [],
  customerInput,
  onCustomerInputChange,
  onCustomerChange,
  prevBalance,
  withThisBill,
  netTotal,
}) {
  const getOptionLabel = (o) => {
    if (!o || typeof o === 'string') return o || '';
    const name = o.name || o.nameEnglish || '';
    const code = o.customerCode ? ` (${o.customerCode})` : '';
    return (name + code).trim() || 'Select';
  };

  const value = selectedCustomer || null;
  const inputValue = isCashCustomer ? 'Cash Customer' : (selectedCustomer ? getOptionLabel(selectedCustomer) : customerInput);

  const filterOptions = (opts, { inputValue: q }) => {
    const query = (q || '').trim().toLowerCase();
    if (!query) return opts;
    return opts.filter((o) => getOptionLabel(o).toLowerCase().includes(query));
  };

  const prevBalDisplay = isCashCustomer ? 0 : (selectedCustomer && prevBalance != null ? Number(prevBalance) : 0);
  const thisBillDisplay = isCashCustomer ? (netTotal != null ? netTotal : 0) : (selectedCustomer ? withThisBill : netTotal != null ? netTotal : 0);

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 1,
        py: 0.75,
        px: 1.5,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'action.hover',
      }}
    >
      <Typography variant="body2" color="text.secondary" component="span">
        Customer:
      </Typography>
      <Autocomplete
        size="small"
        options={customerOptions}
        getOptionLabel={getOptionLabel}
        value={value}
        inputValue={inputValue}
        onInputChange={(_, v) => {
          if (isCashCustomer) onCashCustomerChange(false);
          onCustomerInputChange(v);
        }}
        filterOptions={filterOptions}
        onChange={(_, v) => {
          onCustomerChange(v || null);
          if (v) onCashCustomerChange(false);
        }}
        isOptionEqualToValue={(opt, val) => opt && val && opt.customerId === val.customerId}
        renderInput={(params) => (
          <TextField {...params} placeholder="Search by name or code" size="small" sx={{ width: 260, '& .MuiInputBase-root': { bgcolor: 'background.paper' } }} />
        )}
        sx={{ minWidth: 260 }}
      />
      <Typography variant="body2" color="text.secondary" component="span" sx={{ mx: 0.5 }}>
        |
      </Typography>
      <Typography variant="body2" color="text.secondary" component="span">
        Prev Bal: <strong>{formatMoney(prevBalDisplay)}</strong>
      </Typography>
      <Typography variant="body2" color="text.secondary" component="span" sx={{ mx: 0.5 }}>
        |
      </Typography>
      <Typography variant="body2" color="text.secondary" component="span">
        This Bill: <strong>{formatMoney(thisBillDisplay)}</strong>
      </Typography>
    </Box>
  );
}
