import axiosInstance from './axios';

export const authApi = {
  login: (username, password) =>
    axiosInstance.post('/v1/auth/login', { username, password }),

  me: () => axiosInstance.get('/v1/auth/me'),
};
