import './log-detail.less'

import {
  App,
  Alert,
  Button,
  Collapse,
  CollapseProps,
  Descriptions,
  Form,
  Space,
  Tabs,
  TabsProps,
  Tooltip
} from 'antd'
import * as _ from 'lodash'
import { useEffect, useState } from 'react'

import { EditOutlined, SaveOutlined } from '@ant-design/icons'
import ReactJson from '@microlink/react-json-view'
import BodyEditor from '@renderer/components/add-rule-item/body-editor'
import HeaderEditor from '@renderer/components/add-rule-item/header-editor'
import ResponseStatus from '@renderer/components/add-rule-item/response-status'
import Rewrite from '@renderer/components/add-rule-item/rewrite'
import TestResults from '@renderer/components/test-results'
import * as Service from '@renderer/services'
import { strings } from '@renderer/services/localization'
import { useSettingStore } from '@renderer/store/setting'
import { EventResultStatus, HeaderItem, Log, Modify, RenderEvent, RuleType } from '@shared/contract'

import MonacoEditor, { supportLanguage } from '../monaco-editor'
import RuleLink from '../rule-link'

interface LogDetailProps {
  log: Log
  height?: number
  hideTestResult?: boolean
}
interface LogObjBlockProps {
  data: Record<string, string>
}

function LogObjBlock({ data }: LogObjBlockProps) {
  return (
    <Descriptions
      size="small"
      column={1}
      items={
        data
          ? Object.keys(data).map((key) => ({
              key,
              label: key,
              children: [data[key]]
            }))
          : []
      }
    />
  )
}

function parseURLEncoded(query) {
  if (!query) {
    return {}
  }

  const search = new URLSearchParams(query)
  const keys = search.keys()
  const ret = {}
  for (const k of keys) {
    const values = search.getAll(k)
    if (values.length === 0) {
      ret[k] = ''
    } else if (values.length === 1) {
      ret[k] = values[0]
    } else {
      ret[k] = values
    }
  }

  return ret
}

function getRequestParams(log: Log) {
  const { method, requestBody, requestBodyInfo, requestHeaders, search } = log
  if (method === 'GET') {
    const data = {}
    if (search) {
      const tmp = search.split('&')
      if (tmp && tmp.length) {
        tmp.forEach((i) => {
          const p = i.split('=')
          data[p[0]] = p[1]
        })
      }
    }
    return {
      isJson: true,
      data
    }
  }
  let isJson = false
  let result = requestBodyInfo
  try {
    result = JSON.parse(requestBodyInfo as string)
    isJson = typeof result === 'object'
  } catch (error) {
    isJson = false
    result = requestBodyInfo
  }
  return {
    isJson,
    data: result
  }
}

function isImg(type: string | undefined) {
  return type && type.startsWith('image/')
}

function getCodeInfo(type: string | undefined) {
  const result = {
    isCode: false,
    language: '' as supportLanguage
  }
  if (type) {
    if (type.includes('json')) {
      result.isCode = true
      result.language = 'json'
    } else if (type.includes('html')) {
      result.isCode = true
      result.language = 'html'
    } else if (type.includes('javascript')) {
      result.isCode = true
      result.language = 'javascript'
    } else if (type.includes('css')) {
      result.isCode = true
      result.language = 'css'
    } else {
      result.isCode = false
    }
  }
  return result
}

function previewComponent(log: Log, height: number | undefined) {
  const type = log.responseBodyInfo?.type
  const data = log.responseBodyInfo?.bodyText
  const appTheme = useSettingStore((state) => state.appTheme)
  if (isImg(type)) {
    return <img src={log.url} alt={strings.preview} />
  }
  if (log.responseBodyInfo?.isJson) {
    return (
      <ReactJson
        src={log.responseBodyInfo?.data}
        theme={appTheme === 'dark' ? 'bright' : 'bright:inverted'}
        displayDataTypes={false}
        displayObjectSize={false}
        name={false}
      />
    )
  }
  const codeInfo = getCodeInfo(type)
  if (codeInfo.isCode) {
    return <MonacoEditor defaultLanguage={codeInfo.language} height={height || 400} value={data} />
  }
  return <h4>{strings.cannotPreview}</h4>
}

function LogDetail({ log, height, hideTestResult }: LogDetailProps): JSX.Element {
  const requestParams = getRequestParams(log)
  const appTheme = useSettingStore((state) => state.appTheme)
  const { notification } = App.useApp()

  const isConnect = log.method === 'CONNECT'

  const [editLog, setEditLog] = useState(false)
  const [form] = Form.useForm()

  const modifyInitValue = [
    { type: RuleType.Rewrite, value: log.url },
    {
      type: RuleType.RequestHeader,
      value: Object.keys(log.requestHeaders).map((key) => ({
        type: 'override',
        name: key,
        value: log.requestHeaders[key]
      }))
    },
    {
      type: RuleType.RequestBody,
      value: JSON.stringify(requestParams.data)
    },
    {
      type: RuleType.ResponseStatus,
      value: log.status
    },
    {
      type: RuleType.ResponseHeader,
      value: log.responseHeaders
        ? Object.keys(log.responseHeaders).map((key) => ({
            type: 'override',
            name: key,
            value: log.responseHeaders[key]
          }))
        : []
    },
    {
      type: RuleType.ResponseBody,
      value: log.responseBodyInfo?.bodyText
    }
  ]

  useEffect(() => {
    if (editLog) {
      form.setFieldsValue({
        modifyList: modifyInitValue
      })
    }
  }, [editLog])

  const requestColItems: CollapseProps['items'] = [
    {
      key: 'general',
      label: strings.general,
      children: (
        <Descriptions
          size="small"
          column={1}
          items={[
            {
              key: 'Request URL',
              label: strings.requestUrl,
              children: [log.url]
            },
            {
              key: 'Request Method',
              label: strings.requestMethod,
              children: [log.method]
            },
            {
              key: 'Remote Address',
              label: strings.remoteAddress,
              children: [`${log.remoteIp}:${log.remotePort}`]
            }
          ]}
        />
      )
    },
    {
      key: 'requestHeader',
      label: strings.requestHeaders,
      children: <LogObjBlock data={log.requestHeaders} />
    },
    {
      key: 'requestParams',
      label: strings.requestParameters,
      children: requestParams.isJson ? (
        <ReactJson
          src={requestParams.data as Record<string, unknown>}
          theme={appTheme === 'dark' ? 'bright' : 'bright:inverted'}
          displayDataTypes={false}
          displayObjectSize={false}
          name={false}
        />
      ) : (
        <div className="raw-content">{requestParams.data as string}</div>
      )
    }
  ]

  const requestEditColItems: CollapseProps['items'] = [
    {
      key: 'general',
      label: strings.general,
      children: (
        <Descriptions
          size="small"
          column={1}
          items={[
            {
              children: (
                <div style={{ width: '60%' }}>
                  <Rewrite form={form} field={{ name: 0, key: 0 }} />
                </div>
              )
            },
            {
              key: 'Request Method',
              label: strings.requestMethod,
              children: [log.method]
            },
            {
              key: 'Remote Address',
              label: strings.remoteAddress,
              children: [`${log.remoteIp}:${log.remotePort}`]
            }
          ]}
        />
      )
    },
    {
      key: 'requestHeader',
      label: strings.requestHeaders,
      children: (
        <div style={{ width: '60%' }}>
          <HeaderEditor form={form} field={{ name: 1, key: 1 }} type="request" allowRemoveFrist />
        </div>
      )
    },
    {
      key: 'requestParams',
      label: strings.requestParameters,
      children: <BodyEditor form={form} field={{ name: 2, key: 2 }} type="request" />
    }
  ]

  const responseColItems: CollapseProps['items'] = [
    {
      key: 'general',
      label: strings.general,
      children: (
        <Descriptions
          column={1}
          items={[
            {
              key: 'Status Code',
              label: strings.statusCode,
              children: [log.status]
            }
          ]}
        />
      )
    },
    {
      key: 'responseHeader',
      label: strings.responseHeaders,
      children: <LogObjBlock data={log.responseHeaders} />
    },
    {
      key: 'responseBody',
      label: strings.responseBody,
      children: isConnect ? (
        <div style={{ padding: '16px' }}>
          <Alert
            type="info"
            message={strings.httpsDecodeRequired}
            description={strings.enableHttpsDecodeHint}
            showIcon
          />
        </div>
      ) : (
        <MonacoEditor
          defaultLanguage="plaintext"
          height={400}
          value={log.responseBodyInfo?.bodyText}
        />
      )
    }
  ]

  const responseEditColItems: CollapseProps['items'] = [
    {
      key: 'general',
      label: strings.general,
      children: (
        <Descriptions
          column={1}
          items={[
            {
              key: 'Status Code',
              children: (
                <div style={{ width: '60%' }}>
                  <ResponseStatus form={form} field={{ name: 3, key: 3 }} />
                </div>
              )
            }
          ]}
        />
      )
    },
    {
      key: 'responseHeader',
      label: strings.responseHeaders,
      children: (
        <div style={{ width: '60%' }}>
          <HeaderEditor form={form} field={{ name: 4, key: 4 }} type="response" allowRemoveFrist />
        </div>
      )
    },
    {
      key: 'responseBody',
      label: strings.responseBody,
      children: <BodyEditor form={form} field={{ name: 5, key: 5 }} type="response" />
    }
  ]

  let items: TabsProps['items'] = [
    {
      key: 'request',
      label: strings.request,
      children: (
        <Collapse
          size="small"
          items={editLog ? requestEditColItems : requestColItems}
          defaultActiveKey={requestColItems.map((item) => item.key as string)}
        />
      )
    },
    {
      key: 'response',
      label: strings.response,
      children: (
        <Collapse
          size="small"
          items={editLog ? responseEditColItems : responseColItems}
          defaultActiveKey={responseColItems.map((item) => item.key as string)}
        />
      )
    },
    {
      key: 'preview',
      label: strings.preview,
      children: previewComponent(log, height)
    },
    {
      key: 'testResults',
      label: strings.testResults,
      children: <TestResults logId={log.id} />
    }
  ]

  if (hideTestResult) {
    items = items.filter((item) => item.key !== 'testResults')
  }

  const handleSave = () => {
    if (isConnect) {
      return
    }
    form.validateFields().then((values) => {
      const realModifyList: Modify[] = []
      for (let i = 0; i < values.modifyList.length; i++) {
        const initValue = modifyInitValue[i]
        const modifyValue = values.modifyList[i]
        if (_.isEqual(initValue, modifyValue)) {
          continue
        } else if (
          modifyValue.type === RuleType.RequestHeader ||
          modifyValue.type === RuleType.ResponseHeader
        ) {
          const modifyHeaders = modifyValue.value as HeaderItem[]
          const initHeaders = initValue.value as HeaderItem[]
          if (modifyHeaders.length === 0) {
            continue
          } else {
            const realModifyHeader: HeaderItem[] = []
            for (let j = 0; j < modifyHeaders.length; j++) {
              const h = modifyHeaders[j]
              if (h.type !== 'override') {
                realModifyHeader.push(h)
              } else {
                // If the header is not in the init headers, then it is a real modify
                if (
                  !initHeaders.some((initH) => initH.name === h.name && initH.value === h.value)
                ) {
                  realModifyHeader.push(h)
                }
              }
            }
            if (realModifyHeader.length > 0) {
              realModifyList.push({
                type: modifyValue.type,
                value: realModifyHeader
              })
            }
          }
        } else {
          realModifyList.push(modifyValue)
        }
      }
      if (realModifyList.length > 0) {
        // create new rule
        window.api
          .addRule(
            JSON.stringify({
              kind: 'rule',
              name: `Modify-${log.url}`,
              description: '',
              enable: true,
              matches: {
                matchType: 'url',
                matchMode: 'equals',
                value: log.url,
                methods: [log.method]
              },
              modifyList: realModifyList
            })
          )
          .then((result) => {
            if (result.status === EventResultStatus.Success) {
              Service.getApiRules(RenderEvent.AddRule)
              notification.success({
                message: strings.ruleAdded,
                description: (
                  <>
                    {strings.goRule}
                    <RuleLink id={result.data.id} name={result.data.name} />
                  </>
                )
              })
            } else {
              notification.error({
                message: strings.saveFailed,
                description: result.error
              })
            }
          })
      }
      setEditLog(false)
    })
  }

  return (
    <Form form={form} size="small" onFinish={handleSave} layout="vertical">
      <Form.List name="modifyList">
        {(fields, { add, remove }) => (
          <Tabs
            defaultActiveKey="request"
            items={items}
            style={{ padding: '0 10px', height: '100%' }}
            tabBarExtraContent={{
              right: isConnect ? null : editLog ? (
                <Space style={{ marginRight: 30 }}>
                  <Button
                    size="small"
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={() => form.submit()}
                  >
                    {strings.save}
                  </Button>
                  <Button size="small" onClick={() => setEditLog(false)}>
                    {strings.cancel}
                  </Button>
                </Space>
              ) : (
                <Space style={{ marginRight: 30 }}>
                  {log.matchedRules.length > 0 && (
                    <div style={{ marginRight: 10 }}>
                      <span>{strings.matchedRules}:</span>
                      {log.matchedRules.map((rule) => (
                        <RuleLink key={rule} id={rule} />
                      ))}
                    </div>
                  )}
                  <Tooltip title={strings.logEditTooltip}>
                    <Button size="small" icon={<EditOutlined />} onClick={() => setEditLog(true)}>
                      {strings.edit}
                    </Button>
                  </Tooltip>
                </Space>
              )
            }}
          />
        )}
      </Form.List>
    </Form>
  )
}

export default LogDetail
