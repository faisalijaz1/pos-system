import React from 'react';
import { Box, Typography, FormControl, Select, MenuItem, TextField } from '@mui/material';
import { DELIVERY_MODES, TRANSACTION_TYPES, DATE_INPUT_SX } from './posUtils';

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
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.5,
        py: 0.75,
        px: 1.5,
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
        Invoice # {invoiceNumber}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="caption" color="text.secondary">Trans. Type:</Typography>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <Select
              value={transactionTypeCode || 'SALE'}
              onChange={(e) => onTransactionTypeChange && onTransactionTypeChange(e.target.value)}
              variant="standard"
              disableUnderline
              sx={{ fontSize: '0.875rem', fontWeight: 600 }}
              inputProps={{ 'aria-label': 'Transaction type' }}
            >
              {TRANSACTION_TYPES.map((t) => (
                <MenuItem key={t.code} value={t.code}>{t.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="caption" color="text.secondary">Del. Mode:</Typography>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <Select
              value={deliveryModeId}
              onChange={(e) => onDeliveryModeChange(e.target.value)}
              variant="standard"
              disableUnderline
              sx={{ fontSize: '0.875rem', fontWeight: 600 }}
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
            sx={{ minWidth: 120, '& .MuiInputBase-input': { fontSize: '0.875rem' } }}
          />
        </Box>
        {onTimeChange && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" color="text.secondary">Time:</Typography>
            <TextField type="time" size="small" value={invoiceTime} onChange={(e) => onTimeChange(e.target.value)} variant="standard" InputProps={{ disableUnderline: true }} inputProps={{ 'aria-label': 'Invoice time' }} sx={{ minWidth: 90, '& .MuiInputBase-input': { fontSize: '0.875rem' } }} />
          </Box>
        )}
      </Box>
    </Box>
  );
}
