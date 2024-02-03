import { IncomingMessage } from 'http'
import { Socket } from 'net'

export function onUpgrade(req: IncomingMessage, clientSocket: Socket, head: Buffer) {
  console.log('upgrade request ===>')
}
