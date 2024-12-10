import log from 'electron-log/main'
import { IncomingMessage } from 'http'
import { Socket } from 'net'

import { matchHostname } from '../../shared/utils'
import { proxyLog } from '../communicator'
import { DefaultSettingData } from '../storage'
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

  // connect 返回接受代理握手
  socket.write('HTTP/1.1 200 Connection Established\r\n')
  socket.write('Connection: Keep-Alive\r\n')
  socket.write(`Proxy-agent: ${config.name}\r\n`)
  socket.write('\r\n')

  // head 可能为空
  // 需要从 head 中得到是否是 https 请求
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

    // 连接信息
    clientIp: socket.remoteAddress,
    clientPort: socket.remotePort,

    // 请求头
    requestHeaders: req.headers,

    // 时间信息
    startTime: startTime,

    // 状态
    status: 200,
    message: 'Connection Established'
  } as any
  if (isHttps(head)) {
    if (/[^a-z]$/.test(host)) {
      log.info('[OnConnect] Https host invalid', url)
      // do nothing
    } else {
      const httpsControl = getHttpsControl(host, socket)
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
      // 代理 websocket，然后会触发 upgrade
      tcpOption = {
        port: config.port
      }
    } else {
      // 对于其他 connect 请求，采取透明代理
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
      // 连接结束时完成日志
      tunnelLog.finishTime = Date.now()
      tunnelLog.requestBodyLength = requestSize
      tunnelLog.responseBodyLength = responseSize

      if (!otherOption?.noLog) {
        proxyLog(tunnelLog)
      }
    }
  })
}

export function getHttpsControl(hostname: string, socket: Socket): HttpsControl {
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
