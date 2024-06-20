import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import {
  MainEvent,
  RenderEvent,
  IpcResult,
  ApiRules,
  AddGroupOpts,
  Theme,
  TestItem
} from '../shared/contract'

// Custom APIs for renderer
const api = {
  onProxyLog: (callback): void => {
    ipcRenderer.on(MainEvent.ProxyLog, (_, log) => callback(log))
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
  enableRule: (id: string, enable: boolean): Promise<IpcResult> => {
    return ipcRenderer.invoke(RenderEvent.EnableRule, id, enable)
  },
  getApiRules: (): Promise<ApiRules> => {
    return ipcRenderer.invoke(RenderEvent.GetApiRules)
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
  getIp: (): Promise<string> => {
    return ipcRenderer.invoke(RenderEvent.GetIP)
  },
  ca: (type): Promise<IpcResult> => {
    return ipcRenderer.invoke(RenderEvent.CA, type)
  },
  getTestResults: (logId: number): Promise<TestItem> => {
    return ipcRenderer.invoke(RenderEvent.GetTestResults, logId)
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
