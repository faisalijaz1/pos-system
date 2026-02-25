import React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Autocomplete from '@mui/material/Autocomplete';
import { toApiDate } from './ledgerUtils';

const today = new Date();
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

export default function LedgerFilter({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  accountOptions,
  selectedAccount,
  onAccountChange,
  onGo,
  onReset,
  onReport,
  onExit,
  loading,
  onAccountSearchChange,
}) {
  const defaultFrom = fromDate || toApiDate(firstDayOfMonth);
  const defaultTo = toDate || toApiDate(today);

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        alignItems: 'center',
        mb: 2,
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    >
      <TextField
        type="date"
        label="From"
        size="small"
        value={fromDate || defaultFrom}
        onChange={(e) => onFromDateChange(e.target.value)}
        InputLabelProps={{ shrink: true }}
        sx={{ minWidth: 150 }}
      />
      <TextField
        type="date"
        label="To"
        size="small"
        value={toDate || defaultTo}
        onChange={(e) => onToDateChange(e.target.value)}
        InputLabelProps={{ shrink: true }}
        sx={{ minWidth: 150 }}
      />
      <Autocomplete
        size="small"
        sx={{ minWidth: 280 }}
        options={accountOptions || []}
        value={selectedAccount || null}
        onChange={(_, v) => onAccountChange(v)}
        onInputChange={(_, v) => onAccountSearchChange && onAccountSearchChange(v)}
        getOptionLabel={(opt) => (opt ? `${opt.accountCode} — ${opt.accountName}` : '')}
        isOptionEqualToValue={(opt, val) => opt && val && opt.accountId === val.accountId}
        renderInput={(params) => (
          <TextField {...params} label="Account" placeholder="Search by code or name..." />
        )}
        renderOption={(props, option) => (
          <li {...props} key={option.accountId}>
            {option.accountCode} — {option.accountName}
            {option.accountType ? ` (${option.accountType})` : ''}
          </li>
        )}
      />
      <Button variant="contained" onClick={onGo} disabled={loading || !selectedAccount}>
        {loading ? '…' : 'Go'}
      </Button>
      <Button variant="outlined" onClick={onReset} disabled={loading}>
        Reset
      </Button>
      <Button variant="outlined" onClick={onReport} disabled={loading || !selectedAccount}>
        Report
      </Button>
      <Button variant="outlined" onClick={onExit}>
        Exit
      </Button>
    </Box>
  );
}
