import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './app/App.tsx'
import { AppProvider } from './app/provider.tsx'
import { Analytics } from '@vercel/analytics/react'

// ── Global axios interceptor: auto-attach JWT token to every request ──────────
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('gmao_access_token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <App />
      <Analytics />
    </AppProvider>
  </StrictMode>,
)
