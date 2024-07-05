import log from 'electron-log/main'
import { IncomingMessage } from 'http'
import { Socket } from 'net'

import config from './config'
import { HttpsControl } from './contracts'
import { decodeHttps } from './decode-https'
import { isHttps } from './helper'
import { makeTcpTunnel } from './make-tcp-tunnel'

export async function onConnect(req: IncomingMessage, socket: Socket, head: Buffer) {
  socket.on('error', (err: Error) => {
    log.error('[OnConnect]Error', err, req.url)
  })
  log.info('[OnConnect]Url', req.url)

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

  if (isHttps(head)) {
    if (/[^a-z]$/.test(host)) {
      log.info('[OnConnect]Https host invalid', url)
      // do nothing
    } else {
      const httpsControl = getHttpsControl(host, socket)
      if (httpsControl === 'decode') {
        // https decode
        decodeHttps(host, socket, head)
        return
      } else {
        otherOption = {
          noLog: httpsControl === 'ignore'
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
      log.info('[OnConnect]Pass tunnel', {
        url,
        headerStr
      })
    }
  }
  makeTcpTunnel(socket, head, tcpOption, {
    ...otherOption,
    url
  })
}

export function getHttpsControl(hostname: string, socket: Socket): HttpsControl {
  // 为了下载cer证书，所以不解本站点（此时手机没有证书）
  // if (KPROXY_DOMAINS.includes(hostname)) {
  //   return 'tunnel'
  // }

  const httpsControl = 'decode'
  // const url = new URL('https://' + hostname + '/');
  // const rules = envIdRulesMap[envId] || [];

  // for (const rule of rules) {
  //   if ('httpsControl' in rule) {
  //     if (isMatchArray(url, rule.includes) && !isMatchArray(url, rule.excludes)) {
  //       httpsControl = rule.httpsControl
  //     }
  //   }
  //   if (rule.break) {
  //     break;
  //   }
  // }

  return HttpsControl.decode
}
