/**
 * Sequential Navigation Bar — Top filter for Sales History tab.
 * Filter by Day (date picker), navigation: First, Previous, Next, Last.
 * Optional: By Invoice No search.
 */
import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { DATE_INPUT_SX } from './posUtils';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LastPageIcon from '@mui/icons-material/LastPage';

export default function SequentialNavigationBar({
  filterType = 'day',
  selectedDate,
  onDateChange,
  onNavigate,
  disableFirst = false,
  disablePrev = false,
  disableNext = false,
  disableLast = false,
  invoiceNoSearch = '',
  onInvoiceNoSearchChange,
  onInvoiceNoGo,
  loading = false,
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 2,
        py: 1.5,
        px: 2,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.default',
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
        Sequential Navigation
      </Typography>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel id="seq-filter-label">Filter</InputLabel>
        <Select labelId="seq-filter-label" value={filterType} label="Filter" disabled>
          <MenuItem value="day">By Day</MenuItem>
          <MenuItem value="month">By Month</MenuItem>
        </Select>
      </FormControl>
      <TextField
        size="small"
        type="date"
        value={selectedDate || ''}
        onChange={(e) => onDateChange(e.target.value)}
        InputLabelProps={{ shrink: true }}
        sx={DATE_INPUT_SX}
        disabled={loading}
      />
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<FirstPageIcon />}
          onClick={() => onNavigate('first')}
          disabled={disableFirst || loading}
          aria-label="First invoice"
        >
          First
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<NavigateBeforeIcon />}
          onClick={() => onNavigate('prev')}
          disabled={disablePrev || loading}
          aria-label="Previous invoice"
        >
          Prev
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<NavigateNextIcon />}
          onClick={() => onNavigate('next')}
          disabled={disableNext || loading}
          aria-label="Next invoice"
        >
          Next
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<LastPageIcon />}
          onClick={() => onNavigate('last')}
          disabled={disableLast || loading}
          aria-label="Last invoice"
        >
          Last
        </Button>
      </Box>
      {onInvoiceNoSearchChange != null && (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            By Invoice No
          </Typography>
          <TextField
            size="small"
            placeholder="Invoice #"
            value={invoiceNoSearch}
            onChange={(e) => onInvoiceNoSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onInvoiceNoGo && onInvoiceNoGo()}
            sx={{ width: 140 }}
            disabled={loading}
          />
          {onInvoiceNoGo && (
            <Button size="small" variant="contained" onClick={onInvoiceNoGo} disabled={loading || !invoiceNoSearch.trim()}>
              Go
            </Button>
          )}
        </>
      )}
    </Box>
  );
}
