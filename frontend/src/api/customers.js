import axiosInstance from './axios';

export const customersApi = {
  list: (name, page = 0, size = 20) =>
    axiosInstance.get('/v1/customers', { params: { name, page, size } }),
  getById: (id) => axiosInstance.get(`/v1/customers/${id}`),
  getBalance: (id) => axiosInstance.get(`/v1/customers/${id}/balance`),
};
