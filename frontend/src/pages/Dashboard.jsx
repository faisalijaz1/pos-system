import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Skeleton,
  Chip,
  Alert,
  useTheme,
  alpha,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { dashboardApi } from '../api/dashboard';

function KpiCard({ title, value, sub, icon, color = 'primary' }) {
  const theme = useTheme();
  const bg = alpha(theme.palette[color].main, 0.08);
  return (
    <Card sx={{ height: '100%', borderRadius: 3, overflow: 'hidden' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography color="text.secondary" variant="body2" fontWeight={600}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5 }}>
              {value}
            </Typography>
            {sub != null && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {sub}
              </Typography>
            )}
          </Box>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: bg }}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function formatMoney(n) {
  if (n == null) return '—';
  return new Intl.NumberFormat('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(n));
}

export default function Dashboard() {
  const [today, setToday] = useState(null);
  const [mtd, setMtd] = useState(null);
  const [profit, setProfit] = useState(null);
  const [trend, setTrend] = useState([]);
  const [bestProducts, setBestProducts] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [stockAlerts, setStockAlerts] = useState([]);
  const [cashFlow, setCashFlow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  const from = new Date();
  from.setDate(1);
  const fromStr = from.toISOString().slice(0, 10);
  const toStr = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [todayRes, mtdRes, profitRes, trendRes, bestRes, topRes, alertsRes, cashRes] =
          await Promise.all([
            dashboardApi.todaySales(),
            dashboardApi.monthToDate(),
            dashboardApi.profit(fromStr, toStr),
            dashboardApi.salesTrend(fromStr, toStr),
            dashboardApi.bestSellingProducts(fromStr, toStr, 5),
            dashboardApi.topCustomers(fromStr, toStr, 5),
            dashboardApi.stockAlerts(),
            dashboardApi.cashFlow(fromStr, toStr),
          ]);
        setToday(todayRes.data);
        setMtd(mtdRes.data);
        setProfit(profitRes.data);
        setTrend(trendRes.data?.data?.map((d) => ({ ...d, date: d.date?.slice(0, 10) })) || []);
        setBestProducts(bestRes.data || []);
        setTopCustomers(topRes.data || []);
        setStockAlerts(alertsRes.data || []);
        setCashFlow(cashRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <Box>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
          Dashboard
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rounded" height={120} />
            </Grid>
          ))}
          <Grid item xs={12}>
            <Skeleton variant="rounded" height={300} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Today's Sales"
            value={formatMoney(today?.totalSales)}
            sub={`${today?.invoiceCount ?? 0} invoices`}
            icon={<ReceiptIcon color="primary" />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Month to Date"
            value={formatMoney(mtd?.totalSales)}
            sub={`${mtd?.invoiceCount ?? 0} invoices`}
            icon={<TrendingUpIcon color="secondary" />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Profit (MTD)"
            value={formatMoney(profit?.profit)}
            sub={profit?.marginPercent != null ? `Margin ${Number(profit.marginPercent).toFixed(1)}%` : null}
            icon={<AccountBalanceIcon sx={{ color: 'success.main' }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Cash Flow (MTD)"
            value={formatMoney(cashFlow?.net)}
            sub={cashFlow != null ? `In ${formatMoney(cashFlow.inflows)} / Out ${formatMoney(cashFlow.outflows)}` : null}
            icon={<AccountBalanceIcon sx={{ color: 'info.main' }} />}
            color="info"
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, p: 2 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Sales Trend
            </Typography>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => formatMoney(v)} />
                <Tooltip formatter={(v) => [formatMoney(v), 'Amount']} labelFormatter={(l) => `Date: ${l}`} />
                <Area type="monotone" dataKey="amount" stroke={theme.palette.primary.main} fill="url(#colorAmount)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, p: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Stock Alerts
            </Typography>
            {stockAlerts.length === 0 ? (
              <Typography color="text.secondary">No low stock items</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {stockAlerts.slice(0, 8).map((item) => (
                  <Box
                    key={item.productId}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: 'action.hover',
                    }}
                  >
                    <Typography variant="body2" fontWeight={500} noWrap sx={{ maxWidth: '60%' }}>
                      {item.productName || item.productCode}
                    </Typography>
                    <Chip
                      size="small"
                      color="warning"
                      icon={<WarningAmberIcon />}
                      label={`${Number(item.currentStock)} / ${item.minStockLevel}`}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, p: 2 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Top Products
            </Typography>
            {bestProducts.length === 0 ? (
              <Typography color="text.secondary">No data</Typography>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={bestProducts} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => formatMoney(v)} />
                  <YAxis type="category" dataKey="productName" width={75} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => formatMoney(v)} />
                  <Bar dataKey="revenue" fill={theme.palette.primary.main} radius={[0, 4, 4, 0]} name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, p: 2 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Top Customers
            </Typography>
            {topCustomers.length === 0 ? (
              <Typography color="text.secondary">No data</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {topCustomers.map((c, i) => (
                  <Box
                    key={c.customerId}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: 'action.hover',
                    }}
                  >
                    <Typography variant="body2" fontWeight={500} noWrap sx={{ maxWidth: '70%' }}>
                      {i + 1}. {c.customerName}
                    </Typography>
                    <Typography variant="body2" color="primary" fontWeight={600}>
                      {formatMoney(c.totalSales)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
