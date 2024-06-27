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
  return new Promise<void>((resolve, reject) => {
    const remoteOptions = ctx.remoteRequestOptions
    const url = remoteOptions.url
    const client = url.protocol === 'https:' ? https : http
    const agent = url.protocol === 'https:' ? httpsAgent : httpAgent
    const headers = remoteOptions.headers
    const reqHeaders: any = {}

    // delete proxy header
    for (const key in headers) {
      if (key.startsWith('proxy-')) {
        // 过滤掉
      } else {
        reqHeaders[key] = headers[key]
      }
    }

    // Add flags to avoid being forwarded
    reqHeaders[config.proxyHeader] = 1

    const serverReq = client.request(
      url,
      {
        method: ctx.method,
        headers: reqHeaders,
        // timeout: config.serverRequestTimeout,
        lookup: cacheable.lookup as unknown as LookupFunction,
        insecureHTTPParser: true,
        agent
      },
      (serverRes: IncomingMessage) => {
        // clearTimeout(timeoutKey)
        if (serverReq.destroyed) return

        // record error
        serverRes.on('error', (err) => {
          console.error(err)
        })

        ctx.remoteIp = serverRes.socket.remoteAddress
        ctx.remotePort = serverRes.socket.remotePort
        ctx.status = serverRes.statusCode || 0
        ctx.message = serverRes.statusMessage || ''

        ctx.responseHeaders = serverRes.headers
        ctx.responseBody = serverRes

        console.log('server res ===> ', ctx.status, ctx.message)
        resolve()
      }
    )

    // serverReq.on('timeout', () => {
    //   serverReq.destroy()
    //   console.log('server req timeout ===>', url)
    //   reject('server req timeout')
    // })

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
      resolve()
    })

    ctx.remoteRequestBody.pipe(serverReq)
  })
}
