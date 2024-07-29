import { App, Button, Form, InputNumber, Radio, Select, Space, Tag, Typography } from 'antd'
import { useEffect, useState } from 'react'

import { CloseCircleOutlined, DownloadOutlined, FileProtectOutlined } from '@ant-design/icons'
import { useSettingStore } from '@renderer/store/setting'
import { EventResultStatus, RenderEvent } from '@shared/contract'

const { Text } = Typography

function SettingsPage(): JSX.Element {
  const { message } = App.useApp()

  const { port, theme, language, setTheme, setAppTheme, setLanguage } = useSettingStore(
    (state) => state
  )
  const [proxyPort, setProxyPort] = useState(port)
  const [caTrust, setCaTrust] = useState(false)

  useEffect(() => {
    setProxyPort(port)
  }, [port])

  useEffect(() => {
    window.api.ca('status').then((res) => {
      if (res.status === EventResultStatus.Success) {
        setCaTrust(res.data.isCertificateInstalled)
      }
    })
    return () => {
      window.api.clearupEvent(RenderEvent.CA)
    }
  }, [])

  const changePort = async () => {
    try {
      await window.api.changePort(proxyPort)
      message.success('Port updated')
    } catch (error) {
      message.error('Failed to update port: ' + error)
      setProxyPort(port)
    }
  }

  const handleThemeChange = (value) => {
    setTheme(value)
    if (value === 'system') {
      window.api.getAppTheme().then((theme) => {
        setAppTheme(theme)
      })
    } else {
      setAppTheme(value)
    }
  }

  const trustCa = () => {
    window.api.ca('trust').then((res) => {
      if (res.status === EventResultStatus.Success) {
        setCaTrust(true)
        message.success('ApiTune CA Certificate trusted')
      } else {
        message.error('Failed to trust ApiTune CA Certificate: ' + res.error)
      }
    })
  }

  const exportCaFile = () => {
    window.api.ca('export').then((res) => {
      if (res.status === EventResultStatus.Success) {
        message.success('CA File exported')
      }
    })
  }

  const handleLanguageChange = (e) => {
    window.api.changeLanguage(e.target.value).then((res) => {
      if (res.status === EventResultStatus.Success) {
        setLanguage(e.target.value)
      }
    })
  }

  return (
    <div className="app-page page-settings">
      <Typography.Title level={4} style={{ marginBottom: 20 }}>
        Settings
      </Typography.Title>
      <Form layout="vertical">
        <Space direction="vertical" size="middle" style={{ width: '60%' }}>
          <Form.Item label="CA">
            <Space direction="vertical" size="small">
              {caTrust ? (
                <Tag color="success">ApiTune CA Certificate Installed</Tag>
              ) : (
                <Space direction="vertical">
                  <Text type="danger">
                    <CloseCircleOutlined /> ApiTune CA Certificate Not Trusted
                  </Text>
                  <Button
                    icon={<FileProtectOutlined />}
                    iconPosition="start"
                    onClick={() => trustCa()}
                  >
                    Trust ApiTune CA
                  </Button>
                  <Text type="secondary">(Require root privileges)</Text>
                </Space>
              )}
              <Button icon={<DownloadOutlined />} onClick={() => exportCaFile()}>
                Export CA File
              </Button>
            </Space>
          </Form.Item>

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
                onChange={(value) => handleThemeChange(value)}
              />
            </Form.Item>
          </Space>
          <Form.Item label="Language">
            <Radio.Group onChange={handleLanguageChange} value={language}>
              <Radio value={'en'}>English</Radio>
              <Radio value={'zh'}>中文</Radio>
            </Radio.Group>
          </Form.Item>
        </Space>
      </Form>
    </div>
  )
}

export default SettingsPage
