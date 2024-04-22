import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { MainEvent, RenderEvent, AddRuleResult, ApiRules } from '../shared/contract'

// Custom APIs for renderer
const api = {
  onProxyLog: (callback): void => {
    ipcRenderer.on(MainEvent.ProxyLog, (_, log) => callback(log))
  },
  clearupEvent: (event: MainEvent | RenderEvent): void => {
    ipcRenderer.removeAllListeners(event)
  },
  addRule: (rules: string): Promise<AddRuleResult> => {
    return ipcRenderer.invoke(RenderEvent.AddRule, rules)
  },
  getApiRules: (): Promise<ApiRules> => {
    return ipcRenderer.invoke(RenderEvent.GetApiRules)
  },
  updateRuleGroupName: (id: string, ruleName: string): Promise<AddRuleResult> => {
    return ipcRenderer.invoke(RenderEvent.UpdateRuleGroupName, id, ruleName)
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
