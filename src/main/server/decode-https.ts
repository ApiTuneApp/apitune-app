import * as https from 'https'

import { makeTcpTunnel } from './make-tcp-tunnel'
import { handleRequest } from './app'
import { getCert } from './ssl'
import config from './config'
import { Socket, AddressInfo } from 'net'
import { getWildcardDomain } from './helper'
import { onUpgrade } from './on-upgrade'
import { onConnect } from './on-connect'

const httpsServerMap = new Map<string, https.Server>()

export async function decodeHttps(hostname: string, socket: Socket, head: Buffer) {
  const httpsServer = await getMiddleHttpsServer(hostname)
  const address = httpsServer.address() as any

  // tcp 层代理到 中间服务器
  makeTcpTunnel(socket, head, {
    port: address.port
  })
}

async function getMiddleHttpsServer(hostname: string) {
  hostname = getWildcardDomain(hostname)
  touchCloseServerCountdown(hostname)
  let httpsServer = httpsServerMap.get(hostname)
  if (httpsServer) {
    return httpsServer
  }
  const option = await getCert(hostname)

  httpsServer = https.createServer(
    {
      ...option,
      // TypeError [ERR_INVALID_HTTP_TOKEN]: Header name must be a valid HTTP token ["access-control-expose-headers "]
      insecureHTTPParser: true
    },
    handleRequest
  )

  httpsServer.on('connect', onConnect)
  httpsServer.on('upgrade', onUpgrade)

  return new Promise<https.Server>((resolve, reject) => {
    httpsServer!.listen(() => {
      httpsServerMap.set(hostname, httpsServer as https.Server)
      resolve(httpsServer as https.Server)
    })
  })
}
interface closeServerTimers {
  [x: string]: NodeJS.Timeout
}
const closeServerTimers: closeServerTimers = {}
// https server 不活跃之后回收
function touchCloseServerCountdown(hostname: string) {
  clearTimeout(closeServerTimers[hostname])
  closeServerTimers[hostname] = setTimeout(() => {
    delete closeServerTimers[hostname]
    const httpsServer = httpsServerMap.get(hostname)
    if (httpsServer) {
      httpsServer.close()
      httpsServerMap.delete(hostname)
    }
  }, config.httpsServerExpire)
}
