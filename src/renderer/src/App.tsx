import darkScrollbar from '@mui/material/darkScrollbar'
import { createTheme } from '@mui/material/styles'
import KeepAlive from 'keepalive-for-react'
import { useEffect, useMemo } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'
import Header from './components/header'
import Sidebar from './components/sidebar'
import { getApiRules } from './services/rule'

import { ConfigProvider, theme } from 'antd'
import { Layout } from 'antd'

const { Header: LayoutHeader, Footer, Sider: LayoutSider, Content } = Layout

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
    <ConfigProvider
      theme={{
        // 1. 单独使用暗色算法
        algorithm: theme.darkAlgorithm,
        components: {
          Layout: {
            siderBg: '#141414',
            algorithm: true
          }
        }
      }}
    >
      <Layout>
        <LayoutHeader
          style={{ padding: 0, height: 50, display: 'flex', alignItems: 'center', width: '100%' }}
        >
          <Header />
        </LayoutHeader>
        <Layout>
          <LayoutSider width="95">
            <Sidebar />
          </LayoutSider>
          <Layout>
            <Content>
              <KeepAlive activeName={cacheKey}>{outlet}</KeepAlive>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </ConfigProvider>
  )
}

export default App
