/**
 * Billing Details Panel — Bottom-left in Sales History.
 * Billing No, Date, Packing, Adda. Editable when in edit mode.
 */
import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { DATE_INPUT_SX } from './posUtils';

const editableFieldSx = {
  bgcolor: 'rgba(25, 118, 210, 0.04)',
  borderRadius: 1,
  '& .MuiOutlinedInput-root': {
    bgcolor: 'rgba(25, 118, 210, 0.04)',
    '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.08)' },
  },
};

export default function BillingDetailsPanel({
  billingNo,
  billingDate,
  billingPacking,
  billingAdda,
  editable,
  onBillingNoChange,
  onBillingDateChange,
  onBillingPackingChange,
  onBillingAddaChange,
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
        height: '100%',
        ...(editable ? { borderLeft: '3px solid', borderLeftColor: 'primary.main', pl: 2.5 } : {}),
      }}
    >
      <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1.5 }}>
        Billing Details
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <TextField
          size="small"
          label="No."
          value={billingNo ?? ''}
          onChange={editable && onBillingNoChange ? (e) => onBillingNoChange(e.target.value) : undefined}
          readOnly={!editable}
          fullWidth
          sx={editable ? editableFieldSx : {}}
        />
        <TextField
          size="small"
          type="date"
          label="Date"
          value={dateStr ?? ''}
          onChange={editable && onBillingDateChange ? (e) => onBillingDateChange(e.target.value) : undefined}
          InputLabelProps={{ shrink: true }}
          sx={editable ? { ...DATE_INPUT_SX, ...editableFieldSx } : DATE_INPUT_SX}
          readOnly={!editable}
          fullWidth
        />
        <TextField
          size="small"
          label="Packing"
          value={billingPacking ?? ''}
          onChange={editable && onBillingPackingChange ? (e) => onBillingPackingChange(e.target.value) : undefined}
          readOnly={!editable}
          fullWidth
          sx={editable ? editableFieldSx : {}}
        />
        <TextField
          size="small"
          label="Adda"
          value={billingAdda ?? ''}
          onChange={editable && onBillingAddaChange ? (e) => onBillingAddaChange(e.target.value) : undefined}
          readOnly={!editable}
          fullWidth
          sx={editable ? editableFieldSx : {}}
        />
      </Box>
    </Paper>
  );
}
