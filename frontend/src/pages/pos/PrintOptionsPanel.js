/**
 * Print Options Panel — Under Customer Details in Sales History.
 * Remarks and print checkboxes. No Save/Cancel (those live in header).
 */
import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

export default function PrintOptionsPanel({
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
        Print Options
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
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
