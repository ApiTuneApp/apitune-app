import React, { useEffect, useState } from 'react'
import { Modal, Button, Space, Typography } from 'antd'
import { ChromeOutlined, GlobalOutlined } from '@ant-design/icons'
import { strings } from '@renderer/services/localization'
import { Browser } from '@shared/contract'
import './browser-launcher.less'

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
        setBrowsers(browsers)
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
        return <ChromeOutlined />
      default:
        return <GlobalOutlined />
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
              icon={getBrowserIcon(browser.type)}
              onClick={() => launchBrowser(browser)}
              loading={loading}
              className="browser-button"
            >
              {browser.name}
            </Button>
          ))}
        </div>
      </Space>
    </Modal>
  )
}
