import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Paper,
  TablePagination,
  InputAdornment,
  Skeleton,
  useTheme,
  alpha,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { productsApi } from '../api/products';

function formatMoney(n) {
  if (n == null) return '—';
  return new Intl.NumberFormat('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Number(n));
}

const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100];

export default function Products() {
  const theme = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalElements, setTotalElements] = useState(0);

  const load = useCallback(() => {
    setLoading(true);
    productsApi
      .list(name ? { name } : {}, page, rowsPerPage)
      .then((res) => {
        setProducts(res.data?.content ?? []);
        setTotalElements(res.data?.totalElements ?? 0);
      })
      .catch(() => {
        setProducts([]);
        setTotalElements(0);
      })
      .finally(() => setLoading(false));
  }, [name, page, rowsPerPage]);

  useEffect(() => setPage(0), [name]);
  useEffect(() => load(), [load]);

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>Products</Typography>
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            size="small"
            placeholder="Search by name or code..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ minWidth: 280 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>
              ),
            }}
          />
        </Box>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
              <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Stock</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Cost</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Selling Price</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}><Skeleton height={40} /></TableCell>
                </TableRow>
              ))
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>No products found</TableCell>
              </TableRow>
            ) : (
              products.map((p) => (
                <TableRow key={p.productId} hover>
                  <TableCell>{p.code}</TableCell>
                  <TableCell>{p.nameEn ?? p.name_en}</TableCell>
                  <TableCell align="right">{Number(p.currentStock ?? p.current_stock ?? 0)}</TableCell>
                  <TableCell align="right">{formatMoney(p.costPrice ?? p.cost_price)}</TableCell>
                  <TableCell align="right">{formatMoney(p.sellingPrice ?? p.selling_price)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
          showFirstButton
          showLastButton
        />
      </Paper>
    </Box>
  );
}
