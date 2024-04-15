export enum RenderEvent {
  ping = 'ping',
  startServer = 'startServer',
  AddRule = 'addRule'
}

export enum MainEvent {
  RendererLog = 'rendererLog',
  ProxyLog = 'proxyLog'
}

export enum EventResultStatus {
  Sucess = 'sucess',
  Error = 'error'
}

export interface AddRuleResult {
  status: EventResultStatus
  error?: string
}

type Base64 = Buffer

export interface BodyInfo {
  isTextBody: boolean
  bodyText: string
  type: string
  isJson: boolean
  data: any
}
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
  search?: string
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
  responseBodyInfo?: BodyInfo
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

export enum RuleType {
  Redirect = 'redirect',
  SpeedLimit = 'speedLimit',
  RequestHeader = 'requestHeader',
  RequestBody = 'requestBody',
  RequestBodyJq = 'requestBodyJq',
  RequestFunction = 'requestFunction',
  ResponseBody = 'responseBody',
  ResponseBodyJq = 'responseBodyJq',
  ResponseHeader = 'responseHeader',
  ResponseStatus = 'responseStatus',
  ResponseDelay = 'responseDelay',
  ResponseFile = 'responseFile',
  ResponseFunction = 'responseFunction',
  Break = 'break'
}

export interface Match {
  value: string
  matchType: 'url' | 'host' | 'path'
  matchMode: 'contains' | 'equals' | 'matches'
  methods: string[]
}

export interface RuleItem {
  type: RuleType
  value: string | object | number
}
export interface RuleData {
  name: string
  description: string
  matches: Match
  enable: boolean
  kind: 'rule'
  rules: RuleItem[]
}

export interface RuleGroup {
  name: string
  enable: boolean
  kind: 'group'
  rules: RuleData[]
}

export interface Settings {
  proxyPort?: '8998'
}

export interface StorageData {
  version: string
  settings: Settings
  apiRules: Array<RuleGroup | RuleData>
}

export type StorageDataParams = Partial<StorageData>
