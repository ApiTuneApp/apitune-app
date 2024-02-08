import { useEffect, useState } from 'react'
import { Box } from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { Outlet } from 'react-router-dom'
import { MainEvent, RenderEvent } from '../../common/contract'
import Header from './components/header'
import Sidebar from './components/sidebar'

const darkTheme = createTheme({
  palette: {
    mode: 'dark'
  }
})

function App(): JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send(RenderEvent.ping)
  const startServer = (): void => window.electron.ipcRenderer.send(RenderEvent.startServer)
  const [proxyLog, setProxyLog] = useState<string[]>([])

  useEffect(() => {
    console.log('useEffect call')
    window.api.onProxyLog((message) => {
      setProxyLog((prev) => [...prev, message])
    })

    return () => {
      console.log('useEffect cleanup')
      window.api.clearupMainEvent(MainEvent.proxyLog)
    }
  }, [])

  return (
    <ThemeProvider theme={darkTheme}>
      <Header />
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <Box sx={{ flex: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App
