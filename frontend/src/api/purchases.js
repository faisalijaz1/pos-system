import axiosInstance from './axios';

export const purchasesApi = {
  list: (fromDate, toDate, supplierId, page = 0, size = 20) => {
    const params = { page, size };
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    if (supplierId != null) params.supplierId = supplierId;
    return axiosInstance.get('/v1/purchases', { params });
  },
  getById: (id) => axiosInstance.get(`/v1/purchases/${id}`),
  create: (body) => axiosInstance.post('/v1/purchases', body),
  receive: (id) => axiosInstance.post(`/v1/purchases/${id}/receive`),
};
