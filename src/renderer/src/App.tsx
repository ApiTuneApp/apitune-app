import { App as AntApp, ConfigProvider, Layout, theme } from 'antd'
import KeepAlive from 'keepalive-for-react'
import { useEffect, useMemo } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'

import { useUxStore } from '@renderer/store/ux'
import { MainEvent } from '@shared/contract'

import Header from './components/header'
import Sidebar from './components/sidebar'
import { getApiRules } from './services/rule'

const { Header: LayoutHeader, Sider: LayoutSider, Content: LayoutContent } = Layout

function App(): JSX.Element {
  const outlet = useOutlet()
  const location = useLocation()
  const addProxyLogs = useUxStore((state) => state.addProxyLogs)

  useEffect(() => {
    const cancelFn = getApiRules()
    return cancelFn
  }, [])

  useEffect(() => {
    window.api.onProxyLog((log) => {
      addProxyLogs(log)
    })

    return () => {
      window.api.clearupEvent(MainEvent.ProxyLog)
    }
  }, [])

  /**
   * to distinguish different pages to cache
   */
  const cacheKey = useMemo(() => {
    return location.pathname + location.hash
  }, [location])

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        components: {
          Layout: {
            siderBg: '#141414',
            algorithm: true
          },
          Form: {
            itemMarginBottom: 10
          },
          Table: {
            rowSelectedBg: '#1668dc',
            rowSelectedHoverBg: '#1668dc'
          }
        }
      }}
    >
      <AntApp style={{ height: '100vh' }}>
        <Layout style={{ height: '100%' }}>
          <LayoutHeader
            style={{ padding: 0, height: 50, display: 'flex', alignItems: 'center', width: '100%' }}
          >
            <Header />
          </LayoutHeader>
          <Layout>
            <LayoutSider width="76">
              <Sidebar />
            </LayoutSider>
            <Layout>
              <LayoutContent>
                <KeepAlive activeName={cacheKey}>{outlet}</KeepAlive>
              </LayoutContent>
            </Layout>
          </Layout>
        </Layout>
      </AntApp>
    </ConfigProvider>
  )
}

export default App
