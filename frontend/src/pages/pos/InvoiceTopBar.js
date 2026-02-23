import React from 'react';
import { Box, Typography, FormControl, Select, MenuItem, TextField, IconButton } from '@mui/material';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { DELIVERY_MODES, TRANSACTION_TYPES, KEYBOARD_HINTS } from './posUtils';

export default function InvoiceTopBar({
  invoiceNumber,
  invoiceDate,
  invoiceTime,
  transactionTypeCode,
  deliveryModeId,
  onDateChange,
  onTimeChange,
  onTransactionTypeChange,
  onDeliveryModeChange,
  onClear,
}) {
  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        px: 1.5,
        py: 0.5,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
            Invoice # {invoiceNumber}
          </Typography>
          {onClear && (
            <IconButton size="small" onClick={onClear} aria-label="Clear all" title="Clear All" sx={{ p: 0.5 }}>
              <ClearAllIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" color="text.secondary">Type:</Typography>
            <FormControl size="small" sx={{ minWidth: 90 }}>
              <Select
                value={transactionTypeCode || 'SALE'}
                onChange={(e) => onTransactionTypeChange && onTransactionTypeChange(e.target.value)}
                variant="standard"
                disableUnderline
                sx={{ fontSize: '0.8125rem', fontWeight: 600 }}
                inputProps={{ 'aria-label': 'Transaction type' }}
              >
                {TRANSACTION_TYPES.map((t) => (
                  <MenuItem key={t.code} value={t.code}>{t.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" color="text.secondary">Mode:</Typography>
            <FormControl size="small" sx={{ minWidth: 90 }}>
              <Select
                value={deliveryModeId}
                onChange={(e) => onDeliveryModeChange(e.target.value)}
                variant="standard"
                disableUnderline
                sx={{ fontSize: '0.8125rem', fontWeight: 600 }}
                inputProps={{ 'aria-label': 'Delivery mode' }}
              >
                {DELIVERY_MODES.map((d) => (
                  <MenuItem key={d.deliveryModeId} value={d.deliveryModeId}>{d.modeName}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" color="text.secondary">Date:</Typography>
            <TextField
              type="date"
              size="small"
              value={invoiceDate}
              onChange={(e) => onDateChange(e.target.value)}
              variant="standard"
              InputProps={{ disableUnderline: true }}
              inputProps={{ 'aria-label': 'Invoice date' }}
              sx={{ minWidth: 112, '& .MuiInputBase-input': { fontSize: '0.8125rem' } }}
            />
          </Box>
          {onTimeChange && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="caption" color="text.secondary">Time:</Typography>
              <TextField type="time" size="small" value={invoiceTime} onChange={(e) => onTimeChange(e.target.value)} variant="standard" InputProps={{ disableUnderline: true }} inputProps={{ 'aria-label': 'Invoice time' }} sx={{ minWidth: 88, '& .MuiInputBase-input': { fontSize: '0.8125rem' } }} />
            </Box>
          )}
        </Box>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', py: 0.25 }}>
        {KEYBOARD_HINTS}
      </Typography>
    </Box>
  );
}
