import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 12000,
});

// Request interceptor: attach JWT bearer token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('foodbridge_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauth session expiry
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear token if server invalidates session
      const currentUrl = window.location.pathname;
      if (currentUrl !== '/login' && currentUrl !== '/register' && currentUrl !== '/') {
        localStorage.removeItem('foodbridge_token');
        localStorage.removeItem('foodbridge_user');
      }
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    if (error.message === 'Network Error') {
      return 'Unable to connect to the FoodBridge server. Please ensure the backend server is running.';
    }
    return error.message || 'An unexpected error occurred.';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred.';
}
