// ✅ main.tsx — Fix 7: App envuelta en ErrorBoundary global
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { Analytics } from '@vercel/analytics/react'
import { injectSpeedInsights } from '@vercel/speed-insights'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/shared/ErrorBoundary.tsx'

// Initialize Vercel Speed Insights
injectSpeedInsights()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <App />
        <Analytics />
      </ErrorBoundary>
    </HelmetProvider>
  </StrictMode>,
)
