import './log-detail.less'

import { Collapse, CollapseProps, Descriptions, Tabs, TabsProps } from 'antd'

import ReactJson from '@microlink/react-json-view'
import TestResults from '@renderer/components/test-results'
import { useSettingStore } from '@renderer/store/setting'
import { Log } from '@shared/contract'

import MonacoEditor, { supportLanguage } from '../monaco-editor'

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
      items={Object.keys(data).map((key) => ({
        key,
        label: key,
        children: [data[key]]
      }))}
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
    return <img src={log.url} alt="preview" />
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
  return <h4>Can not preview this type, you can see the results in response body</h4>
}

function LogDetail({ log, height, hideTestResult }: LogDetailProps): JSX.Element {
  const requestParams = getRequestParams(log)
  const appTheme = useSettingStore((state) => state.appTheme)

  const requestColItems: CollapseProps['items'] = [
    {
      key: 'general',
      label: 'General',
      children: (
        <Descriptions
          size="small"
          column={1}
          items={[
            {
              key: 'Request URL',
              label: 'Request URL',
              children: [log.url]
            },
            {
              key: 'Request Method',
              label: 'Request Method',
              children: [log.method]
            },
            {
              key: 'Remote Address',
              label: 'Remote Address',
              children: [`${log.remoteIp}:${log.remotePort}`]
            }
          ]}
        />
      )
    },
    {
      key: 'requestHeader',
      label: 'Request Header',
      children: <LogObjBlock data={log.requestHeaders} />
    },
    {
      key: 'requestParams',
      label: 'Request Parameters',
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

  const responseColItems: CollapseProps['items'] = [
    {
      key: 'general',
      label: 'General',
      children: (
        <Descriptions
          column={1}
          items={[
            {
              key: 'Status Code',
              label: 'Status Code',
              children: [log.status]
            }
          ]}
        />
      )
    },
    {
      key: 'responseHeader',
      label: 'Response Header',
      children: <LogObjBlock data={log.responseHeaders} />
    },
    {
      key: 'responseBody',
      label: 'Response Body',
      children: (
        <MonacoEditor
          defaultLanguage="plaintext"
          height={400}
          value={log.responseBodyInfo?.bodyText}
        />
      )
    }
  ]

  let items: TabsProps['items'] = [
    {
      key: 'request',
      label: 'Request',
      children: (
        <Collapse
          size="small"
          items={requestColItems}
          defaultActiveKey={requestColItems.map((item) => item.key as string)}
        />
      )
    },
    {
      key: 'response',
      label: 'Response',
      children: (
        <Collapse
          size="small"
          items={responseColItems}
          defaultActiveKey={responseColItems.map((item) => item.key as string)}
        />
      )
    },
    {
      key: 'preview',
      label: 'Preview',
      children: previewComponent(log, height)
    },
    {
      key: 'testResults',
      label: 'Test Results',
      children: <TestResults logId={log.id} />
    }
  ]

  if (hideTestResult) {
    items = items.filter((item) => item.key !== 'testResults')
  }

  return (
    <Tabs defaultActiveKey="request" items={items} style={{ padding: '0 10px', height: '100%' }} />
  )
}

export default LogDetail
