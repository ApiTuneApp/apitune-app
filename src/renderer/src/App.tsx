import { Box, CssBaseline } from '@mui/material'
import darkScrollbar from '@mui/material/darkScrollbar'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './components/header'
import Sidebar from './components/sidebar'
import { getApiRules } from './services/rule'

const darkTheme = createTheme({
  palette: {
    mode: 'dark'
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (themeParam) => ({
        body: themeParam.palette.mode === 'dark' ? darkScrollbar() : null
      })
    }
  }
})

function App(): JSX.Element {
  // const ipcHandle = (): void => window.electron.ipcRenderer.send(RenderEvent.ping)
  // const startServer = (): void => window.electron.ipcRenderer.send(RenderEvent.startServer)

  useEffect(() => {
    const cancelFn = getApiRules()
    return cancelFn
  }, [])

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline enableColorScheme />
      <Header />
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />
        <Box sx={{ flex: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App
