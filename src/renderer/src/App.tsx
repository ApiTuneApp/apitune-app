import { useEffect, useState } from 'react'
import { MainEvent, RenderEvent } from '../../common/contract'
import Header from './components/header/header'
import Sidebar from './components/sidebar/sidebar'
import { Box } from '@mui/material'

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
    <>
      <Header />
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <Box sx={{ flex: 1 }}></Box>
      </Box>
    </>
  )
}

export default App
