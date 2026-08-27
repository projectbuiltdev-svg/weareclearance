import { createRoot, hydrateRoot } from 'react-dom/client';
import type { ErrorInfo } from 'react';

import App from './App';
import { ErrorBoundary } from '@/components/error-boundary';

import './index.css';

const root = document.getElementById('root')!;
const app = (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
const rootOptions = {
  // Keeps caught errors off reportError(), which would raise the dev overlay.
  onCaughtError: (error: unknown, errorInfo: ErrorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
};

if (root.firstElementChild) {
  hydrateRoot(root, app, rootOptions);
} else {
  createRoot(root, rootOptions).render(app);
}
