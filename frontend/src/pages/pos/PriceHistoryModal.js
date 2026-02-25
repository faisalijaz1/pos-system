/**
 * Price History Modal — Shows past unit prices for a product from sales (reference invoices).
 */
import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { productsApi } from '../../api/products';
import { formatMoney } from './posUtils';

export default function PriceHistoryModal({ open, onClose, productId, productCode, productName }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !productId) {
      setList([]);
      return;
    }
    setLoading(true);
    productsApi
      .getPriceHistory(productId, 25)
      .then((res) => {
        const data = res.data || [];
        setList(Array.isArray(data) ? data : []);
      })
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [open, productId]);

  const minPrice = list.length ? Math.min(...list.map((e) => Number(e.unitPrice))) : null;
  const maxPrice = list.length ? Math.max(...list.map((e) => Number(e.unitPrice))) : null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Price history
        {productCode && (
          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            {productCode} {productName ? `· ${productName}` : ''}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={32} />
          </Box>
        )}
        {!loading && list.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No price history found for this product.
          </Typography>
        )}
        {!loading && list.length > 0 && (
          <>
            {(minPrice != null || maxPrice != null) && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Range: {formatMoney(minPrice)} – {formatMoney(maxPrice)}
              </Typography>
            )}
            <TableContainer sx={{ maxHeight: 360, border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Invoice</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Price</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Qty</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {list.map((entry, idx) => (
                    <TableRow key={idx} sx={{ '&:nth-of-type(even)': { bgcolor: 'action.hover' } }}>
                      <TableCell>
                        {entry.invoiceDate ? new Date(entry.invoiceDate).toISOString().slice(0, 10) : '—'}
                        {entry.invoiceTime != null && (
                          <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                            {String(entry.invoiceTime).slice(0, 5)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace' }}>{entry.invoiceNumber || '—'}</TableCell>
                      <TableCell align="right">{formatMoney(entry.unitPrice)}</TableCell>
                      <TableCell align="right">{formatMoney(entry.quantity)} {entry.uomName || ''}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
