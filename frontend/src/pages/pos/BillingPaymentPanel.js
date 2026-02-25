/**
 * Billing & Payment Panel — 4th column: Billing details, payment totals, print options, remarks.
 * All fields editable for the new order.
 */
import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { formatMoney } from './posUtils';
import { DATE_INPUT_SX } from './posUtils';

export default function BillingPaymentPanel({
  billingNo,
  billingDate,
  packing,
  adda,
  grandTotal,
  additionalDiscount,
  additionalExpenses,
  netTotal,
  amountReceived,
  printWithoutBalance,
  printWithoutHeader,
  remarks,
  onBillingNoChange,
  onBillingDateChange,
  onPackingChange,
  onAddaChange,
  onAdditionalDiscountChange,
  onAdditionalExpensesChange,
  onAmountReceivedChange,
  onPrintWithoutBalanceChange,
  onPrintWithoutHeaderChange,
  onRemarksChange,
}) {
  const dateStr = billingDate && (typeof billingDate === 'string' ? billingDate : billingDate.toISOString?.().slice(0, 10));

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        minHeight: 280,
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : '#fafafa'),
      }}
    >
      <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1.5 }}>
        Billing Details
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
        <TextField
          size="small"
          label="Billing No"
          value={billingNo ?? ''}
          onChange={(e) => onBillingNoChange && onBillingNoChange(e.target.value)}
          fullWidth
        />
        <TextField
          size="small"
          type="date"
          label="Billing Date"
          value={dateStr ?? ''}
          onChange={(e) => onBillingDateChange && onBillingDateChange(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={DATE_INPUT_SX}
          fullWidth
        />
        <TextField
          size="small"
          label="Packing"
          value={packing ?? ''}
          onChange={(e) => onPackingChange && onPackingChange(e.target.value)}
          fullWidth
        />
        <TextField
          size="small"
          label="Adda"
          value={adda ?? ''}
          onChange={(e) => onAddaChange && onAddaChange(e.target.value)}
          fullWidth
        />
      </Box>

      <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1 }}>
        Payment Details
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Grand Total: <strong>{formatMoney(grandTotal)}</strong>
        </Typography>
        <TextField
          size="small"
          type="number"
          label="Add Disc"
          value={additionalDiscount ?? 0}
          onChange={(e) => onAdditionalDiscountChange && onAdditionalDiscountChange(Number(e.target.value) || 0)}
          inputProps={{ min: 0 }}
          sx={{ width: '100%' }}
        />
        <TextField
          size="small"
          type="number"
          label="Add Exp"
          value={additionalExpenses ?? 0}
          onChange={(e) => onAdditionalExpensesChange && onAdditionalExpensesChange(Number(e.target.value) || 0)}
          inputProps={{ min: 0 }}
          sx={{ width: '100%' }}
        />
        <Typography variant="body2" color="text.secondary">
          Net Total: <strong>{formatMoney(netTotal)}</strong>
        </Typography>
        <TextField
          size="small"
          type="number"
          label="Amt Received"
          value={amountReceived ?? ''}
          onChange={(e) => onAmountReceivedChange && onAmountReceivedChange(e.target.value)}
          inputProps={{ min: 0 }}
          sx={{ width: '100%' }}
        />
      </Box>

      <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1 }}>
        Print Options
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0, mb: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={!!printWithoutBalance}
              onChange={(e) => onPrintWithoutBalanceChange && onPrintWithoutBalanceChange(e.target.checked)}
            />
          }
          label="Without Balance"
        />
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={!!printWithoutHeader}
              onChange={(e) => onPrintWithoutHeaderChange && onPrintWithoutHeaderChange(e.target.checked)}
            />
          }
          label="Without Header"
        />
        <FormControlLabel
          control={<Checkbox size="small" checked={!printWithoutHeader} disabled sx={{ opacity: 0.8 }} />}
          label="With Header"
        />
      </Box>

      <TextField
        size="small"
        label="Remarks"
        value={remarks ?? ''}
        onChange={(e) => onRemarksChange && onRemarksChange(e.target.value)}
        multiline
        minRows={1}
        fullWidth
      />
    </Paper>
  );
}
