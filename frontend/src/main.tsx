import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './hooks/useAuth.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { initTheme } from './lib/theme.ts';
import './index.css';

// Khởi tạo theme đồng bộ toàn ứng dụng trước khi React mount
initTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);
