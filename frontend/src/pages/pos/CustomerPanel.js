import React from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Autocomplete,
  Divider,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import { formatMoney } from './posUtils';

/**
 * Customer Details Panel — desktop-parity: always show same layout.
 * Cash Customer, Customer dropdown, ID, Prev Bal (highlighted), This Bill (live).
 */
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
  netTotal,
  hideTitle,
}) {
  const theme = useTheme();

  const getOptionLabel = (o) => {
    if (typeof o === 'string') return o;
    const name = o.name || o.nameEnglish || '';
    const code = o.customerCode ? ` (${o.customerCode})` : '';
    return (name + code).trim() || 'Select';
  };

  const showCustomerFields = !isCashCustomer && selectedCustomer;
  const idValue = showCustomerFields ? selectedCustomer.customerId : '—';
  const prevBalValue = showCustomerFields ? prevBalance : (isCashCustomer ? '—' : 0);
  const thisBillValue = showCustomerFields ? withThisBill : (netTotal != null ? netTotal : 0);
  const hasPrevBal = showCustomerFields && prevBalance != null && Number(prevBalance) !== 0;

  return (
    <Box sx={{ mb: 0 }}>
      {!hideTitle && (
        <>
          <Typography variant="subtitle2" fontWeight={700} color="text.primary" sx={{ mb: 0.75 }}>
            Customer Details
          </Typography>
          <Divider sx={{ mb: 1 }} />
        </>
      )}
      <FormControlLabel
        control={
          <Checkbox
            size="small"
            checked={isCashCustomer}
            onChange={(e) => onCashCustomerChange(e.target.checked)}
          />
        }
        label={<Typography variant="body2">Cash Customer</Typography>}
        sx={{ mb: 1 }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
        Customer
      </Typography>
      <Autocomplete
        size="small"
        options={customerOptions}
        getOptionLabel={getOptionLabel}
        value={selectedCustomer}
        inputValue={customerInput}
        onInputChange={(_, v) => onCustomerInputChange(v)}
        onChange={(_, v) => {
          onCustomerChange(v);
        }}
        renderInput={(params) => (
          <TextField {...params} placeholder="Search name or code (min 2 chars)" />
        )}
        sx={{ mb: 1 }}
      />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          alignItems: 'center',
          gap: 0.5,
          columnGap: 1.5,
          fontSize: '0.8125rem',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          ID
        </Typography>
        <Typography component="span" variant="body2" fontWeight={600}>
          {idValue}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Prev Bal
        </Typography>
        <Box
          component="span"
          sx={{
            fontWeight: 700,
            px: 1,
            py: 0.25,
            borderRadius: 0.5,
            textAlign: 'right',
            fontVariantNumeric: 'tabular-nums',
            ...(hasPrevBal
              ? {
                  bgcolor: alpha(theme.palette.warning.main, 0.15),
                  color: theme.palette.mode === 'dark' ? theme.palette.warning.light : theme.palette.warning.dark,
                }
              : { color: 'text.secondary' }),
          }}
        >
          {prevBalValue === '—' ? '—' : formatMoney(prevBalValue)}
        </Box>
        <Typography variant="caption" color="text.secondary">
          This Bill
        </Typography>
        <Typography component="span" variant="body2" fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {thisBillValue === '—' ? '—' : formatMoney(thisBillValue)}
        </Typography>
      </Box>
    </Box>
  );
}
