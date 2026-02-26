import axiosInstance from './axios';

const params = (fromDate, toDate) => {
  const p = {};
  if (fromDate) p.fromDate = fromDate;
  if (toDate) p.toDate = toDate;
  return p;
};

export const dashboardApi = {
  todaySales: (date) =>
    axiosInstance.get('/v1/dashboard/today-sales', { params: date ? { date } : {} }),
  monthToDate: (date) =>
    axiosInstance.get('/v1/dashboard/month-to-date', { params: date ? { date } : {} }),
  profit: (fromDate, toDate) => axiosInstance.get('/v1/dashboard/profit', { params: params(fromDate, toDate) }),
  bestSellingProducts: (fromDate, toDate, limit = 10) =>
    axiosInstance.get('/v1/dashboard/best-selling-products', { params: { ...params(fromDate, toDate), limit } }),
  topCustomers: (fromDate, toDate, limit = 10) =>
    axiosInstance.get('/v1/dashboard/top-customers', { params: { ...params(fromDate, toDate), limit } }),
  salesTrend: (fromDate, toDate) => axiosInstance.get('/v1/dashboard/sales-trend', { params: params(fromDate, toDate) }),
  cashFlow: (fromDate, toDate) => axiosInstance.get('/v1/dashboard/cash-flow', { params: params(fromDate, toDate) }),
  stockAlerts: () => axiosInstance.get('/v1/dashboard/stock-alerts'),
  cashCreditRatio: (fromDate, toDate) =>
    axiosInstance.get('/v1/dashboard/cash-credit-ratio', { params: params(fromDate, toDate) }),
};
