import axiosInstance from './axios';

export const productsApi = {
  list: (params = {}, page = 0, size = 20) =>
    axiosInstance.get('/v1/products', { params: { ...params, page, size } }),
  getById: (id) => axiosInstance.get(`/v1/products/${id}`),
  getLastSale: (productId, customerId) =>
    axiosInstance.get(`/v1/products/${productId}/last-sale`, { params: customerId != null ? { customerId } : {} }),
};
