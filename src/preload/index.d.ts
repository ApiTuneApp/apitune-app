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
  SyncInfo
} from 'src/shared/contract'

type onProxyLogCallback = (log: Log) => void

type onAuthCodeCallback = (access_token: string, refresh_token: string) => void

type onPrintLogCallback = (printItem: PrintItem) => void

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      onProxyLog: (callback: onProxyLogCallback) => void
      onAuthCode: (callback: onAuthCodeCallback) => void
      onPrintLog: (callback: onPrintLogCallback) => void
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
    }
  }
}
