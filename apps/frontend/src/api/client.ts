import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';

// Base URL comes from Vite proxy (/api → localhost:3000)
const client = axios.create({ baseURL: '/api' });

// Attach JWT token from zustand store to every request
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401 — clear auth state so user gets redirected to login
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(err);
  },
);

export default client;
