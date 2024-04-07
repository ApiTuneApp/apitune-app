import { ElectronAPI } from '@electron-toolkit/preload'
import { MainEvent, StorageDataParams } from 'src/shared/contract'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      onProxyLog: (callback) => void
      clearupMainEvent: (event: MainEvent) => void
      saveRules: (rules: string) => void
    }
  }
}
