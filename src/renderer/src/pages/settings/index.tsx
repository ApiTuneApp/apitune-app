import {
  App,
  Avatar,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
  Switch,
  Modal,
  Divider
} from 'antd'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'

import {
  CloseCircleOutlined,
  DownloadOutlined,
  FileProtectOutlined,
  InfoCircleOutlined,
  DownOutlined,
  UpOutlined
} from '@ant-design/icons'
import { getAvatarUrl } from '@shared/utils'
import { strings } from '@renderer/services/localization'
import { useSettingStore } from '@renderer/store/setting'
import { useUserStore } from '@renderer/store/user'
import { EventResultStatus, RenderEvent } from '@shared/contract'
import MonacoEditor from '@renderer/components/monaco-editor'

import packageJson from '../../../../../package.json'

const { Text } = Typography
const { TextArea } = Input

function SettingsPage(): JSX.Element {
  const { message } = App.useApp()

  const {
    port,
    theme,
    language,
    httpsDecryptDomains,
    setTheme,
    setAppTheme,
    setLanguage,
    setHttpsDecryptDomains,
    autoHandleCORS,
    setAutoHandleCORS,
    corsConfig,
    setCorsConfig
  } = useSettingStore((state) => state)
  const [proxyPort, setProxyPort] = useState(port)
  const [caTrust, setCaTrust] = useState(false)
  const [checkingUpdate, setCheckingUpdate] = useState(false)
  const [showCorsEditor, setShowCorsEditor] = useState(false)

  const { user, subscription, isPro } = useUserStore((state) => state)

  const hasProSubscription = useMemo(() => {
    return isPro()
  }, [subscription])

  const corsConfigDefaultValue = `// For more config, please check: https://apitune.io/docs/guide/settings.html#auto-handle-cors

options = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
}
`

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
        strings.setLanguage(e.target.value)
      }
    })
  }

  const checkForUpdate = () => {
    setCheckingUpdate(true)
    window.api.checkForUpdate().then((res) => {
      setCheckingUpdate(false)
      if (res.status === EventResultStatus.Success) {
        if (res.data.versionInfo?.version === packageJson.version) {
          message.info(strings.noNewVersion)
        }
      }
    })
  }

  const openSignInPage = () => {
    window.api.openSignInPage()
  }
  const openPricingPage = () => {
    window.api.openExternal('https://apitune.io/#Pricing')
  }

  const renderUserProfile = () => {
    if (!user || !user.email) {
      return (
        <Form.Item label={strings.profile}>
          <Card size="small">
            <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
              <Space direction="vertical" size="small">
                <Tooltip title={strings.signInTooltip}>
                  <Button type="default" onClick={openSignInPage}>
                    {strings.signIn}
                  </Button>
                </Tooltip>
                <Text type="secondary">{strings.signInTooltip}</Text>
              </Space>
              <Space direction="vertical" size="small" align="end">
                <Tag style={{ backgroundColor: 'var(--color-elevation-1)' }} color="default">
                  Free
                </Tag>
                <Button type="link" onClick={openPricingPage}>
                  {strings.upgradeToPro}
                </Button>
              </Space>
            </Space>
          </Card>
        </Form.Item>
      )
    }

    return (
      <Form.Item label={strings.profile}>
        <Card size="small">
          <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
            {/* Left column - User info */}
            <Space align="start">
              <Avatar size={48} src={getAvatarUrl(user)} style={{ backgroundColor: '#1677ff' }}>
                {user.name?.[0]?.toUpperCase()}
              </Avatar>
              <Space direction="vertical" size="small" style={{ marginLeft: 10 }}>
                <Text strong>{user.name}</Text>
                <Text type="secondary">{user.email}</Text>
              </Space>
            </Space>

            {/* Right column - Subscription info */}
            <Space direction="vertical" size="small" style={{ textAlign: 'right' }}>
              <Tag
                style={{ backgroundColor: 'var(--color-elevation-1)' }}
                color={
                  hasProSubscription ? (subscription?.is_lifetime ? 'purple' : 'gold') : 'default'
                }
              >
                {hasProSubscription ? (subscription?.is_lifetime ? 'Lifetime' : 'Pro') : 'Free'}
              </Tag>
              {hasProSubscription ? (
                subscription?.is_lifetime ? null : (
                  <Text type="secondary">
                    {strings.expires}: {dayjs(subscription?.end_at).format('YYYY-MM-DD')}
                  </Text>
                )
              ) : (
                <Button type="link" size="small" onClick={openPricingPage}>
                  {strings.upgradeToPro}
                </Button>
              )}
            </Space>
          </Space>
        </Card>
      </Form.Item>
    )
  }

  const handleHttpsDomainsChange = (value: string, e) => {
    const domains = value
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    // Otherwise, call the API to update domains
    window.api.updateHttpsDecryptDomains(domains).then((res) => {
      if (res.status === EventResultStatus.Success) {
        setHttpsDecryptDomains(domains)
      } else {
        message.error('Failed to update HTTPS decrypt domains')
      }
    })
  }

  const openHttpsDecryptDocs = () => {
    window.api.openExternal('https://apitune.io/docs/guide/settings.html#https-inspection')
  }

  const openCorsDocs = () => {
    window.api.openExternal('https://apitune.io/docs/guide/settings.html#cors-management')
  }

  const handleCORSChange = (checked: boolean) => {
    setAutoHandleCORS(checked)
    window.api.updateSettings({ autoHandleCORS: checked }).then((res) => {
      if (res.status === EventResultStatus.Success) {
        setAutoHandleCORS(checked)
      } else {
        message.error('Failed to update CORS settings')
      }
    })
  }

  const toggleCorsEditor = () => {
    setShowCorsEditor(!showCorsEditor)
  }

  const handleCorsConfigChange = (value: string | undefined) => {
    setCorsConfig(value || '')
    window.api.updateSettings({ corsConfig: value }).then((res) => {
      if (res.status === EventResultStatus.Success) {
        // Optionally show success message
      } else {
        message.error('Failed to update CORS configuration')
      }
    })
  }

  const openLogFile = () => {
    window.api.openLogFile()
  }

  return (
    <div className="app-page page-settings">
      <Typography.Title level={4} style={{ marginBottom: 20 }}>
        {strings.settings}
      </Typography.Title>
      <Form layout="vertical">
        <Space direction="vertical" size="middle" style={{ width: '60%' }}>
          {renderUserProfile()}
          <Form.Item label={strings.ca}>
            <Space direction="vertical" size="small">
              {caTrust ? (
                <Tag color="success">{strings.caInstalled}</Tag>
              ) : (
                <Space direction="vertical">
                  <Text type="danger">
                    <CloseCircleOutlined /> {strings.caNotTrust}
                  </Text>
                  <Button
                    icon={<FileProtectOutlined />}
                    iconPosition="start"
                    onClick={() => trustCa()}
                  >
                    {strings.trustCa}
                  </Button>
                  <Text type="secondary">({strings.requireRoot})</Text>
                </Space>
              )}
              <Button icon={<DownloadOutlined />} onClick={() => exportCaFile()}>
                {strings.exportCa}
              </Button>
            </Space>
          </Form.Item>

          <Space>
            <Form.Item label={strings.proxyPort}>
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
                  {strings.update}
                </Button>
              </Space.Compact>
            </Form.Item>
          </Space>

          <Space direction="vertical" style={{ width: '100%' }}>
            <Form.Item
              label={
                <Space>
                  {strings.autoHandleCORS}
                  <Tooltip title={strings.autoHandleCORSHint}>
                    <InfoCircleOutlined style={{ color: 'var(--color-text-quaternary)' }} />
                  </Tooltip>
                  <Button
                    type="link"
                    size="small"
                    style={{
                      padding: 0,
                      height: 'auto',
                      fontSize: '12px'
                    }}
                    onClick={openCorsDocs}
                  >
                    {strings.learnMore}
                  </Button>
                  <Tooltip title={strings.subcriptionFeature}>
                    <Tag color="gold">Pro</Tag>
                  </Tooltip>
                </Space>
              }
            >
              <Switch
                checked={autoHandleCORS}
                disabled={!hasProSubscription}
                onChange={handleCORSChange}
              />
              {autoHandleCORS && (
                <Button
                  type="link"
                  onClick={toggleCorsEditor}
                  style={{ padding: '0 4px' }}
                  iconPosition="end"
                  icon={showCorsEditor ? <UpOutlined /> : <DownOutlined />}
                >
                  {strings.advancedConfig}
                </Button>
              )}
              {autoHandleCORS && showCorsEditor && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ height: 200 }}>
                    <MonacoEditor
                      defaultLanguage="javascript"
                      defaultValue={corsConfigDefaultValue}
                      height={200}
                      value={corsConfig}
                      onChange={handleCorsConfigChange}
                      options={{
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 12
                      }}
                    />
                  </div>
                </div>
              )}
            </Form.Item>
            <Form.Item
              label={
                <Space>
                  {strings.httpsDecryptDomains}
                  <Tooltip title={strings.httpsDecryptDomainsHint}>
                    <InfoCircleOutlined style={{ color: 'var(--color-text-quaternary)' }} />
                  </Tooltip>
                  <Button
                    type="link"
                    size="small"
                    style={{
                      padding: 0,
                      height: 'auto',
                      fontSize: '12px'
                    }}
                    onClick={openHttpsDecryptDocs}
                  >
                    {strings.learnMore}
                  </Button>
                  <Tooltip title={strings.subcriptionFeature}>
                    <Tag color="gold">Pro</Tag>
                  </Tooltip>
                </Space>
              }
            >
              {hasProSubscription ? (
                <TextArea
                  defaultValue={httpsDecryptDomains?.join('\n')}
                  placeholder={`${strings.httpsDecryptDomainsHint}
Example:
*.example.com
api.example.com`}
                  onChange={(e) => handleHttpsDomainsChange(e.target.value, e)}
                  autoSize={{ minRows: 4, maxRows: 8 }}
                />
              ) : (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <TextArea
                    placeholder={strings.httpsDecryptDomainsHint}
                    disabled
                    autoSize={{ minRows: 4, maxRows: 8 }}
                  />
                  <Space>
                    <Text type="warning">{strings.subscriptionExpired}</Text>
                    <Button type="link" size="small" onClick={openPricingPage}>
                      {strings.renewSubscription}
                    </Button>
                  </Space>
                </Space>
              )}
            </Form.Item>
          </Space>
          <Space>
            <Form.Item label={strings.themes}>
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
          <Form.Item label={strings.language}>
            <Radio.Group onChange={handleLanguageChange} value={language}>
              <Radio value={'en'}>English</Radio>
              <Radio value={'zh'}>中文</Radio>
            </Radio.Group>
          </Form.Item>

          <Space>
            <Button onClick={checkForUpdate} loading={checkingUpdate}>
              {strings.checkUpdate}
            </Button>
            <Text>
              {strings.curVersion} {packageJson.version}
            </Text>
          </Space>
          <Button onClick={openLogFile}>{strings.openLogFile}</Button>
        </Space>
      </Form>
    </div>
  )
}

export default SettingsPage
