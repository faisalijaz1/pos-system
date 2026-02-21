import axiosInstance from './axios';

export const stockApi = {
  in: (body) => axiosInstance.post('/v1/stock/in', body),
  out: (body) => axiosInstance.post('/v1/stock/out', body),
  movements: (fromDate, toDate, productId, page = 0, size = 20) => {
    const params = { page, size };
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    if (productId != null) params.productId = productId;
    return axiosInstance.get('/v1/stock/movements', { params });
  },
};
