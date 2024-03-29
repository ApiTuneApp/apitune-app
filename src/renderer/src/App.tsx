import { Box, CssBaseline } from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import darkScrollbar from '@mui/material/darkScrollbar'
import { Outlet } from 'react-router-dom'
import { RenderEvent } from '../../shared/contract'
import Header from './components/header'
import Sidebar from './components/sidebar'

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
  const ipcHandle = (): void => window.electron.ipcRenderer.send(RenderEvent.ping)
  const startServer = (): void => window.electron.ipcRenderer.send(RenderEvent.startServer)

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
