import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'
// Saved component tweaks (styles/component-tuning.json) — applied in every
// build; the Alt + right-click editor is dev-only.
import './dev/componentTuning.js'
import ComponentTuner from './dev/ComponentTuner.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    {import.meta.env.DEV && <ComponentTuner />}
  </React.StrictMode>
)
