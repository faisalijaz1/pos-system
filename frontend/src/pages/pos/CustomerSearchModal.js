/**
 * Customer Search Modal — Change customer for new order. Search by name, show balance, select.
 */
import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import { customersApi } from '../../api/customers';
import { formatMoney } from './posUtils';

export default function CustomerSearchModal({ open, onClose, onSelectCustomer }) {
  const [search, setSearch] = useState('');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSearch('');
    setList([]);
    const q = search.trim();
    if (q.length < 1) {
      customersApi.list('', 0, 50).then((res) => {
        const content = res.data?.content ?? res.data ?? [];
        setList(Array.isArray(content) ? content : []);
      }).catch(() => setList([]));
      return;
    }
    setLoading(true);
    customersApi.list(q, 0, 30)
      .then((res) => {
        const content = res.data?.content ?? res.data ?? [];
        setList(Array.isArray(content) ? content : []);
      })
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [open, search]);

  const handleSelect = (customer) => {
    onSelectCustomer && onSelectCustomer(customer);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Change Customer</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
          autoFocus
        />
        {loading && (
          <Typography variant="body2" color="text.secondary">
            Loading…
          </Typography>
        )}
        <List dense>
          {list.map((c) => (
            <ListItemButton key={c.customerId} onClick={() => handleSelect(c)}>
              <ListItemText
                primary={c.name || c.nameEnglish || c.customerCode || `#${c.customerId}`}
                secondary={
                  c.customerCode ? `Code: ${c.customerCode}` : null
                }
              />
              {c.currentBalance != null && (
                <Typography variant="body2" color="text.secondary">
                  Bal: {formatMoney(c.currentBalance)}
                </Typography>
              )}
            </ListItemButton>
          ))}
        </List>
        {!loading && list.length === 0 && search.trim().length > 0 && (
          <Typography variant="body2" color="text.secondary">
            No customers found.
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}
