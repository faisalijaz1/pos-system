import React from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  Paper,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PaymentIcon from '@mui/icons-material/Payment';
import { formatMoney, DATE_INPUT_SX } from './posUtils';

/**
 * Bottom panel: two columns (financial left, billing right), checkboxes + Net Total, then actions.
 * Visual hierarchy: Net Total 18–20px primary; Complete Sale green; Save/Cancel gray.
 */
export default function InvoiceBottomPanel({
  noOfTitles,
  totalQuantity,
  grandTotal,
  additionalDiscount,
  additionalExpenses,
  netTotal,
  onDiscountChange,
  onExpensesChange,
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
  onSave,
  onCancel,
  completeDisabled,
  loading,
  saveDisabled,
}) {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        boxShadow: theme.palette.mode === 'dark' ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="subtitle2" fontWeight={700} color="text.primary" sx={{ mb: 1 }}>
            Summary
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <Typography variant="body2" color="text.secondary">
              No. of titles: <strong>{noOfTitles}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total qty: <strong>{totalQuantity}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Subtotal: <strong>{formatMoney(grandTotal)}</strong>
            </Typography>
            <TextField
              size="small"
              type="number"
              label="Discount"
              value={additionalDiscount}
              onChange={(e) => onDiscountChange(Number(e.target.value) || 0)}
              inputProps={{ min: 0, 'aria-label': 'Discount' }}
              sx={{ width: 120, mt: 0.5 }}
            />
            <TextField
              size="small"
              type="number"
              label="Expenses"
              value={additionalExpenses}
              onChange={(e) => onExpensesChange(Number(e.target.value) || 0)}
              inputProps={{ min: 0, 'aria-label': 'Expenses' }}
              sx={{ width: 120 }}
            />
          </Box>
        </Box>
        <Box>
          <Typography variant="subtitle2" fontWeight={700} color="text.primary" sx={{ mb: 1 }}>
            Billing
          </Typography>
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
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2,
          mb: 2,
          pt: 1,
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
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
        <Box sx={{ flex: 1, textAlign: 'right' }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            Net Total
          </Typography>
          <Typography
            component="span"
            sx={{
              fontSize: 18,
              fontWeight: 700,
              color: 'primary.main',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formatMoney(netTotal)}
          </Typography>
        </Box>
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

      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
        <Button
          variant="contained"
          color="success"
          size="medium"
          startIcon={<PaymentIcon />}
          onClick={onCompleteSale}
          disabled={completeDisabled || loading}
          sx={{
            py: 1,
            px: 2,
            fontWeight: 700,
            minHeight: 44,
            boxShadow: 2,
            '&:focus-visible': { outline: '2px solid', outlineOffset: 2, outlineColor: theme.palette.success.main },
          }}
          aria-label="Complete sale (F4)"
        >
          {loading ? '…' : 'Complete Sale (F4)'}
        </Button>
        <Button
          variant="contained"
          size="medium"
          onClick={onSave}
          disabled={saveDisabled || loading}
          sx={{ minHeight: 44, minWidth: 64, bgcolor: 'grey.600', '&:hover': { bgcolor: 'grey.700' } }}
          aria-label="Save draft"
        >
          Save
        </Button>
        <Button
          variant="outlined"
          color="inherit"
          size="medium"
          onClick={onCancel}
          disabled={loading}
          sx={{ minHeight: 44, minWidth: 64 }}
          aria-label="Cancel"
        >
          Cancel
        </Button>
      </Box>
    </Paper>
  );
}
