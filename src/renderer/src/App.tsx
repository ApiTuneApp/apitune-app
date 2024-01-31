import { useEffect, useState } from 'react'
import Button from '@mui/material/Button'
import SendIcon from '@mui/icons-material/Send'
import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'
import { MainEvent, RenderEvent } from '../../common/contract'

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
      <img alt="logo" className="logo" src={electronLogo} />
      <div className="proxy-log">
        {proxyLog.map((log, index) => {
          return <div key={index}>{log}</div>
        })}
      </div>
      <div className="actions">
        <div className="action">
          <Button variant="contained" endIcon={<SendIcon />} onClick={ipcHandle}>
            Send IPC
          </Button>
          <Button onClick={startServer}>Start server</Button>
        </div>
      </div>
      <Versions></Versions>
    </>
  )
}

export default App
