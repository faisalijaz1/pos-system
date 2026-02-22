import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Skeleton } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { formatMoney } from './posUtils';

/**
 * Sold History — shows Last Qty, Last Date, Last Rate for the selected product (and customer).
 * Inline below product grid for cashier pricing validation.
 */
export default function SoldHistoryPanel({
  productId,
  productCode,
  productName,
  customerId,
  productsApiGetLastSale,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(
    function () {
      if (!productId || !productsApiGetLastSale) {
        setData(null);
        return;
      }
      setLoading(true);
      setData(null);
      productsApiGetLastSale(productId, customerId)
        .then(function (res) {
          if (res.status === 204 || res.data == null) setData(null);
          else setData(res.data);
        })
        .catch(function () {
          setData(null);
        })
        .finally(function () {
          setLoading(false);
        });
    },
    [productId, customerId, productsApiGetLastSale]
  );

  if (!productId) {
    return (
      <Paper variant="outlined" sx={{ p: 1.5, bgcolor: (t) => alpha(t.palette.primary.main, 0.04) }}>
        <Typography variant="caption" color="text.secondary">
          Select a line to see sold history
        </Typography>
      </Paper>
    );
  }

  if (loading) {
    return (
      <Paper variant="outlined" sx={{ p: 1.5 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>Sold History</Typography>
        <Skeleton variant="text" width="60%" height={20} />
        <Skeleton variant="text" width="40%" height={20} />
      </Paper>
    );
  }

  if (!data) {
    return (
      <Paper variant="outlined" sx={{ p: 1.5, bgcolor: (t) => alpha(t.palette.primary.main, 0.04) }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>Sold History</Typography>
        <Typography variant="body2" color="text.secondary">
          {productCode || productName ? `${productCode || productName} — no prior sale` : 'No prior sale'}
        </Typography>
      </Paper>
    );
  }

  const dateStr = data.invoiceDate ? new Date(data.invoiceDate).toLocaleDateString() : '—';
  const timeStr = data.invoiceTime != null ? String(data.invoiceTime).slice(0, 8) : '';

  return (
    <Paper variant="outlined" sx={{ p: 1.5, bgcolor: (t) => alpha(t.palette.primary.main, 0.04) }}>
      <Typography variant="subtitle2" fontWeight={700} color="primary" sx={{ mb: 0.75 }}>
        Sold History
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 0.25, columnGap: 1.5, fontSize: '0.8125rem' }}>
        <Typography variant="caption" color="text.secondary">Last Qty</Typography>
        <Typography variant="body2" fontWeight={600}>{formatMoney(data.quantity)} {data.uomName || ''}</Typography>
        <Typography variant="caption" color="text.secondary">Last Date</Typography>
        <Typography variant="body2">{dateStr}{timeStr ? ' ' + timeStr : ''}</Typography>
        <Typography variant="caption" color="text.secondary">Last Rate</Typography>
        <Typography variant="body2" fontWeight={600}>{formatMoney(data.unitPrice)}</Typography>
        {data.invoiceNumber && (
          <>
            <Typography variant="caption" color="text.secondary">Inv #</Typography>
            <Typography variant="body2">{data.invoiceNumber}</Typography>
          </>
        )}
      </Box>
    </Paper>
  );
}
