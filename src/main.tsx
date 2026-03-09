import React from 'react'
import ReactDOM from 'react-dom/client'
import AppContent from './App.tsx'
import { ReaderProvider } from './context/ReaderContext.tsx'
import { registerSW } from 'virtual:pwa-register'
import './index.css'

// Explicitly register the service worker for complete offline functionality
if ('serviceWorker' in navigator) {
  registerSW({ immediate: true });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ReaderProvider>
      <AppContent />
    </ReaderProvider>
  </React.StrictMode>,
)
