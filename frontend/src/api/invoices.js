import axiosInstance from './axios';

export const invoicesApi = {
  list: (fromDate, toDate, customerId, page = 0, size = 20) =>
    axiosInstance.get('/v1/invoices', {
      params: { fromDate, toDate, customerId, page, size },
    }),
  getById: (id) => axiosInstance.get(`/v1/invoices/${id}`),
  getByNumber: (number) => axiosInstance.get(`/v1/invoices/number/${number}`),
  create: (body) => axiosInstance.post('/v1/invoices', body),
};
