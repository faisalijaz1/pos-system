import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import { DELIVERY_MODES, KEYBOARD_HINTS } from './posUtils';

/**
 * Invoice context bar: Invoice #, Date, Time, Trans type, Delivery mode, shortcuts.
 */
export default function InvoiceHeaderBar({
  invoiceNumber,
  invoiceDate,
  invoiceTime,
  transactionTypeCode,
  deliveryModeId,
  successMsg,
  onDateChange,
  onTimeChange,
  onDeliveryModeChange,
}) {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        py: 1,
        px: 2,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 2,
        bgcolor: alpha(theme.palette.primary.main, 0.06),
        borderRadius: 1,
        border: '1px solid',
        borderColor: alpha(theme.palette.primary.main, 0.2),
      }}
    >
      <Typography variant="body2" fontWeight={700} color="primary">
        Invoice #
      </Typography>
      <Typography variant="body2" sx={{ minWidth: 100 }}>
        {invoiceNumber}
      </Typography>
      <TextField
        type="date"
        size="small"
        value={invoiceDate}
        onChange={(e) => onDateChange(e.target.value)}
        InputLabelProps={{ shrink: true }}
        sx={{ width: 130 }}
        aria-label="Invoice date"
      />
      <TextField
        type="time"
        size="small"
        value={invoiceTime}
        onChange={(e) => onTimeChange(e.target.value)}
        InputLabelProps={{ shrink: true }}
        sx={{ width: 100 }}
        aria-label="Invoice time"
      />
      <Typography variant="body2" color="text.secondary">
        Trans.
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {transactionTypeCode}
      </Typography>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Del. Mode</InputLabel>
        <Select
          value={deliveryModeId}
          label="Del. Mode"
          onChange={(e) => onDeliveryModeChange(e.target.value)}
        >
          {DELIVERY_MODES.map((d) => (
            <MenuItem key={d.deliveryModeId} value={d.deliveryModeId}>
              {d.modeName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {successMsg && (
        <Typography variant="caption" color="success.main" fontWeight={600}>
          {successMsg}
        </Typography>
      )}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ ml: 'auto' }}
      >
        {KEYBOARD_HINTS}
      </Typography>
    </Paper>
  );
}
