import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { UiProvider } from './context/UiContext';
import './index.css';

// Register the offline service worker (production + preview only).
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* offline is a progressive enhancement; ignore registration failures */
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <UiProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </UiProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
);
