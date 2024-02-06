import './assets/main.less'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  // In strict mode, the effect will call twice
  // https://stackoverflow.com/questions/72238175/why-useeffect-running-twice-and-how-to-handle-it-well-in-react
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
