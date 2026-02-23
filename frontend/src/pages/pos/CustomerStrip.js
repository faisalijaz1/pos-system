import React from 'react';
import { Box, Typography, FormControlLabel, Checkbox, Autocomplete, TextField, Button } from '@mui/material';
import { formatMoney } from './posUtils';

/**
 * Single-line customer strip: Customer: [Cash] [Autocomplete] | Prev Bal: X | This Bill: Y
 * Inline dropdown, no hidden elements.
 */
export default function CustomerStrip({
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
}) {
  const getOptionLabel = (o) => {
    if (typeof o === 'string') return o;
    const name = o.name || o.nameEnglish || '';
    const code = o.customerCode ? ` (${o.customerCode})` : '';
    return (name + code).trim() || 'Select';
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
      {isCashCustomer ? (
        <>
          <Typography variant="body2" component="span" fontWeight={500}>
            Cash Customer
          </Typography>
          <Button size="small" variant="outlined" onClick={() => onCashCustomerChange(false)} sx={{ minWidth: 64, minHeight: 32 }} aria-label="Change customer">
            Change
          </Button>
        </>
      ) : (
        <>
          <Autocomplete
            size="small"
            options={customerOptions}
            getOptionLabel={getOptionLabel}
            value={selectedCustomer}
            inputValue={customerInput}
            onInputChange={(_, v) => onCustomerInputChange(v)}
            onChange={(_, v) => {
              onCustomerChange(v);
              if (v != null) onCashCustomerChange(false);
            }}
            renderInput={(params) => (
              <TextField {...params} placeholder="Search (min 2 chars)" size="small" sx={{ width: 200, '& .MuiInputBase-root': { bgcolor: 'background.paper' } }} />
            )}
            sx={{ minWidth: 200 }}
          />
          <Button size="small" variant="outlined" onClick={() => onCashCustomerChange(true)} sx={{ minWidth: 64, minHeight: 32 }} aria-label="Switch to cash customer">
            Change
          </Button>
        </>
      )}
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
