import axiosInstance from './axios';

export const uomApi = {
  list: () => axiosInstance.get('/v1/uom'),
};
