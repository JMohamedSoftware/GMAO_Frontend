import axios from 'axios';

// Get the base URL from the environment, defaulting to localhost if not set
const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = rawApiUrl.replace(/\/api\/?$/, '');

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

// To prevent infinite refresh loops
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor to handle errors (like 401 Unauthorized or 403 Forbidden)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('gmao_refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Import dynamically to avoid circular dependencies
        const { refreshTokenApi } = await import('@/features/auth/api/auth.api');
        const { store } = await import('@/app/store');
        const { login, logout } = await import('@/app/gmaoSlice');

        const data = await refreshTokenApi({ refreshToken });

        localStorage.setItem('gmao_access_token', data.accessToken);
        localStorage.setItem('gmao_refresh_token', data.refreshToken);

        // Update Redux state with new user object containing fresh permissions
        store.dispatch(login({
          user: data.user as any,
          tenantId: data.user.tenantId || null
        }));

        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        
        const { store } = await import('@/app/store');
        const { logout } = await import('@/app/gmaoSlice');
        
        // Only force logout on 401 (expired/invalid refresh token), not necessarily 403 (genuinely forbidden)
        if (error.response?.status === 401) {
          store.dispatch(logout());
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);
