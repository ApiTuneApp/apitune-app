import { ElectronAPI } from '@electron-toolkit/preload'
import {
  MainEvent,
  StorageDataParams,
  IpcResult,
  RenderEvent,
  AddGroupOpts,
  Log
} from 'src/shared/contract'

type onProxyLogCallback = (log: Log) => void

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      onProxyLog: (callback: onProxyLogCallback) => void
      getApiRules: () => Promise<ApiRules>
      clearupEvent: (event: MainEvent | RenderEvent) => void
      addRule: (ruleStr: string, opts?: AddGroupOpts) => Promise<IpcResult>
      updateRule: (id: string, ruleStr: string) => Promise<IpcResult>
      enableRule: (id: string, enable: boolean) => Promise<IpcResult>
      updateRuleGroupName: (id: string, ruleName: string) => Promise<IpcResult>
      deleteRule: (id: string) => Promise<IpcResult>
      changePort: (port: number) => Promise<IpcResult>
    }
  }
}
