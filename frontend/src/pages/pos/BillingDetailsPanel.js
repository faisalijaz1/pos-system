import React from 'react';
import { Box, Typography, TextField, FormControlLabel, Checkbox, Button, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PaymentIcon from '@mui/icons-material/Payment';
import { DATE_INPUT_SX } from './posUtils';

/**
 * Billing details: horizontal row (desktop) - Billing No, Date, Packing, Remarks;
 * checkboxes; green Complete Sale (F4) CTA.
 */
export default function BillingDetailsPanel({
  billingNo,
  billingDate,
  billingPacking,
  billingAdda,
  remarks,
  printWithoutBalance,
  printWithoutHeader,
  onBillingNoChange,
  onBillingDateChange,
  onBillingPackingChange,
  onBillingAddaChange,
  onRemarksChange,
  onPrintWithoutBalanceChange,
  onPrintWithoutHeaderChange,
  onCompleteSale,
  completeDisabled,
  loading,
}) {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      style={{paddingTop:'23px'}}
      sx={{
        p: 2,
        mt: 1.5,
        borderRadius: 2,
        boxShadow: theme.palette.mode === 'dark' ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="subtitle2" fontWeight={700} color="text.primary" sx={{ mb: 1.5 }}>
        Billing Details
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          flexWrap: 'wrap',
          gap: 1.5,
          mb: 1.5,
        }}
      >
        <TextField
          size="small"
          label="Billing No."
          value={billingNo}
          onChange={(e) => onBillingNoChange(e.target.value)}
          sx={{ minWidth: { md: 120 } }}
          inputProps={{ 'aria-label': 'Billing number' }}
        />
        <TextField
          size="small"
          type="date"
          label="Billing Date"
          value={billingDate}
          onChange={(e) => onBillingDateChange(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: { md: 140 }, ...DATE_INPUT_SX }}
          inputProps={{ 'aria-label': 'Billing date' }}
        />
        <TextField
          size="small"
          label="Packing"
          value={billingPacking}
          onChange={(e) => onBillingPackingChange(e.target.value)}
          sx={{ minWidth: { md: 120 } }}
          inputProps={{ 'aria-label': 'Packing' }}
        />
        <TextField
          size="small"
          label="Adda"
          value={billingAdda}
          onChange={(e) => onBillingAddaChange(e.target.value)}
          sx={{ minWidth: { md: 120 } }}
          inputProps={{ 'aria-label': 'Adda' }}
        />
        <TextField
          size="small"
          label="Remarks"
          value={remarks}
          onChange={(e) => onRemarksChange(e.target.value)}
          multiline
          minRows={1}
          sx={{ flex: 1, minWidth: { md: 180 } }}
          inputProps={{ 'aria-label': 'Remarks' }}
        />
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={printWithoutBalance}
              onChange={(e) => onPrintWithoutBalanceChange(e.target.checked)}
              inputProps={{ 'aria-label': 'Print without balance' }}
            />
          }
          label="Print without balance"
        />
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={printWithoutHeader}
              onChange={(e) => onPrintWithoutHeaderChange(e.target.checked)}
              inputProps={{ 'aria-label': 'Print without header' }}
            />
          }
          label="Print without header"
        />
      </Box>
      <Button
        variant="contained"
        color="success"
        size="large"
        startIcon={<PaymentIcon />}
        onClick={onCompleteSale}
        disabled={completeDisabled || loading}
        sx={{
          py: 1.25,
          px: 3,
          fontWeight: 700,
          minHeight: 44,
          boxShadow: 2,
          '&:focus-visible': { outline: '2px solid', outlineOffset: 2, outlineColor: theme.palette.success.main },
        }}
        aria-label="Complete sale (F4)"
      >
        {loading ? '…' : 'Complete Sale (F4)'}
      </Button>
    </Paper>
  );
}
