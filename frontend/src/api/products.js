import axiosInstance from './axios';

export const productsApi = {
  list: (params = {}, page = 0, size = 20) =>
    axiosInstance.get('/v1/products', { params: { ...params, page, size } }),
  getById: (id) => axiosInstance.get(`/v1/products/${id}`),
  getBulk: (ids) => {
    const idList = Array.isArray(ids) && ids.length ? ids : [0];
    return axiosInstance.get('/v1/products/bulk', {
      params: { ids: idList },
      paramsSerializer: (params) => (params.ids || []).map((id) => `ids=${encodeURIComponent(id)}`).join('&'),
    });
  },
  getLastSale: (productId, customerId) =>
    axiosInstance.get(`/v1/products/${productId}/last-sale`, { params: customerId != null ? { customerId } : {} }),
};
