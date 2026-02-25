import axiosInstance from './axios';

export const accountsApi = {
  list: () => axiosInstance.get('/v1/accounts'),
  search: (q) => axiosInstance.get('/v1/accounts/search', { params: q != null ? { q } : {} }),
  getById: (id) => axiosInstance.get(`/v1/accounts/${id}`),
};
