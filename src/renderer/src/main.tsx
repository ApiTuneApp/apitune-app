import './assets/main.less'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import NetworkPage from './pages/network'
import RulesPage from './pages/rules'
import SettingsPage from './pages/settings'

import { Navigate, RouterProvider, createHashRouter } from 'react-router-dom'

const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <Navigate to="/network" />
      },
      {
        path: 'network',
        element: <NetworkPage />
      },
      {
        path: 'rules',
        element: <RulesPage />
      },
      {
        path: 'settings',
        element: <SettingsPage />
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  // In strict mode, the effect will call twice
  // https://stackoverflow.com/questions/72238175/why-useeffect-running-twice-and-how-to-handle-it-well-in-react
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
