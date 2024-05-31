import { FileProtectOutlined } from '@ant-design/icons'
import { Button, Typography, Form, InputNumber, Select, Space, App } from 'antd'
import { useState } from 'react'

function SettingsPage(): JSX.Element {
  const { message } = App.useApp()
  const [proxyPort, setProxyPort] = useState(8998)

  // TODO: get port from settings
  // if (proxyPort !== 8998) setUpdatePortDisable(false)

  const changePort = async () => {
    try {
      await window.api.changePort(proxyPort)
      message.success('Port updated')
    } catch (error) {
      console.error(error)
      message.error('Failed to update port')
      setProxyPort(8998)
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
                <Button type="primary" disabled={proxyPort == 8998} onClick={changePort}>
                  Update
                </Button>
              </Space.Compact>
            </Form.Item>
          </Space>
          <Space>
            <Form.Item label="Themes">
              <Select
                defaultValue="dark"
                style={{ width: 250 }}
                options={[
                  { label: 'Light', value: 'light' },
                  { label: 'Dark', value: 'dark' },
                  { label: 'Sync with system', value: 'system' }
                ]}
              />
            </Form.Item>
          </Space>
        </Space>
      </Form>
    </div>
  )
}

export default SettingsPage
