// ✅ main.tsx — Fix 7: App envuelta en ErrorBoundary global
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/shared/ErrorBoundary.tsx'
import { SettingsProvider } from './contexts/SettingsContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <SettingsProvider>
          <App />
          <Analytics />
          <SpeedInsights />
        </SettingsProvider>
      </ErrorBoundary>
    </HelmetProvider>
  </StrictMode>,
)
