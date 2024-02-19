export enum RenderEvent {
  ping = 'ping',
  startServer = 'startServer'
}

export enum MainEvent {
  RendererLog = 'rendererLog',
  ProxyLog = 'proxyLog'
}

type Base64 = Buffer
export interface Log {
  // 唯一ID
  id: number
  // 命中的规则ID数组
  matchedRules: string[]
  // GET POST...
  method: string
  protocol: string
  pathname: string
  // 域名
  host: string
  // 整体url
  url: string
  // 请求header
  requestHeaders: any
  // post参数（超过5MB 值为null）
  requestBody?: Base64
  // post体长度(byte)
  requestBodyLength?: number
  // 返回状态码
  status?: number
  // 返回状态码文字
  message?: string
  // 结果header
  responseHeaders?: any
  // 结果体 （超过5MB 值为空）
  responseBody?: Base64
  // 结果体长度(byte)
  responseBodyLength?: number
  responeseType?: string
  // 收到请求时间
  startTime: number
  // 结束时间
  finishTime?: number
  // clientIp
  clientIp?: string
  // clientPort
  clientPort?: number
  // remoteIp
  remoteIp?: string
  // remotePort
  remotePort?: number
}
