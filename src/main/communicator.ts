import { BrowserWindow, WebContents } from 'electron'
import { Log, MainEvent } from '../common/contract'

let webContents: WebContents

export function initCommunicator(mainWindow: BrowserWindow): void {
  if (!webContents) {
    webContents = mainWindow.webContents
  }
}

export function proxyLog(log: Log): void {
  if (!webContents) return
  webContents.send(MainEvent.ProxyLog, log)
}

export function rendererLog(message: string): void {
  if (!webContents) return
  webContents.send(MainEvent.RendererLog, message)
}
