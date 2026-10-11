import axios from 'axios';

// Base Axios instance pointing to our Express API
// Flexible: uses VITE_API_URL env variable if provided (for remote backend), otherwise falls back to '/api'
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Attach JWT token to every request if it exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
