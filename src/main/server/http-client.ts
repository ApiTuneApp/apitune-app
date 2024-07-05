import CacheableLookup from 'cacheable-lookup'
import log from 'electron-log/main'
import http, { IncomingMessage } from 'http'
import https from 'https'
import { LookupFunction } from 'net'

import { IAppContext } from '../contracts'
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

export default function (ctx: IAppContext) {
  return new Promise<void>((resolve, reject) => {
    const remoteOptions = ctx.state.requestOptions
    const url = remoteOptions.url
    const client = url.protocol === 'https:' ? https : http
    const agent = url.protocol === 'https:' ? httpsAgent : httpAgent
    const headers = remoteOptions.headers
    const reqHeaders: any = {}

    // delete proxy header
    for (const key in headers) {
      if (key.startsWith('proxy-')) {
        // ignore
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
          log.error('[HttpClient]Server response error', err, url)
        })

        ctx.state.remoteIp = serverRes.socket.remoteAddress
        ctx.state.remotePort = serverRes.socket.remotePort

        ctx.status = serverRes.statusCode || 0
        ctx.message = serverRes.statusMessage || ''

        ctx.state.responseHeaders = serverRes.headers as { [key: string]: string | string[] }
        ctx.state.responseBody = serverRes

        log.info('[HttpClient]Server response', ctx.status, ctx.message, url)
        resolve()
      }
    )

    serverReq.on('timeout', () => {
      serverReq.destroy()
      log.info('[HttpClient]Server request timeout', url)
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
        statusMessage = `${config.name} upstream error`
      }
      ctx.state.responseHeaders = {
        'content-type': 'text/plain;charset=utf-8'
      }
      ctx.status = status
      ctx.message = statusMessage
      ctx.state.responseBody = toStream(`${config.name} request target server failed: ` + message)
      log.info('[HttpClient]Server request error', status, message, url)

      resolve()
    })

    serverReq.on('close', () => {
      log.info('[HttpClient]Server request close', url)
      resolve()
    })

    ctx.state.requestBody.pipe(serverReq)
  })
}
