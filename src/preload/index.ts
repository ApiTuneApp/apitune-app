import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import {
  MainEvent,
  RenderEvent,
  IpcResult,
  ApiRules,
  AddGroupOpts,
  Theme,
  TestItem,
  LogTestResultMap,
  Log,
  SettingStorage,
  RuleStorage,
  SyncInfo,
  PrintItem,
  Subscription,
  UpdateSettingsParams
} from '../shared/contract'

// Custom APIs for renderer
const api = {
  onProxyLog: (callback): void => {
    ipcRenderer.on(MainEvent.ProxyLog, (_, log) => callback(log))
  },
  onAuthCode: (callback): void => {
    ipcRenderer.on(MainEvent.GetAuthCode, (_, accessToken, refreshToken) =>
      callback(accessToken, refreshToken)
    )
  },
  onOpenShare: (callback): void => {
    ipcRenderer.on(MainEvent.OpenShare, (_, shareId) => callback(shareId))
  },
  onPrintLog: (callback): void => {
    ipcRenderer.on(MainEvent.PrintLog, (_, printItem) => callback(printItem))
  },
  onTestResult: (callback): void => {
    ipcRenderer.on(MainEvent.TestResult, (_, testResult) => callback(testResult))
  },
  onUpdateProgress: (callback): void => {
    ipcRenderer.on(MainEvent.UpdateProgress, (_, progress) => callback(progress))
  },
  getPrintLogs: (): Promise<PrintItem[]> => {
    return ipcRenderer.invoke(RenderEvent.GetPrintLogs)
  },
  clearPrintLogs: (): void => {
    ipcRenderer.send(RenderEvent.ClearPrintLogs)
  },
  setAuth: (accessToken: string, refreshToken: string): void => {
    ipcRenderer.send(RenderEvent.SetAuth, accessToken, refreshToken)
  },
  getProxyLogs: (): Promise<Log[]> => {
    return ipcRenderer.invoke(RenderEvent.GetProxyLogs)
  },
  clearupEvent: (event: MainEvent | RenderEvent): void => {
    ipcRenderer.removeAllListeners(event)
  },
  addRule: (rules: string, opts?: AddGroupOpts): Promise<IpcResult> => {
    return ipcRenderer.invoke(RenderEvent.AddRule, rules, opts)
  },
  updateRule: (id: string, rules: string): Promise<IpcResult> => {
    return ipcRenderer.invoke(RenderEvent.UpdateRule, id, rules)
  },
  editRuleGroup: (ruleId: string, groupId?: string): Promise<IpcResult> => {
    return ipcRenderer.invoke(RenderEvent.EditRuleGroup, ruleId, groupId)
  },
  enableRule: (id: string, enable: boolean): Promise<IpcResult> => {
    return ipcRenderer.invoke(RenderEvent.EnableRule, id, enable)
  },
  getApiRules: (): Promise<ApiRules> => {
    return ipcRenderer.invoke(RenderEvent.GetApiRules)
  },
  getRuleStorage: (): Promise<RuleStorage> => {
    return ipcRenderer.invoke(RenderEvent.GetRuleStorage)
  },
  setSyncInfo: (syncInfo: SyncInfo): void => {
    ipcRenderer.send(RenderEvent.SetSyncInfo, syncInfo)
  },
  updateRuleGroupName: (id: string, ruleName: string): Promise<IpcResult> => {
    return ipcRenderer.invoke(RenderEvent.UpdateRuleGroupName, id, ruleName)
  },
  deleteRule: (id: string): Promise<IpcResult> => {
    return ipcRenderer.invoke(RenderEvent.DeleteRule, id)
  },
  changePort: (port: number): Promise<IpcResult> => {
    return ipcRenderer.invoke(RenderEvent.ChangePort, port)
  },
  getSettings: (): Promise<any> => {
    return ipcRenderer.invoke(RenderEvent.GetSettings)
  },
  getAppTheme: (): Promise<Theme> => {
    return ipcRenderer.invoke(RenderEvent.GetAppTheme)
  },
  changeTheme: (theme: Theme): Promise<IpcResult> => {
    return ipcRenderer.invoke(RenderEvent.ChangeTheme, theme)
  },
  getLanguage: (): Promise<string> => {
    return ipcRenderer.invoke(RenderEvent.GetLanguage)
  },
  changeLanguage: (language: SettingStorage['language']): Promise<IpcResult> => {
    return ipcRenderer.invoke(RenderEvent.ChangeLanguage, language)
  },
  getIp: (): Promise<string> => {
    return ipcRenderer.invoke(RenderEvent.GetIP)
  },
  ca: (type): Promise<IpcResult> => {
    return ipcRenderer.invoke(RenderEvent.CA, type)
  },
  getTestResults: (logId: number): Promise<TestItem> => {
    return ipcRenderer.invoke(RenderEvent.GetTestResults, logId)
  },
  getAllTestResults: (): Promise<LogTestResultMap> => {
    return ipcRenderer.invoke(RenderEvent.GetAllTestResults)
  },
  clearTestResult: (): Promise<IpcResult> => {
    return ipcRenderer.invoke(RenderEvent.ClearTestResult)
  },
  openSignInPage: (): void => {
    ipcRenderer.send(RenderEvent.OpenSignInPage)
  },
  cleanRuleData: (): Promise<IpcResult> => {
    return ipcRenderer.invoke(RenderEvent.CleanRuleData)
  },
  initServerRules: (rules: ApiRules, syncInfo: SyncInfo): Promise<IpcResult> => {
    return ipcRenderer.invoke(RenderEvent.InitServerRules, rules, syncInfo)
  },
  saveRules: (rules: ApiRules): Promise<IpcResult> => {
    return ipcRenderer.invoke(RenderEvent.SaveRules, rules)
  },
  checkForUpdate: (): Promise<IpcResult> => {
    return ipcRenderer.invoke(RenderEvent.CheckForUpdate)
  },
  copyText: (text: string): void => {
    ipcRenderer.send(RenderEvent.CopyText, text)
  },
  duplicateRules: (rule: string): Promise<IpcResult> => {
    return ipcRenderer.invoke(RenderEvent.DuplicateRules, rule)
  },
  openExternal: (url: string): void => {
    ipcRenderer.send(RenderEvent.OpenExternal, url)
  },
  setSubscription: (subscription: Subscription | null): void => {
    ipcRenderer.send(RenderEvent.SetSubscription, subscription)
  },
  updateHttpsDecryptDomains: (domains: string[]): Promise<IpcResult> => {
    return ipcRenderer.invoke(RenderEvent.UpdateHttpsDecryptDomains, domains)
  },
  updateSettings: (params: UpdateSettingsParams) => {
    return ipcRenderer.invoke(RenderEvent.UpdateSettings, params)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
