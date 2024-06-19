export enum RenderEvent {
  ping = 'ping',
  startServer = 'startServer',
  AddRule = 'addRule',
  UpdateRule = 'updateRule',
  EnableRule = 'enableRule',
  UpdateRuleGroupName = 'updateRuleGroupName',
  GetApiRules = 'getApiRules',
  DeleteRule = 'deleteRule',
  GetSettings = 'getSettings',
  ChangePort = 'changePort',
  ChangeTheme = 'changeTheme',
  GetAppTheme = 'getAppTheme',
  GetIP = 'getIP',
  CA = 'CA'
}

export enum MainEvent {
  RendererLog = 'rendererLog',
  ProxyLog = 'proxyLog'
}

export enum EventResultStatus {
  Success = 'Success',
  Error = 'error'
}

export type CaEventType = 'status' | 'genRoot' | 'trust' | 'export'

export interface IpcResult {
  status: EventResultStatus
  data?: any
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
  requestBodyInfo?: string
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

export interface Modify {
  type: RuleType
  value: string | object | number
}

export interface RedirectModify extends Modify {
  type: RuleType.Redirect
  value: string
}

export interface HeaderModify extends Modify {
  type: RuleType.RequestHeader | RuleType.ResponseHeader
  value: HeaderItem[]
}

export interface SpeedLimitModify extends Modify {
  type: RuleType.SpeedLimit
  value: number
}

export interface BodyModify extends Modify {
  type: RuleType.RequestBody | RuleType.ResponseBody
  value: string
}

export interface FunctionMoidfy extends Modify {
  type: RuleType.RequestFunction | RuleType.ResponseFunction
  value: string
}

export interface ResponseStatusModify extends Modify {
  type: RuleType.ResponseStatus
  value: number
}

export interface DelayModify extends Modify {
  type: RuleType.ResponseDelay
  value: number
}

export interface RuleData {
  id: string
  name: string
  description: string
  matches: Match
  enable: boolean
  kind: 'rule'
  modifyList: Array<Modify | RedirectModify | HeaderModify | BodyModify | FunctionMoidfy>
  updateTime: number
  testScript?: string
}

export interface RuleGroup {
  id: string
  name: string
  enable: boolean
  kind: 'group'
  ruleList: RuleData[]
  updateTime: number
}

export type Theme = 'light' | 'dark' | 'system'
export type AppTheme = 'light' | 'dark' | null

export interface SettingStorage {
  version: string
  port: number
  theme: Theme
}

export type ApiRuleItem = RuleGroup | RuleData

export type ApiRules = Array<RuleGroup | RuleData>

export interface RuleStorage {
  version: string
  apiRules: ApiRules
}

export type RuleStorageParams = Partial<RuleStorage>

export type AddGroupOpts = {
  groupId?: string
  storageKey?: string
}

export type HeaderItem = {
  type: 'add' | 'override' | 'remove'
  name: string
  value: string
}

export type TestCaseItem = {
  title: string
  error?: string
  testFunc?: string
}

export type TestResultItem = {
  ruleId: string
  cases: Array<TestCaseItem>
  result: {
    passed: Array<TestCaseItem>
    failed: Array<TestCaseItem>
  }
}

export type TestItem = {
  logId: string
  tests: Array<TestResultItem>
  startTime: number
  endTime: number
}

export type LogTestResultMap = {
  [logId: string]: TestItem
}
