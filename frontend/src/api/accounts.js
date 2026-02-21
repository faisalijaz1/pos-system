import axiosInstance from './axios';

export const accountsApi = {
  list: () => axiosInstance.get('/v1/accounts'),
};
