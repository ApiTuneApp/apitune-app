import { IncomingMessage } from 'http'
import { Socket } from 'net'
import { isHttps } from './helper'
import { decodeHttps } from './decode-https'
import { makeTcpTunnel } from './make-tcp-tunnel'
import config from './config'
import { HttpsControl } from './contracts'

export async function onConnect(req: IncomingMessage, socket: Socket, head: Buffer) {
  socket.on('error', (err: Error) => {
    console.error('onConnect', err)
  })
  console.log('connect request ===>', req.url, head.toString())

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
      // ERROR: KPROXY-NODE-6
      console.error({
        message: 'https host error',
        extra: {
          url
        }
      })
      // 透明代理
    } else {
      const httpsControl = getHttpsControl(host, socket)
      if (httpsControl === 'decode') {
        // https 请求解码
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
      console.log({
        message: 'other connection',
        extra: {
          url,
          headerStr
        }
      })
      // 透明代理
    }
  }
  makeTcpTunnel(socket, head, tcpOption, otherOption)
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

  return HttpsControl.ignore
}
