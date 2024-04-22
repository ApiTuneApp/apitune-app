import { ElectronAPI } from '@electron-toolkit/preload'
import { MainEvent, StorageDataParams, AddRuleResult, RenderEvent } from 'src/shared/contract'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      onProxyLog: (callback) => void
      getApiRules: () => Promise<ApiRules>
      clearupEvent: (event: MainEvent | RenderEvent) => void
      addRule: (ruleStr: string, storageKey?: string) => Promise<AddRuleResult>
      updateRuleGroupName: (id: string, ruleName: string) => Promise<AddRuleResult>
    }
  }
}
