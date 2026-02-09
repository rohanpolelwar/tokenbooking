import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Middleware for staff requests
api.interceptors.request.use((config) => {
  if (config.url.startsWith('/staff') || config.url.startsWith('/doctor')) {
    config.headers['X-Role'] = 'staff';
  }
  return config;
});

export default api;
