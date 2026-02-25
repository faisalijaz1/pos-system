/**
 * Print Options Panel — Bottom-right in Sales History.
 * No. of Titles, Total Qty, Remarks, print checkboxes. No Save/Cancel (those live in header).
 */
import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

export default function PrintOptionsPanel({
  noOfTitles,
  totalQuantity,
  remarks,
  printWithoutHeader,
  printWithoutBalance,
  editable,
  onRemarksChange,
  onPrintWithoutHeaderChange,
  onPrintWithoutBalanceChange,
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        height: '100%',
      }}
    >
      <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1.5 }}>
        Print Options & Totals
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            No. of Titles:
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {noOfTitles ?? 0}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            Total Quantity:
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {totalQuantity ?? 0}
          </Typography>
        </Box>
        <TextField
          size="small"
          label="Remarks"
          value={remarks ?? ''}
          onChange={editable && onRemarksChange ? (e) => onRemarksChange(e.target.value) : undefined}
          readOnly={!editable}
          multiline
          minRows={1}
          fullWidth
          sx={editable ? { bgcolor: 'rgba(25, 118, 210, 0.04)', borderRadius: 1, '& .MuiOutlinedInput-root': { bgcolor: 'rgba(25, 118, 210, 0.04)' } } : {}}
        />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={printWithoutHeader ?? false}
                onChange={editable && onPrintWithoutHeaderChange ? (e) => onPrintWithoutHeaderChange(e.target.checked) : undefined}
                disabled={!editable}
              />
            }
            label="Without Header"
          />
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={!(printWithoutHeader ?? false)}
                disabled
                sx={{ opacity: 0.8 }}
              />
            }
            label="With Header"
          />
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={printWithoutBalance ?? false}
                onChange={editable && onPrintWithoutBalanceChange ? (e) => onPrintWithoutBalanceChange(e.target.checked) : undefined}
                disabled={!editable}
              />
            }
            label="Without Balance"
          />
        </Box>
      </Box>
    </Paper>
  );
}
