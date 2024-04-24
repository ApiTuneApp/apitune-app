import { ElectronAPI } from '@electron-toolkit/preload'
import {
  MainEvent,
  StorageDataParams,
  IpcResult,
  RenderEvent,
  AddGroupOpts
} from 'src/shared/contract'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      onProxyLog: (callback) => void
      getApiRules: () => Promise<ApiRules>
      clearupEvent: (event: MainEvent | RenderEvent) => void
      addRule: (ruleStr: string, opts?: AddGroupOpts) => Promise<IpcResult>
      updateRuleGroupName: (id: string, ruleName: string) => Promise<IpcResult>
      deleteRule: (id: string) => Promise<IpcResult>
    }
  }
}
