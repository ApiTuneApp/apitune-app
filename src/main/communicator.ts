import { BrowserWindow, WebContents } from 'electron'
import { MemeoryLogStorage, PrintStorage } from './storage'
import { ApiRules, Log, MainEvent, PrintItem, RenderEvent } from '../shared/contract'

let webContents: WebContents

export function initCommunicator(mainWindow: BrowserWindow): void {
  if (!webContents) {
    webContents = mainWindow.webContents
  }
}

export function proxyLog(log: Log): void {
  if (!webContents) return
  webContents.send(MainEvent.ProxyLog, log)

  // we only store log has matched rule to save memeory
  if (log.matchedRules.length > 0) {
    MemeoryLogStorage.add(log)
  }
}

export function rendererLog(message: string): void {
  if (!webContents) return
  webContents.send(MainEvent.RendererLog, message)
}

export function getApiRules(apiRules: ApiRules): void {
  if (!webContents) return
  webContents.send(RenderEvent.GetApiRules, apiRules)
}

export function getAuthCode(accessToken: string, refreshToken: string): void {
  if (!webContents) return
  webContents.send(MainEvent.GetAuthCode, accessToken, refreshToken)
}

export function printLog(printItem: PrintItem): void {
  if (!webContents) return
  webContents.send(MainEvent.PrintLog, printItem)
  PrintStorage.add(printItem)
}

export function openShare(shareId: string): void {
  if (!webContents) return
  webContents.send(MainEvent.OpenShare, shareId)
}
