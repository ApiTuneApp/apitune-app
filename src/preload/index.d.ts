import { ElectronAPI } from '@electron-toolkit/preload'
import {
  MainEvent,
  RuleStorage,
  RuleStorageParams,
  IpcResult,
  RenderEvent,
  AddGroupOpts,
  Log,
  SettingStorage,
  AppTheme,
  TestItem,
  LogTestResultMap,
  PrintItem,
  SyncInfo,
  Subscription,
  UpdateSettingsParams,
  Browser
} from 'src/shared/contract'

type onProxyLogCallback = (log: Log) => void

type onAuthCodeCallback = (access_token: string, refresh_token: string) => void

type onOpenShareCallback = (shareId: string) => void

type onPrintLogCallback = (printItem: PrintItem) => void

type onUpdateProgressCallback = (progress: number) => void

type onTestResultCallback = (testResult: TestItem) => void

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      onProxyLog: (callback: onProxyLogCallback) => void
      onAuthCode: (callback: onAuthCodeCallback) => void
      onOpenShare: (callback: onOpenShareCallback) => void
      onTestResult: (callback: onTestResultCallback) => void
      onPrintLog: (callback: onPrintLogCallback) => void
      onUpdateProgress: (callback: onUpdateProgressCallback) => void
      getPrintLogs: () => Promise<PrintItem[]>
      clearPrintLogs: () => void
      setAuth: (accessToken: string, refreshToken: string) => void
      getProxyLogs: () => Promise<Log[]>
      getApiRules: () => Promise<ApiRules>
      getRuleStorage: () => Promise<RuleStorage>
      setSyncInfo: (syncInfo: SyncInfo) => void
      clearupEvent: (event: MainEvent | RenderEvent) => void
      addRule: (ruleStr: string, opts?: AddGroupOpts) => Promise<IpcResult>
      updateRule: (id: string, ruleStr: string) => Promise<IpcResult>
      editRuleGroup: (ruleId: string, groupId?: string) => Promise<IpcResult>
      enableRule: (id: string, enable: boolean) => Promise<IpcResult>
      updateRuleGroupName: (id: string, ruleName: string) => Promise<IpcResult>
      deleteRule: (id: string) => Promise<IpcResult>
      changePort: (port: number) => Promise<IpcResult>
      getSettings: () => Promise<SettingStorage>
      getAppTheme: () => Promise<AppTheme>
      changeTheme: (theme: Theme) => Promise<IpcResult>
      getIp: () => Promise<string>
      ca: (type: CaEventType) => Promise<IpcResult>
      getTestResults: (logId: number) => Promise<TestItem>
      getAllTestResults: () => Promise<LogTestResultMap>
      clearTestResult: () => Promise<IpcResult>
      changeLanguage: (language: SettingStorage['language']) => Promise<IpcResult>
      openSignInPage: () => void
      cleanRuleData: () => Promise<IpcResult>
      initServerRules: (rules: ApiRules, syncInfo: SyncInfo) => Promise<IpcResult>
      checkForUpdate: () => Promise<IpcResult>
      copyText: (text: string) => void
      duplicateRules: (rule: string) => Promise<IpcResult>
      openExternal: (url: string) => void
      setSubscription: (subscription: Subscription | null) => void
      saveRules: (rules: ApiRules) => Promise<IpcResult>
      updateHttpsDecryptDomains: (domains: string[]) => Promise<IpcResult>
      updateSettings: (params: UpdateSettingsParams) => Promise<IpcResult>
      getAvailableBrowsers: () => Promise<Browser[]>
      launchBrowser: (browserType: string) => Promise<void>
    }
  }
}
