import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  TableContainer,
  Paper,
  InputAdornment,
  Typography,
  Box,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { alpha } from '@mui/material/styles';
import { formatMoney } from './posUtils';

/**
 * F2 Product Search Modal — full grid with keyboard nav (↑↓ select, Enter add, Esc close).
 */
export default function ProductSearchModal({
  open,
  onClose,
  products = [],
  uomList = [],
  onSelectProduct,
}) {
  const [filter, setFilter] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(0);
  const tableRef = useRef(null);
  const rowRefs = useRef([]);

  const filtered = useMemo(function () {
    if (!filter.trim()) return products.slice(0, 100);
    const q = filter.trim().toLowerCase();
    return products.filter(function (p) {
      const code = String(p.code || '').toLowerCase();
      const name = String(p.nameEn || p.name_en || '').toLowerCase();
      return code.includes(q) || name.includes(q);
    }).slice(0, 100);
  }, [products, filter]);

  const safeIndex = Math.min(Math.max(0, highlightIndex), Math.max(0, filtered.length - 1));
  const selectedProduct = filtered[safeIndex] || null;

  useEffect(function () {
    if (!open) {
      setFilter('');
      setHighlightIndex(0);
      return;
    }
    rowRefs.current = rowRefs.current.slice(0, filtered.length);
  }, [open, filtered.length]);

  useEffect(function () {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'ArrowDown' && filtered.length > 0) {
        e.preventDefault();
        setHighlightIndex(function (i) { return Math.min(i + 1, filtered.length - 1); });
        return;
      }
      if (e.key === 'ArrowUp' && filtered.length > 0) {
        e.preventDefault();
        setHighlightIndex(function (i) { return Math.max(0, i - 1); });
        return;
      }
      if (e.key === 'Enter' && selectedProduct) {
        e.preventDefault();
        onSelectProduct(selectedProduct);
      }
    }
    document.addEventListener('keydown', onKey);
    return function () { document.removeEventListener('keydown', onKey); };
  }, [open, filtered.length, selectedProduct, onSelectProduct, onClose]);

  useEffect(function () {
    if (selectedProduct && rowRefs.current[safeIndex]) {
      rowRefs.current[safeIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [safeIndex, selectedProduct]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { minHeight: 400 } }}>
      <DialogTitle>Product Search (F2) — ↑↓ select · Enter add · Esc close</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          size="small"
          placeholder="Filter by code or name..."
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setHighlightIndex(0); }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 1.5 }}
          autoFocus
        />
        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 420 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Brand / Category</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Stock</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Price</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>UOM</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(function (p, idx) {
                const uom = uomList.find(function (u) { return u.uomId === (p.uomId || p.uom_id); });
                const uomName = uom ? uom.name : (p.uomName || '—');
                const isSelected = idx === safeIndex;
                return (
                  <TableRow
                    key={p.productId}
                    ref={function (el) { rowRefs.current[idx] = el; }}
                    selected={isSelected}
                    onClick={() => onSelectProduct(p)}
                    sx={{
                      cursor: 'pointer',
                      ...(isSelected ? {
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.18),
                        borderLeft: (theme) => `3px solid ${theme.palette.primary.main}`,
                      } : {}),
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600 }}>{p.code}</TableCell>
                    <TableCell>{p.nameEn || p.name_en || ''}</TableCell>
                    <TableCell variant="body2" color="text.secondary">{p.brandName || ''} / {p.categoryName || ''}</TableCell>
                    <TableCell align="right">{formatMoney(p.currentStock)}</TableCell>
                    <TableCell align="right">{formatMoney(p.sellingPrice ?? p.selling_price)}</TableCell>
                    <TableCell>{uomName}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        {filtered.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            No products match. Type to filter.
          </Typography>
        )}
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {filtered.length} shown · Double-click or Enter to add to invoice
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
