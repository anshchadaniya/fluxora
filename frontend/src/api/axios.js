import axios from 'axios';

// Resolve flexible base URL:
// 1. If VITE_API_URL is configured (e.g. remote backend), use it (stripping trailing slash)
// 2. Otherwise default to '/api' (works seamlessly on localhost via Vite proxy and on Vercel via serverless rewrite)
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return '/api';
  return envUrl.replace(/\/+$/, '');
};

const API = axios.create({
  baseURL: getBaseURL(),
});

// Attach JWT token to every outgoing request if it exists
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: gracefully handle 401 session expirations
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || '';
      // Only clear token if this was not an explicit login attempt
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        localStorage.removeItem('token');
      }
    }
    return Promise.reject(error);
  }
);

export default API;
