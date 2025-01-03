import React, { useEffect, useState } from 'react'
import { Modal, Button, Space, Typography } from 'antd'
import { Browser } from '@shared/contract'
import { strings } from '@renderer/services/localization'
import './browser-launcher.less'
import chromeIcon from '@renderer/assets/browsers/chrome.svg'
import firefoxIcon from '@renderer/assets/browsers/firefox.svg'
import safariIcon from '@renderer/assets/browsers/safari.svg'
import edgeIcon from '@renderer/assets/browsers/edge.svg'
import braveIcon from '@renderer/assets/browsers/brave.svg'
import defaultIcon from '@renderer/assets/browsers/default.svg'

const { Text } = Typography

interface BrowserLauncherProps {
  open: boolean
  onClose: () => void
}

export default function BrowserLauncher({ open, onClose }: BrowserLauncherProps): JSX.Element {
  const [browsers, setBrowsers] = useState<Browser[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      window.api.getAvailableBrowsers().then((browsers) => {
        setBrowsers(
          browsers.filter(
            (browser, index, self) =>
              // Filter out IE and remove duplicates based on name
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

  return (
    <Modal title={strings.launchBrowser} open={open} onCancel={onClose} footer={null} width={400}>
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
    </Modal>
  )
}
