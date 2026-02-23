import React from 'react';
import { Box, Typography, Autocomplete, TextField } from '@mui/material';
import { formatMoney } from './posUtils';

const CASH_OPTION = { _cash: true, name: 'Cash Customer', customerId: null };

/**
 * Customer strip: Customer label + dropdown always visible (Cash Customer + prepopulated list).
 * Filter as user types; no minimum character requirement.
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
    if (!o) return '';
    if (o._cash) return 'Cash Customer';
    if (typeof o === 'string') return o;
    const name = o.name || o.nameEnglish || '';
    const code = o.customerCode ? ` (${o.customerCode})` : '';
    return (name + code).trim() || 'Select';
  };

  const options = [CASH_OPTION, ...customerOptions];
  const value = isCashCustomer ? CASH_OPTION : (selectedCustomer || null);

  const filterOptions = (opts, { inputValue }) => {
    const q = (inputValue || '').trim().toLowerCase();
    if (!q) return opts;
    return opts.filter((o) => {
      if (o._cash) return 'cash customer'.includes(q) || q.length < 2;
      return getOptionLabel(o).toLowerCase().includes(q);
    });
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
        options={options}
        getOptionLabel={getOptionLabel}
        value={value}
        inputValue={customerInput}
        onInputChange={(_, v) => onCustomerInputChange(v)}
        filterOptions={filterOptions}
        onChange={(_, v) => {
          if (v && v._cash) {
            onCashCustomerChange(true);
            onCustomerChange(null);
          } else {
            onCashCustomerChange(false);
            onCustomerChange(v || null);
          }
        }}
        isOptionEqualToValue={(opt, val) => (opt._cash && val && val._cash) || (opt && val && opt.customerId === val.customerId)}
        renderInput={(params) => (
          <TextField {...params} placeholder="Cash Customer or search by name/code" size="small" sx={{ width: 260, '& .MuiInputBase-root': { bgcolor: 'background.paper' } }} />
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
