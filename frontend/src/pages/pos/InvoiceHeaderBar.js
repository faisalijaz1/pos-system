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
  Button,
  ButtonGroup,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import { DELIVERY_MODES, TRANSACTION_TYPES, KEYBOARD_HINTS, DATE_INPUT_SX, TIME_INPUT_SX } from './posUtils';

/**
 * Invoice header: Invoice #, Date, Time, Trans type, Del mode, form actions (Save / Cancel / Clear), shortcuts.
 * Form actions = form lifecycle; Complete Sale stays separate at bottom (payment commitment).
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
  onTransactionTypeChange,
  onDeliveryModeChange,
  onSaveDraft,
  onCancel,
  onClear,
  saveDraftDisabled,
  loading,
}) {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        py: 1.25,
        px: 2,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 2,
        rowGap: 1.5,
        bgcolor: alpha(theme.palette.primary.main, 0.06),
        borderRadius: 1,
        border: '1px solid',
        borderColor: alpha(theme.palette.primary.main, 0.2),
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography
          variant="body2"
          fontWeight={700}
          sx={{
            flexShrink: 0,
            color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main,
          }}
        >
          Invoice #
        </Typography>
        <Typography
          variant="body2"
          component="span"
          sx={{
            fontFamily: 'monospace',
            fontWeight: 600,
            px: 1.25,
            py: 0.5,
            borderRadius: 0.75,
            bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.24 : 0.12),
            color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark,
            minWidth: 140,
            display: 'inline-block',
          }}
        >
          {invoiceNumber}
        </Typography>
      </Box>
      <TextField
        type="date"
        size="small"
        value={invoiceDate}
        onChange={(e) => onDateChange(e.target.value)}
        InputLabelProps={{ shrink: true }}
        sx={[
          DATE_INPUT_SX,
          theme.palette.mode === 'dark' && {
            '& input[type="date"]::-webkit-calendar-picker-indicator': { filter: 'invert(1)', opacity: 0.8 },
          },
        ]}
        inputProps={{ 'aria-label': 'Invoice date' }}
      />
      <TextField
        type="time"
        size="small"
        value={invoiceTime}
        onChange={(e) => onTimeChange(e.target.value)}
        InputLabelProps={{ shrink: true }}
        sx={[
          TIME_INPUT_SX,
          theme.palette.mode === 'dark' && {
            '& input[type="time"]::-webkit-calendar-picker-indicator': { filter: 'invert(1)', opacity: 0.8 },
          },
        ]}
        inputProps={{ 'aria-label': 'Invoice time' }}
      />
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel id="trans-type-label">Trans. Type</InputLabel>
        <Select
          labelId="trans-type-label"
          value={transactionTypeCode || 'SALE'}
          label="Trans. Type"
          onChange={(e) => onTransactionTypeChange && onTransactionTypeChange(e.target.value)}
        >
          {TRANSACTION_TYPES.map((t) => (
            <MenuItem key={t.code} value={t.code}>
              {t.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 128 }}>
        <InputLabel id="del-mode-label">Del. Mode</InputLabel>
        <Select
          labelId="del-mode-label"
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
      <ButtonGroup size="small" variant="outlined" sx={{ ml: 1 }}>
        <Button onClick={onSaveDraft} disabled={saveDraftDisabled || loading}>{loading ? '…' : 'Save'}</Button>
        <Button onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button onClick={onClear} disabled={loading}>Clear</Button>
      </ButtonGroup>
      {successMsg && (
        <Typography variant="caption" color="success.main" fontWeight={600}>
          {successMsg}
        </Typography>
      )}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ ml: 'auto', flexShrink: 0 }}
      >
        {KEYBOARD_HINTS}
      </Typography>
    </Paper>
  );
}
