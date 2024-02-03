import * as http from 'http'

import { handleRequest } from './app'
import { onConnect } from './on-connect'
import { onUpgrade } from './on-upgrade'
import config from './config'

const httpServer = http.createServer({
  insecureHTTPParser: true
})

httpServer.on('request', handleRequest)

httpServer.on('connect', onConnect)

httpServer.on('upgrade', onUpgrade)

httpServer.listen(config.port, '127.0.0.1', () => {
  console.log(`Server is listening on port ${config.port}`)
})

process.on('uncaughtException', (e) => {
  console.log('uncaughtException', e)
})

process.on('unhandledRejection', (e) => {
  console.log('unhandledRejection', e)
})
