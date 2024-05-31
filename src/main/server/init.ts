import * as http from 'http'

import { handleRequest } from './app'
import { onConnect } from './on-connect'
import { onUpgrade } from './on-upgrade'

process.on('uncaughtException', (e) => {
  console.log('uncaughtException', e)
})

process.on('unhandledRejection', (e) => {
  console.log('unhandledRejection', e)
})

let httpServer: http.Server

export function initServer(port, success?: () => void, fail?: (e: Error) => void) {
  httpServer = http.createServer({
    insecureHTTPParser: true
  })

  httpServer.on('request', handleRequest)
  httpServer.on('connect', onConnect)
  httpServer.on('upgrade', onUpgrade)
  httpServer
    .listen(port, '127.0.0.1', () => {
      console.log(`Server is listening on port ${port}`)
      success && success()
    })
    .on('error', (e) => {
      fail && fail(e)
    })
  return httpServer
}

export function stopServer() {
  httpServer.close(() => {
    console.log('Server stopped')
  })
}

export function changeServerPort(port: number, sucess?: () => void, fail?: (e: Error) => void) {
  stopServer()
  initServer(port, sucess, fail)
}
