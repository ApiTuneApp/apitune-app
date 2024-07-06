import { Context, Next } from 'koa'
import { Log } from '../../../shared/contract'
import { getBase64, getBodyInfo } from '../helper'
import { proxyLog } from '../../communicator'

let logId = 1

export function genLogId() {
  return logId++
}

export async function LogRequestMiddleware(ctx: Context, next: Next) {
  // Store log before request send
  const log: Log = {
    id: genLogId(),
    matchedRules: ctx.state.matchedRules,
    method: ctx.method,
    protocol: ctx.state.requestOptions.url?.protocol,
    host: ctx.host,
    url: ctx.href,
    search: ctx.URL.searchParams?.toString(),
    pathname: ctx.state.requestOptions.url?.pathname,
    clientIp: ctx.socket.localAddress,
    clientPort: ctx.socket.localPort,
    requestHeaders: ctx.headers,
    requestBody: Buffer.from(''),
    startTime: Date.now()
  }

  // Used to consume log in other middleware
  ctx.state.log = log

  // Can't use await here
  getBase64(ctx.state.requestBody).then(({ length, base64 }) => {
    log.requestBody = base64
    log.requestBodyLength = length
  })

  // send request, get data
  await next()
}

export async function LogResponseMiddleware(ctx: Context, next: Next) {
  // send request, get data
  await next()

  const log = ctx.state.log

  log.status = ctx.status
  log.message = ctx.message
  log.responseHeaders = ctx.state.responseHeaders
  log.remoteIp = ctx.state.remoteIp
  log.remotePort = ctx.state.remotePort

  const type = ctx.state.responseHeaders['content-type'] || ''
  log.responeseType = type.split(';', 1)[0]

  getBase64(ctx.state.responseBody).then(({ base64, length }) => {
    log.responseBody = base64
    log.responseBodyLength = length
    log.finishTime = Date.now()
    log.responseBodyInfo = getBodyInfo(log)

    // log.requestBody = Buffer.from(log.requestBody as unknown as string, 'base64')
    log.requestBodyInfo = Buffer.from(log.requestBody as unknown as string, 'base64').toString()

    proxyLog(log)
  })
}
