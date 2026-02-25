/**
 * Invoice Search Header — "By Invoice No" tab.
 * Invoice number input, Go, Clear; loading and error state.
 */
import React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

export default function InvoiceSearchHeader({
  invoiceNo,
  onInvoiceNoChange,
  onSearch,
  onClear,
  loading = false,
  error = null,
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 2,
        py: 2,
        px: 2,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.default',
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
        Order Replication from Invoice
      </Typography>
      <TextField
        size="small"
        placeholder="Invoice #"
        value={invoiceNo}
        onChange={(e) => onInvoiceNoChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        error={!!error}
        helperText={error}
        disabled={loading}
        sx={{ minWidth: 200 }}
        inputProps={{ 'aria-label': 'Invoice number' }}
      />
      <Button
        variant="contained"
        startIcon={<SearchIcon />}
        onClick={onSearch}
        disabled={loading || !(invoiceNo && invoiceNo.trim())}
      >
        {loading ? '…' : 'Go'}
      </Button>
      <Button variant="outlined" startIcon={<ClearIcon />} onClick={onClear} disabled={loading}>
        Clear
      </Button>
    </Box>
  );
}
