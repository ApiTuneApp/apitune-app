import { BrowserWindow, WebContents } from 'electron'
import { MainEvent } from '../common/contract'

let webContents: WebContents

export function initCommunicator(mainWindow: BrowserWindow): void {
  if (!webContents) {
    webContents = mainWindow.webContents
  }
}

export function proxyLog(message: string): void {
  if (!webContents) return
  webContents.send(MainEvent.proxyLog, message)
}

export function rendererLog(message: string): void {
  if (!webContents) return
  webContents.send(MainEvent.rendererLog, message)
}
