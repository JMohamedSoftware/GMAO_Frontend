import axios from 'axios';

// Get the base URL from the environment, defaulting to localhost if not set
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach the JWT token
apiClient.interceptors.request.use(
  (config) => {
    // We assume the token is stored in localStorage
    const token = localStorage.getItem('gmao_access_token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors (like 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // You can implement token refresh logic here if needed
    if (error.response?.status === 401) {
      // e.g. logout user, clear storage, redirect to login
      console.warn("Unauthorized access. Token might be expired.");
      // Optional: Add logic to redirect to login
    }
    return Promise.reject(error);
  }
);
