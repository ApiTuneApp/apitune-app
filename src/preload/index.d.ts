import { ElectronAPI } from '@electron-toolkit/preload'
import {
  MainEvent,
  RuleStorageParams,
  IpcResult,
  RenderEvent,
  AddGroupOpts,
  Log,
  SettingStorage,
  AppTheme,
  TestItem,
  LogTestResultMap
} from 'src/shared/contract'

type onProxyLogCallback = (log: Log) => void

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      onProxyLog: (callback: onProxyLogCallback) => void
      getProxyLogs: () => Promise<Log[]>
      getApiRules: () => Promise<ApiRules>
      clearupEvent: (event: MainEvent | RenderEvent) => void
      addRule: (ruleStr: string, opts?: AddGroupOpts) => Promise<IpcResult>
      updateRule: (id: string, ruleStr: string) => Promise<IpcResult>
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
    }
  }
}
