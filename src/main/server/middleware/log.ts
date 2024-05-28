import { Context, Next } from 'koa'
import { Log } from '../../../shared/contract'
import { getBase64, getBodyInfo } from '../helper'
import { proxyLog } from '../../communicator'

let logId = 1

export function genLogId() {
  return logId++
}

export default async function LogsMiddleware(ctx: Context, next: Next) {
  // Store log before request send
  const log: Log = {
    id: genLogId(),
    matchedRules: ctx.matchedRulesIds,
    method: ctx.method,
    protocol: ctx.remoteRequestOptions.url?.protocol,
    host: ctx.host,
    url: ctx.href,
    search: ctx.URL.searchParams.toString(),
    pathname: ctx.remoteRequestOptions.url?.pathname,
    clientIp: ctx.socket.localAddress,
    clientPort: ctx.socket.localPort,
    requestHeaders: ctx.headers,
    requestBody: Buffer.from(''),
    startTime: Date.now()
  }

  // Can't use await here
  getBase64(ctx.remoteRequestBody).then(({ length, base64 }) => {
    log.requestBody = base64
    log.requestBodyLength = length
  })

  // send request, get data
  await next()

  log.status = ctx.status
  log.message = ctx.message
  log.responseHeaders = ctx.responseHeaders
  log.remoteIp = ctx.remoteIp
  log.remotePort = ctx.remotePort

  const type = ctx.responseHeaders['content-type'] || ''
  log.responeseType = type.split(';', 1)[0]

  getBase64(ctx.responseBody).then(({ base64, length }) => {
    log.responseBody = base64
    log.responseBodyLength = length
    log.finishTime = Date.now()
    log.responseBodyInfo = getBodyInfo(log)

    // log.requestBody = Buffer.from(log.requestBody as unknown as string, 'base64')
    log.requestBodyInfo = Buffer.from(log.requestBody as unknown as string, 'base64').toString()

    proxyLog(log)
  })
}
