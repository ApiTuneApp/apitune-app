import { App as AntApp, ConfigProvider, Layout, theme as antdTheme } from 'antd'
import KeepAlive from 'keepalive-for-react'
import { useEffect, useMemo } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'

import { useUxStore } from '@renderer/store/ux'
import { MainEvent } from '@shared/contract'

import Header from './components/header'
import Sidebar from './components/sidebar'
import { getApiRules, getSettings } from './services'
import { useSettingStore } from './store/setting'

const { Header: LayoutHeader, Sider: LayoutSider, Content: LayoutContent } = Layout

function App(): JSX.Element {
  const outlet = useOutlet()
  const location = useLocation()
  const addProxyLogs = useUxStore((state) => state.addProxyLogs)
  const appTheme = useSettingStore((state) => state.appTheme)

  useEffect(() => {
    const cancelRules = getApiRules()
    const cancelSettings = getSettings()
    return () => {
      cancelRules()
      cancelSettings()
    }
  }, [])

  useEffect(() => {
    window.api.onProxyLog((log) => {
      addProxyLogs(log)
    })

    return () => {
      window.api.clearupEvent(MainEvent.ProxyLog)
    }
  }, [])

  function autoHideTooltip() {
    const tooltipList = document.querySelectorAll('.j-autohide-tooltip')
    if (tooltipList && tooltipList.length) {
      tooltipList.forEach((tooltip) => {
        if (!tooltip.classList.contains('ant-tooltip-hidden')) {
          tooltip.classList.add('ant-tooltip-hidden')
        }
      })
    }
  }

  /**
   * to distinguish different pages to cache
   */
  const cacheKey = useMemo(() => {
    autoHideTooltip()
    return location.pathname + location.hash
  }, [location])

  return (
    <ConfigProvider
      theme={{
        algorithm:
          appTheme === 'dark'
            ? [antdTheme.darkAlgorithm, antdTheme.compactAlgorithm]
            : [antdTheme.defaultAlgorithm, antdTheme.compactAlgorithm],
        token: {
          colorPrimary: '#FF5733',
          colorBgContainer: 'var(--color-background-soft)'
        },
        components: {
          Layout: {
            algorithm: true,
            siderBg: 'var(--color-background-soft)',
            headerBg: 'var(--color-background-soft)',
            headerHeight: 40
          },
          Form: {
            itemMarginBottom: 10
          },
          Table: {
            algorithm: true,
            headerBorderRadius: 0,
            rowSelectedBg: appTheme === 'dark' ? '#1668dc' : '#bae0ff',
            rowSelectedHoverBg: appTheme === 'dark' ? '#1668dc' : '#bae0ff'
          },
          Tree: {
            // colorBgContainer: 'var(--color-background-mute)'
          }
        }
      }}
    >
      <AntApp style={{ height: '100vh' }}>
        <Layout style={{ height: '100%' }}>
          <LayoutHeader
            style={{ padding: 0, display: 'flex', alignItems: 'center', width: '100%' }}
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
