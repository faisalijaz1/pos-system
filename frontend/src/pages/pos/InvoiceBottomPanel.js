import React from 'react';
import { Box, Typography, TextField, FormControlLabel, Checkbox, Button, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PaymentIcon from '@mui/icons-material/Payment';
import { DATE_INPUT_SX } from './posUtils';

/**
 * Billing details only: two columns (Billing No, Date, Packing, Adda, Remarks),
 * checkboxes, and Complete Sale (F4) as primary action. No Save/Cancel.
 */
export default function InvoiceBottomPanel({
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
      sx={{
        p: 2,
        mt: 1,
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
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <TextField
            size="small"
            label="Billing No."
            value={billingNo}
            onChange={(e) => onBillingNoChange(e.target.value)}
            inputProps={{ 'aria-label': 'Billing number' }}
          />
          <TextField
            size="small"
            type="date"
            label="Billing Date"
            value={billingDate}
            onChange={(e) => onBillingDateChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={DATE_INPUT_SX}
            inputProps={{ 'aria-label': 'Billing date' }}
          />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <TextField
            size="small"
            label="Packing"
            value={billingPacking}
            onChange={(e) => onBillingPackingChange(e.target.value)}
            inputProps={{ 'aria-label': 'Packing' }}
          />
          {onBillingAddaChange && (
            <TextField
              size="small"
              label="Adda"
              value={billingAdda || ''}
              onChange={(e) => onBillingAddaChange(e.target.value)}
              inputProps={{ 'aria-label': 'Adda' }}
            />
          )}
          <TextField
            size="small"
            label="Remarks"
            value={remarks}
            onChange={(e) => onRemarksChange(e.target.value)}
            multiline
            minRows={1}
            inputProps={{ 'aria-label': 'Remarks' }}
          />
        </Box>
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
          label="Print w/o balance"
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
          label="Print w/o header"
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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
      </Box>
    </Paper>
  );
}
