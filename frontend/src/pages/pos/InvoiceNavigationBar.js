import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { DATE_INPUT_SX } from './posUtils';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export default function InvoiceNavigationBar(props) {
  const {
    historyFrom,
    onHistoryFromChange,
    onFirst,
    onPrev,
    onNext,
    onLast,
    invoiceNoSearch,
    onInvoiceNoSearchChange,
    onFindByNumber,
    findLoading,
  } = props;
  return (
    <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 1.5, mt: 1 }}>
      <Typography variant="caption" fontWeight={600} color="text.secondary">Navigate</Typography>
      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
        <TextField type="date" size="small" value={historyFrom} onChange={(e) => onHistoryFromChange(e.target.value)} InputLabelProps={{ shrink: true }} sx={DATE_INPUT_SX} />
        <IconButton size="small" onClick={onFirst} title="First"><FirstPageIcon /></IconButton>
        <IconButton size="small" onClick={onPrev} title="Prev"><NavigateBeforeIcon /></IconButton>
        <IconButton size="small" onClick={onNext} title="Next"><NavigateNextIcon /></IconButton>
        <IconButton size="small" onClick={onLast} title="Last"><LastPageIcon /></IconButton>
      </Box>
      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, alignItems: 'center' }}>
        <TextField size="small" placeholder="Invoice #" value={invoiceNoSearch} onChange={(e) => onInvoiceNoSearchChange(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onFindByNumber()} sx={{ flex: 1, minWidth: 0 }} />
        <Button size="small" variant="outlined" onClick={onFindByNumber} disabled={findLoading || !invoiceNoSearch.trim()}>Find</Button>
      </Box>
    </Box>
  );
}
