import { IncomingMessage } from 'http'
import { Socket } from 'net'
import log from 'electron-log/main'

export function onUpgrade(req: IncomingMessage, clientSocket: Socket, head: Buffer) {
  log.info('[onUpgrade] Request url', req.url)
}
