import log from 'electron-log/main'
import { IncomingMessage } from 'http'
import { Socket } from 'net'

import { matchHostname } from '../../shared/utils'
import { proxyLog } from '../communicator'
import { DefaultSettingData, SubscriptionStorage } from '../storage'
import config from './config'
import { HttpsControl } from './contracts'
import { decodeHttps } from './decode-https'
import { isHttps } from './helper'
import { makeTcpTunnel, makeTcpTunnel2 } from './make-tcp-tunnel'
import { genLogId } from './middleware/log'

export async function onConnect(req: IncomingMessage, socket: Socket, head: Buffer) {
  const startTime = Date.now() // 添加开始时间
  let requestSize = head.length
  let responseSize = 0

  socket.on('error', (err: Error) => {
    log.error('[OnConnect] Error', err, req.url)
  })
  log.info('[OnConnect] Url', req.url)

  // connect returns to accept the proxy handshake
  socket.write('HTTP/1.1 200 Connection Established\r\n')
  socket.write('Connection: Keep-Alive\r\n')
  socket.write(`Proxy-agent: ${config.name}\r\n`)
  socket.write('\r\n')

  // head maybe empty
  // need to get whether it is a https request from head
  if (!head || head.length === 0) {
    head = await new Promise((resolve) => {
      socket.once('data', resolve)
    })
  }
  const url = req.url || ''
  const [host, strPort] = url.split(':', 2)
  const port = strPort && Number(strPort)

  let tcpOption = {
    host,
    port
  } as any

  let otherOption
  const tunnelLog = {
    id: genLogId(),
    matchedRules: [],
    method: 'CONNECT',
    protocol: 'https:',
    host: host,
    url: `https://${host}:${port}`,

    // connection information
    clientIp: socket.remoteAddress,
    clientPort: socket.remotePort,

    // request headers
    requestHeaders: req.headers,

    // time information
    startTime: startTime,

    // status
    status: 200,
    message: 'Connection Established'
  } as any
  if (isHttps(head)) {
    if (/[^a-z]$/.test(host)) {
      log.info('[OnConnect] Https host invalid', url)
      // do nothing
    } else {
      const httpsControl = getHttpsControl(host)
      if (httpsControl === HttpsControl.decode) {
        decodeHttps(host, socket, head)
        return
      } else {
        otherOption = {
          noLog: httpsControl === HttpsControl.ignore
        }
      }
    }
  } else {
    const headerStr = head.toString()
    if (headerStr.includes('websocket')) {
      // proxy websocket, then trigger upgrade
      tcpOption = {
        port: config.port
      }
    } else {
      // for other connect requests, use transparent proxy
      log.info('[OnConnect] Pass tunnel', {
        url,
        headerStr
      })
    }
  }
  makeTcpTunnel2(socket, head, tcpOption, {
    ...otherOption,
    url: `https://${host}:${port}`,
    onData: (fromClient: boolean, chunk: Buffer) => {
      if (fromClient) {
        requestSize += chunk.length
      } else {
        responseSize += chunk.length
      }
    },
    onEnd: () => {
      // complete log when connection ends
      tunnelLog.finishTime = Date.now()
      tunnelLog.requestBodyLength = requestSize
      tunnelLog.responseBodyLength = responseSize

      if (!otherOption?.noLog) {
        proxyLog(tunnelLog)
      }
    }
  })
}

export function getHttpsControl(hostname: string): HttpsControl {
  if (!SubscriptionStorage.checkActive()) {
    return HttpsControl.decode
  }
  if (
    !DefaultSettingData.httpsDecryptDomains ||
    DefaultSettingData.httpsDecryptDomains.length === 0
  ) {
    return HttpsControl.decode
  }
  if (matchHostname(hostname, DefaultSettingData.httpsDecryptDomains)) {
    return HttpsControl.decode
  } else {
    return HttpsControl.tunnel
  }
}
