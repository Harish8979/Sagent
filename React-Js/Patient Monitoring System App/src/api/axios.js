import axios from 'axios';

const baseURL = (process.env.REACT_APP_API_URL || 'http://localhost:8080/api').replace(/\/$/, '');

const API = axios.create({
  baseURL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = String(error.config?.url || '');
    const isAuthRequest = /\/auth\/(login|register)$/i.test(requestUrl);

    if (status === 401 && !isAuthRequest) {
      localStorage.clear();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
