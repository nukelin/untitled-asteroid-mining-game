// ─── Entry Point ──────────────────────────────────────────────────────────────
// This is the application's bootstrap file.
// It mounts the React component tree onto the real DOM.

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'    // global styles for the entire app
import App from './App.jsx'

// Find the <div id="root"> element in index.html and hand React control of it.
// StrictMode wraps the app to surface potential issues during development
// (e.g. double-invoking effects to detect side-effect bugs); it has no effect in production.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
