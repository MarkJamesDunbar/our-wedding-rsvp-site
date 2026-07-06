import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Safe-area simulator: `?safe=top,right,bottom,left` (e.g. ?safe=59,0,34,0)
// overrides the --safe-* env() vars so iPhone insets can be reproduced in any
// desktop browser. No-op when the param is absent.
const safeParam = new URLSearchParams(window.location.search).get('safe')
if (safeParam) {
  const [top = 0, right = 0, bottom = 0, left = 0] = safeParam.split(',').map(Number)
  const root = document.documentElement
  root.style.setProperty('--safe-top', `${top || 0}px`)
  root.style.setProperty('--safe-right', `${right || 0}px`)
  root.style.setProperty('--safe-bottom', `${bottom || 0}px`)
  root.style.setProperty('--safe-left', `${left || 0}px`)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
