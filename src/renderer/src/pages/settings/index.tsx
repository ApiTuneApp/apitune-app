import { FileProtectOutlined } from '@ant-design/icons'
import { Button, Divider, Form, Input, Select, Space } from 'antd'
import { useState } from 'react'

function SettingsPage(): JSX.Element {
  const [proxyPort, setProxyPort] = useState(8998)
  return (
    <div className="app-page page-settings">
      <h2 style={{ marginBottom: 20 }}>Settings</h2>
      <Form layout="vertical">
        <Space direction="vertical" size="middle" style={{ width: '60%' }}>
          <Button icon={<FileProtectOutlined />} iconPosition="start">
            Trust ApiTune CA
          </Button>
          <Space>
            {/* <span>Chagne Proxy Port: </span> */}
            <Form.Item label="Proxy Port">
              <Space.Compact block>
                <Input
                  size="small"
                  type="number"
                  value={proxyPort}
                  onChange={(e) => setProxyPort(Number(e.target.value))}
                ></Input>
                <Button type="primary">Update</Button>
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
