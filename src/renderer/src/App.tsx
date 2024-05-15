import { Box, CssBaseline } from '@mui/material'
import darkScrollbar from '@mui/material/darkScrollbar'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import KeepAlive from 'keepalive-for-react'
import { useEffect, useMemo } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'
import Header from './components/header'
import Sidebar from './components/sidebar'
import { getApiRules } from './services/rule'

import { ConfigProvider, theme } from 'antd'

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
  const outlet = useOutlet()
  const location = useLocation()

  useEffect(() => {
    const cancelFn = getApiRules()
    return cancelFn
  }, [])

  /**
   * to distinguish different pages to cache
   */
  const cacheKey = useMemo(() => {
    return location.pathname + location.hash
  }, [location])

  return (
    <ThemeProvider theme={darkTheme}>
      <ConfigProvider
        theme={{
          // 1. 单独使用暗色算法
          algorithm: theme.darkAlgorithm

          // 2. 组合使用暗色算法与紧凑算法
          // algorithm: [theme.darkAlgorithm, theme.compactAlgorithm]
        }}
      >
        <CssBaseline enableColorScheme />
        <Header />
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <Sidebar />
          <Box sx={{ flex: 1 }}>
            <KeepAlive activeName={cacheKey}>{outlet}</KeepAlive>
          </Box>
        </Box>
      </ConfigProvider>
    </ThemeProvider>
  )
}

export default App
