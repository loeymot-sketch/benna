import axios from 'axios';
import { API_ORIGIN } from './config';

export const api = axios.create({ baseURL: `${API_ORIGIN}/api` });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('elbenna.token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    // Seule une session invalide/expirée déconnecte ; un mauvais code (bad_pin, bad_current_pin…) ne doit pas.
    if (err.response?.status === 401 && err.response?.data?.error === 'unauthorized') {
      localStorage.removeItem('elbenna.token');
      localStorage.removeItem('elbenna.user');
      if (!location.pathname.startsWith('/login') && !location.pathname.startsWith('/track')) {
        location.href = '/login';
      }
    }
    return Promise.reject(err);
  },
);
