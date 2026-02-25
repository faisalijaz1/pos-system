import axiosInstance from './axios';

export const invoicesApi = {
  list: (fromDate, toDate, customerId, page = 0, size = 20) =>
    axiosInstance.get('/v1/invoices', {
      params: { fromDate, toDate, customerId, page, size },
    }),
  /** Fetch the most recent invoice for a customer (for "Sold Hist" / last order). Returns invoice or null.
   * Requires backend to return invoices sorted by date descending when using customerId filter (so first = latest).
   * If your backend returns oldest-first, add sort=date,desc or a dedicated GET /v1/customers/:id/last-invoice. */
  getLastByCustomer: (customerId) => {
    if (!customerId) return Promise.resolve(null);
    const to = new Date();
    const from = new Date(to.getFullYear() - 2, 0, 1);
    const fromStr = from.toISOString().slice(0, 10);
    const toStr = to.toISOString().slice(0, 10);
    return axiosInstance
      .get('/v1/invoices', { params: { fromDate: fromStr, toDate: toStr, customerId, page: 0, size: 1 } })
      .then((res) => (res.data && res.data.content && res.data.content.length ? res.data.content[0] : null))
      .catch(() => null);
  },
  getById: (id) => axiosInstance.get(`/v1/invoices/${id}`),
  getNextNumber: (date) =>
    axiosInstance.get('/v1/invoices/next-number', { params: date ? { date } : {} }).then((r) => r.data),
  getByNumber: (number) => axiosInstance.get(`/v1/invoices/number/${encodeURIComponent(number)}`),
  create: (body) => axiosInstance.post('/v1/invoices', body),
  update: (id, body) => axiosInstance.patch(`/v1/invoices/${id}`, body),
  addItem: (id, body) => axiosInstance.post(`/v1/invoices/${id}/items`, body),
  updateItem: (id, itemId, body) => axiosInstance.put(`/v1/invoices/${id}/items/${itemId}`, body),
  deleteItem: (id, itemId) => axiosInstance.delete(`/v1/invoices/${id}/items/${itemId}`),
  navigate: (date, currentId, direction) =>
    axiosInstance.get('/v1/invoices/navigate', {
      params: { date, currentId, direction },
    }),
};
