import React from 'react'

export enum RenderEvent {
  ping = 'ping',
  startServer = 'startServer',
  AddRule = 'addRule',
  UpdateRule = 'updateRule',
  EditRuleGroup = 'editRuleGroup',
  EnableRule = 'enableRule',
  UpdateRuleGroupName = 'updateRuleGroupName',
  GetApiRules = 'getApiRules',
  GetRuleStorage = 'getRuleStorage',
  DeleteRule = 'deleteRule',
  GetSettings = 'getSettings',
  ChangePort = 'changePort',
  ChangeTheme = 'changeTheme',
  GetAppTheme = 'getAppTheme',
  GetIP = 'getIP',
  CA = 'CA',
  GetTestResults = 'getTestResults',
  GetAllTestResults = 'getAllTestResults',
  GetProxyLogs = 'getProxyLogs',
  ClearTestResult = 'clearTestResult',
  GetLanguage = 'getLanguage',
  ChangeLanguage = 'changeLanguage',
  OpenSignInPage = 'openSignInPage',
  SetAuth = 'setAuth',
  SetSyncInfo = 'setSyncInfo',
  CleanRuleData = 'cleanRuleData',
  InitServerRules = 'initServerRules',
  GetPrintLogs = 'getPrintLogs',
  ClearPrintLogs = 'clearPrintLogs',
  CheckForUpdate = 'checkForUpdate',
  CopyText = 'copyText',
  DuplicateRules = 'duplicateRules',
  OpenExternal = 'openExternal'
}

export enum MainEvent {
  RendererLog = 'rendererLog',
  ProxyLog = 'proxyLog',
  PrintLog = 'printLog',
  GetAuthCode = 'getAuthCode',
  OpenShare = 'openShare'
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
  Rewrite = 'rewrite',
  RequestSpeedLimit = 'requestSpeedLimit',
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
  type: RuleType.Rewrite
  value: string
}

export interface HeaderModify extends Modify {
  type: RuleType.RequestHeader | RuleType.ResponseHeader
  value: HeaderItem[]
}

export interface SpeedLimitModify extends Modify {
  type: RuleType.RequestSpeedLimit
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
  modifyList: Array<Modify>
  updateTime: number
  testScript?: string
  shareFrom?: string
}

export interface RuleGroup {
  id: string
  name: string
  enable: boolean
  kind: 'group'
  ruleList: RuleData[]
  updateTime: number
  shareFrom?: string
}

export type Theme = 'light' | 'dark' | 'system'
export type AppTheme = 'light' | 'dark' | null

export interface SettingStorage {
  version: string
  port: number
  theme: Theme
  language: 'zh' | 'en'
}

export type ApiRuleItem = RuleGroup | RuleData

export type ApiRules = Array<RuleGroup | RuleData>

export type SyncInfo = {
  userId: string
  syncDate: string
  syncStatus: 'synced' | 'syncing' | 'error'
}

export interface RuleStorage {
  version: string
  apiRules: ApiRules
  syncInfo?: SyncInfo
  updatedAt: number
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

export type User = {
  id: string
  email: string
  name: string
  avatar: string
}

export type PrintScript = {
  printStr: string
  options: {
    title: string
    styles: React.CSSProperties
  }
}

export type PrintItem = {
  logId: string
  ruleId: string
  printList: Array<PrintScript>
}

export interface ShareUser {
  id: string
  avatar_url: string
  full_name: string
}

export interface ShareRule {
  id: string
  created_at: string
  private_emails: string[]
  rule_data: RuleGroup | RuleData
  users: ShareUser
}

export interface Subscription {
  email: string
  end_at: string
  customer_id: string
  subscription_id: string
  id: string
}
