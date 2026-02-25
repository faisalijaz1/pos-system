/**
 * Invoice Header Panel — Top-right in Sales History.
 * Invoice #, Date, Time, Del. Mode, Sold Hist, Grand Total, Add Disc/Exp, Edit/Print/Exit.
 * Edit mode: button shows "Modify", editable fields active. View mode: "Edit".
 */
import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { formatMoney, formatTime, DATE_INPUT_SX, TIME_INPUT_SX } from './posUtils';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { DELIVERY_MODES } from './posUtils';

export default function InvoiceHeaderPanel({
  invoiceNumber,
  invoiceDate,
  invoiceTime,
  deliveryModeId,
  soldHist,
  grandTotal,
  additionalDiscount,
  additionalExpenses,
  netTotal,
  isEditMode,
  onEditToggle,
  onPrint,
  onExit,
  onInvoiceDateChange,
  onInvoiceTimeChange,
  onDeliveryModeChange,
  onAdditionalDiscountChange,
  onAdditionalExpensesChange,
  deliveryModeOptions = DELIVERY_MODES,
}) {
  const dateStr = invoiceDate && (typeof invoiceDate === 'string' ? invoiceDate : invoiceDate.toISOString?.().slice(0, 10));
  const timeStr = invoiceTime != null
    ? (typeof invoiceTime === 'string' ? String(invoiceTime).slice(0, 5) : formatTime(invoiceTime))
    : '';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        height: '100%',
        minHeight: 140,
      }}
    >
      <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1.5 }}>
        Invoice Header
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Invoice #:
          </Typography>
          <Typography variant="body2" fontWeight={700}>
            {invoiceNumber || '—'}
          </Typography>
          {onInvoiceDateChange && isEditMode && (
            <>
              <TextField
                size="small"
                type="date"
                label="Date"
                value={dateStr}
                onChange={(e) => onInvoiceDateChange(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={DATE_INPUT_SX}
              />
              <TextField
                size="small"
                type="time"
                label="Time"
                value={timeStr}
                onChange={(e) => onInvoiceTimeChange(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={TIME_INPUT_SX}
              />
            </>
          )}
          {(!isEditMode || !onInvoiceDateChange) && (
            <>
              <Typography variant="body2" color="text.secondary">
                Date:
              </Typography>
              <Typography variant="body2">{dateStr || '—'}</Typography>
              <Typography variant="body2" color="text.secondary">
                Time:
              </Typography>
              <Typography variant="body2">{timeStr || '—'}</Typography>
            </>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary">
            Del. Mode:
          </Typography>
          {isEditMode && onDeliveryModeChange ? (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Mode</InputLabel>
              <Select
                value={deliveryModeId ?? ''}
                label="Mode"
                onChange={(e) => onDeliveryModeChange(Number(e.target.value))}
              >
                {deliveryModeOptions.map((m) => (
                  <MenuItem key={m.deliveryModeId} value={m.deliveryModeId}>
                    {m.modeName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Typography variant="body2">
              {deliveryModeOptions.find((m) => m.deliveryModeId === deliveryModeId)?.modeName ?? '—'}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            Sold Hist:
          </Typography>
          <Typography variant="body2" sx={{ maxWidth: 200 }} noWrap title={soldHist}>
            {soldHist || 'N/A'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Grand Total:
          </Typography>
          <Typography variant="body2" fontWeight={700}>
            {formatMoney(grandTotal)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add Disc.:
          </Typography>
          {isEditMode && onAdditionalDiscountChange ? (
            <TextField
              size="small"
              type="number"
              inputProps={{ min: 0, step: 0.01 }}
              value={additionalDiscount ?? 0}
              onChange={(e) => onAdditionalDiscountChange(Number(e.target.value) || 0)}
              sx={{ width: 80 }}
            />
          ) : (
            <Typography variant="body2">{formatMoney(additionalDiscount)}</Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            Add Exp.:
          </Typography>
          {isEditMode && onAdditionalExpensesChange ? (
            <TextField
              size="small"
              type="number"
              inputProps={{ min: 0, step: 0.01 }}
              value={additionalExpenses ?? 0}
              onChange={(e) => onAdditionalExpensesChange(Number(e.target.value) || 0)}
              sx={{ width: 80 }}
            />
          ) : (
            <Typography variant="body2">{formatMoney(additionalExpenses)}</Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <Button
            size="small"
            variant="contained"
            color="success"
            startIcon={<EditIcon />}
            onClick={onEditToggle}
          >
            {isEditMode ? 'Modify' : 'Edit'}
          </Button>
          <Button size="small" variant="outlined" startIcon={<PrintIcon />} onClick={onPrint}>
            Print
          </Button>
          <Button size="small" variant="outlined" color="inherit" startIcon={<ExitToAppIcon />} onClick={onExit}>
            Exit
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
