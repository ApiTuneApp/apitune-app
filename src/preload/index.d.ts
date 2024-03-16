import { ElectronAPI } from '@electron-toolkit/preload'
import { MainEvent } from 'src/shared/contract'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      onProxyLog: (callback) => void
      clearupMainEvent: (event: MainEvent) => void
    }
  }
}
