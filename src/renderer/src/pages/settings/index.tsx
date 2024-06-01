import { FileProtectOutlined } from '@ant-design/icons'
import { useSettingStore } from '@renderer/store/setting'
import { Button, Typography, Form, InputNumber, Select, Space, App } from 'antd'
import { useEffect, useState } from 'react'

function SettingsPage(): JSX.Element {
  const { message } = App.useApp()

  const { port, theme, setTheme } = useSettingStore((state) => state)
  const [proxyPort, setProxyPort] = useState(port)

  useEffect(() => {
    setProxyPort(port)
  }, [port])

  const changePort = async () => {
    try {
      await window.api.changePort(proxyPort)
      message.success('Port updated')
    } catch (error) {
      message.error('Failed to update port: ' + error)
      setProxyPort(port)
    }
  }

  return (
    <div className="app-page page-settings">
      <Typography.Title level={4} style={{ marginBottom: 20 }}>
        Settings
      </Typography.Title>
      <Form layout="vertical">
        <Space direction="vertical" size="middle" style={{ width: '60%' }}>
          <Button icon={<FileProtectOutlined />} iconPosition="start">
            Trust ApiTune CA
          </Button>
          <Space>
            <Form.Item label="Proxy Port">
              <Space.Compact block>
                <InputNumber
                  min={1024}
                  max={49152}
                  controls={false}
                  value={proxyPort}
                  style={{ width: 170 }}
                  onChange={(value) => setProxyPort(Number(value))}
                ></InputNumber>
                <Button type="primary" disabled={proxyPort == port} onClick={changePort}>
                  Update
                </Button>
              </Space.Compact>
            </Form.Item>
          </Space>
          <Space>
            <Form.Item label="Themes">
              <Select
                value={theme}
                style={{ width: 250 }}
                options={[
                  { label: 'Light', value: 'light' },
                  { label: 'Dark', value: 'dark' },
                  { label: 'Sync with system', value: 'system' }
                ]}
                onChange={(value) => setTheme(value)}
              />
            </Form.Item>
          </Space>
        </Space>
      </Form>
    </div>
  )
}

export default SettingsPage
