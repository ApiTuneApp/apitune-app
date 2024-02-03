import CacheableLookup from 'cacheable-lookup'
import http, { IncomingMessage } from 'http'
import https from 'https'
import { Context } from 'koa'
import { LookupFunction } from 'net'
import { URL } from 'url'

import config from './config'
import { toStream } from './helper'

const httpAgent = new http.Agent({
  keepAlive: false
})

const httpsAgent = new https.Agent({
  keepAlive: false
})

const cacheable = new CacheableLookup({
  maxTtl: 30
})

export default function (ctx: Context) {
  // ctx.clientType = 'http';

  return new Promise<void>((resolve, reject) => {
    const remoteOptions = ctx.remoteRequestOptions
    const url = remoteOptions.url
    const client = url.protocol === 'https:' ? https : http
    const agent = url.protocol === 'https:' ? httpsAgent : httpAgent
    const headers = remoteOptions.headers
    const reqHeaders: any = {}

    // 删除 proxy header
    for (const key in headers) {
      if (key.startsWith('proxy-')) {
        // 过滤掉
      } else {
        reqHeaders[key] = headers[key]
      }
    }

    // 增加标志,避免被继续转发
    reqHeaders[config.proxyHeader] = 1

    const serverReq = client.request(
      url,
      {
        method: ctx.method,
        headers: reqHeaders,
        timeout: config.serverRequestTimeout,
        lookup: cacheable.lookup as unknown as LookupFunction,
        insecureHTTPParser: true,
        agent
      },
      (serverRes: IncomingMessage) => {
        clearTimeout(timeoutKey)
        if (serverReq.destroyed) return

        // record error
        serverRes.on('error', (err) => {
          console.error(err)
        })

        ctx.remoteIp = serverRes.socket.remoteAddress
        ctx.remotePort = serverRes.socket.remotePort
        ctx.status = serverRes.statusCode || 0
        ctx.message = serverRes.statusMessage || ''

        const resHeaders: any = {}
        // 过滤返回的header
        for (const key in serverRes.headers) {
          if (key === 'connection') {
            // keep-alive 是http连接的属性 不可传递
          } else if (key === 'transfer-encoding') {
            // 是否 chunked
          } else {
            // TypeError [ERR_INVALID_HTTP_TOKEN]: Header name must be a valid HTTP token ["access-control-expose-headers "]
            resHeaders[key.trim()] = serverRes.headers[key]
          }
        }
        ctx.responseHeaders = resHeaders
        ctx.responseBody = serverRes

        // let body ='';
        // serverRes.on('data', (chunk) => {
        //   body += chunk;
        // });

        // serverRes.on('end', () => {
        //   ctx.realBody = body;
        //   console.log('server res end ===> ', body);
        // });

        console.log('server res ===> ', ctx.status, ctx.message)
        resolve()
      }
    )

    serverReq.on('timeout', () => {
      serverReq.destroy()
      console.log('server req timeout ===>', url)
      reject('server req timeout')
    })

    serverReq.on('error', (err: Error) => {
      let message: string
      let statusMessage: string
      let status: number
      // timeout
      if (serverReq.destroyed) {
        status = 504
        statusMessage = `${config.name} upstream timeout`
        message = 'timeout'
      } else {
        status = 502
        message = err.message
        statusMessage = '${config.name} upstream error'
      }
      ctx.responseHeaders = {
        'content-type': 'text/plain;charset=utf-8'
      }
      ctx.status = status
      ctx.message = statusMessage
      ctx.responseBody = toStream(`${config.name} request target server failed: ` + message)

      resolve()
    })

    serverReq.on('close', () => {
      ctx.responseHeaders = {
        'content-type': 'text/plain;charset=utf-8'
      }
      ctx.status = 500
      ctx.message = `${config.name} request closed`
      ctx.responseBody = toStream('${config.name} equest target server failed: ' + 'timeout')

      resolve()
    })

    // 首次超过 120s 则 abort
    const timeoutKey = setTimeout(() => {
      if (serverReq.destroyed) return

      serverReq.destroy()
      console.error(`${config.name} request abort, requst more then 120s`)
      reject('server req timeout')
    }, 120 * 1e3)

    // TODO: what is this?
    ctx.remoteRequestBody.pipe(serverReq)

    //The request() method of the HTTP library will not automatically end requests, therefore they stay open, and time out
    serverReq.end()
  })
}
