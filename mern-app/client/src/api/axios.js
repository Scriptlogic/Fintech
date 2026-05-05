import axios from 'axios';

const API = axios.create({
  baseURL:         '/api',
  timeout:         10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ─── Request interceptor — log in dev ───────────────────────────────────── */
API.interceptors.request.use(
  (config) => config,
  (error)  => Promise.reject(error)
);

/* ─── Response interceptor — normalise errors ───────────────────────────── */
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0] ||
      error.message ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default API;
