import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'


const safeStorageGet = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const savedTheme = safeStorageGet('devSync-theme');
if (savedTheme === 'light') {
  try {
    document.documentElement.setAttribute('data-theme', 'light');
  } catch {
    
  }
}

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
if (!googleClientId) {
  
  console.warn('[DevSync] Missing VITE_GOOGLE_CLIENT_ID; Google login will be disabled until you add it to a local .env file.');
}

if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      }).catch(() => {});
    }

    if ('caches' in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => caches.delete(key));
      }).catch(() => {});
    }
  });
}

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[DevSync] Unhandled render error:', error);
    console.error(info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    const message = this.state.error?.message || String(this.state.error);
    const stack = this.state.error?.stack;

    return (
      <div style={{
        minHeight: '100vh',
        padding: '24px',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
      }}>
        <h1 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>App crashed on startup</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '14px' }}>
          Fix the error below and refresh. (This screen shows only in development.)
        </p>
        <div style={{
          border: '1px solid var(--border-color)',
          background: 'var(--bg-card)',
          borderRadius: '12px',
          padding: '12px'
        }}>
          <div style={{ fontWeight: 600, marginBottom: '8px' }}>{message}</div>
          {stack ? (
            <pre style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              margin: 0,
              color: 'var(--text-secondary)'
            }}>{stack}</pre>
          ) : null}
        </div>
      </div>
    );
  }
}

const appTree = googleClientId ? (
  <GoogleOAuthProvider clientId={googleClientId}>
    <StrictMode>
      <App />
    </StrictMode>
  </GoogleOAuthProvider>
) : (
  <StrictMode>
    <App />
  </StrictMode>
);

if (import.meta.env.DEV) {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[DevSync] Unhandled promise rejection:', event.reason);
  });
  window.addEventListener('error', (event) => {
    console.error('[DevSync] Global error:', event.error || event.message);
  });
}

createRoot(document.getElementById('root')).render(
  import.meta.env.DEV ? (
    <RootErrorBoundary>{appTree}</RootErrorBoundary>
  ) : (
    appTree
  ),
);

