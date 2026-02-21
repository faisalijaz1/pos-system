import axiosInstance from './axios';

export const suppliersApi = {
  list: () => axiosInstance.get('/v1/suppliers'),
};
