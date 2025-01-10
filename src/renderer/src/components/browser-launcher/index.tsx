import React, { useEffect, useState } from 'react'
import { Modal, Button, Space, Typography, Divider, Switch, Tooltip, message, Tabs } from 'antd'
import { Browser, EventResultStatus } from '@shared/contract'
import { strings } from '@renderer/services/localization'
import './browser-launcher.less'
import chromeIcon from '@renderer/assets/browsers/chrome.svg'
import firefoxIcon from '@renderer/assets/browsers/firefox.svg'
import safariIcon from '@renderer/assets/browsers/safari.svg'
import edgeIcon from '@renderer/assets/browsers/edge.svg'
import braveIcon from '@renderer/assets/browsers/brave.svg'
import defaultIcon from '@renderer/assets/browsers/default.svg'
import { GlobalOutlined, SafetyCertificateOutlined, DesktopOutlined } from '@ant-design/icons'

const { Text, Title } = Typography

interface BrowserLauncherProps {
  open: boolean
  onClose: () => void
}

export default function BrowserLauncher({ open, onClose }: BrowserLauncherProps): JSX.Element {
  const [browsers, setBrowsers] = useState<Browser[]>([])
  const [loading, setLoading] = useState(false)
  const [systemProxyEnabled, setSystemProxyEnabled] = useState(false)

  useEffect(() => {
    if (open) {
      window.api.getAvailableBrowsers().then((browsers) => {
        setBrowsers(
          browsers.filter(
            (browser, index, self) =>
              browser.name.toLowerCase() !== 'ie' &&
              index === self.findIndex((b) => b.name === browser.name)
          )
        )
      })
    }
  }, [open])

  const launchBrowser = async (browser: Browser) => {
    setLoading(true)
    try {
      await window.api.launchBrowser(browser.type)
      onClose()
    } catch (error) {
      console.error('Failed to launch browser:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSystemProxyChange = (checked: boolean) => {
    window.api.updateSettings({ systemWideProxy: checked }).then((res) => {
      if (res.status === EventResultStatus.Success) {
        setSystemProxyEnabled(checked)
        message.success(checked ? strings.systemProxyEnabled : strings.systemProxyDisabled)
      } else {
        message.error(strings.systemProxyError)
      }
    })
  }

  const handleTrustCA = () => {
    window.api.ca('trust').then((res) => {
      if (res.status === EventResultStatus.Success) {
        message.success(strings.caInstalled)
      } else {
        message.error(res.error || strings.systemProxyError)
      }
    })
  }

  const handleExportCA = () => {
    window.api.ca('export').then((res) => {
      if (res.status === EventResultStatus.Success) {
        message.success(strings.copied)
      } else {
        message.error(res.error || strings.systemProxyError)
      }
    })
  }

  const getBrowserIcon = (browserType: string) => {
    switch (browserType.toLowerCase()) {
      case 'chrome':
        return <img src={chromeIcon} alt="Chrome" className="browser-icon" />
      case 'firefox':
        return <img src={firefoxIcon} alt="Firefox" className="browser-icon" />
      case 'safari':
        return <img src={safariIcon} alt="Safari" className="browser-icon" />
      case 'msedge':
        return <img src={edgeIcon} alt="Edge" className="browser-icon" />
      case 'edge':
        return <img src={edgeIcon} alt="Edge" className="browser-icon" />
      case 'brave':
        return <img src={braveIcon} alt="Brave" className="browser-icon" />
      default:
        return <img src={defaultIcon} alt="Browser" className="browser-icon" />
    }
  }

  const getBrowserName = (browserType: string) => {
    switch (browserType.toLowerCase()) {
      case 'chrome':
        return 'Google Chrome'
      case 'firefox':
        return 'Mozilla Firefox'
      case 'safari':
        return 'Apple Safari'
      case 'edge':
        return 'Microsoft Edge'
      case 'msedge':
        return 'Microsoft Edge'
      case 'brave':
        return 'Brave'
      default:
        return browserType
    }
  }

  const items = [
    {
      key: 'browser',
      label: (
        <span>
          <DesktopOutlined /> {strings.connectBrowser}
        </span>
      ),
      children: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text type="secondary">{strings.selectBrowserToLaunch}</Text>
          <div className="browser-list">
            {browsers.map((browser) => (
              <Button
                key={browser.path}
                size="small"
                icon={getBrowserIcon(browser.type)}
                onClick={() => launchBrowser(browser)}
                loading={loading}
                className="browser-button"
              >
                {getBrowserName(browser.type)}
              </Button>
            ))}
          </div>
        </Space>
      )
    },
    {
      key: 'system',
      label: (
        <span>
          <GlobalOutlined /> {strings.systemWideProxy}
        </span>
      ),
      children: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text type="secondary">{strings.systemWideProxyHint}</Text>
          <Switch
            checked={systemProxyEnabled}
            onChange={handleSystemProxyChange}
            checkedChildren={strings.enabled}
            unCheckedChildren={strings.disabled}
          />
        </Space>
      )
    }
  ]

  return (
    <Modal title={strings.connectProxy} open={open} onCancel={onClose} footer={null} width={500}>
      <Tabs items={items} defaultActiveKey="browser" />
    </Modal>
  )
}
