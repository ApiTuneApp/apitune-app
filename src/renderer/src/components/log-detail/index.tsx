import './log-detail.less'

import { Collapse, CollapseProps, Descriptions, Tabs, TabsProps } from 'antd'

import ReactJson from '@microlink/react-json-view'
import { Log } from '@shared/contract'
import { useSettingStore } from '@renderer/store/setting'

interface LogDetailProps {
  log: Log
}
interface LogObjBlockProps {
  data: Record<string, string>
}

function LogObjBlock({ data }: LogObjBlockProps) {
  return Object.keys(data).map((key) => (
    <div className="log-block-item" key={key}>
      <span className="block-label">{key}: </span>
      <span className="block-value">{data[key]}</span>
    </div>
  ))
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
  } else {
    if (requestHeaders['content-type'] === 'application/x-www-form-urlencoded') {
      try {
        return {
          isJson: true,
          data: parseURLEncoded(atob(requestBody!.toString()))
        }
      } catch (error) {
        console.error(error)
      }
    }
  }
  let isJson = true,
    result,
    data
  if (isJson && requestBody) {
    try {
      // data = atob(requestBody.toString())
      // data= requestBodyInfo;
      result = eval('(' + requestBodyInfo + ')')
    } catch (error) {
      isJson = false
      result = data
    }
  }
  return {
    isJson,
    data: result
  }
}

function isImg(type: string | undefined) {
  return type && type.startsWith('image/')
}

function LogDetail({ log }: LogDetailProps): JSX.Element {
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
          src={requestParams.data}
          theme={appTheme === 'dark' ? 'bright' : 'bright:inverted'}
          displayDataTypes={false}
          displayObjectSize={false}
          name={false}
        />
      ) : (
        <div className="raw-content">{requestParams.data}</div>
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
      children: <div className="raw-content">{log.responseBodyInfo?.bodyText}</div>
    }
  ]

  const items: TabsProps['items'] = [
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
      children: (
        <>
          {log.responseBodyInfo?.isJson && (
            <ReactJson
              src={log.responseBodyInfo?.data}
              theme={appTheme === 'dark' ? 'bright' : 'bright:inverted'}
              displayDataTypes={false}
              displayObjectSize={false}
              name={false}
            />
          )}
          {isImg(log.responseBodyInfo?.type) && <img src={log.url} alt="preview" />}
          {log.responseBodyInfo?.type === 'html' && (
            <iframe
              className="iframe-preview"
              sandbox=""
              frameBorder={0}
              srcDoc={log.responseBodyInfo?.data}
              title="preview"
            />
          )}
        </>
      )
    }
  ]

  return (
    <Tabs defaultActiveKey="request" items={items} style={{ padding: '0 10px', height: '100%' }} />
  )
}

export default LogDetail
