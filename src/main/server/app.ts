import Koa, { Context, Next } from 'koa'

import config from './config'
import httpClient from './http-client'
import LogsMiddleware from './middleware/log'
import RulesMiddleware from './middleware/rules'
import testScriptMiddleware from './middleware/testScript'

export const app = new Koa()

app.use(async function errorHandler(ctx: Context, next: Next) {
  if (ctx.header[config.proxyHeader]) {
    ctx.body =
      'ApiTune needs to be set as a proxy server to use, please refer to the documentation for details'
    ctx.status = 400
    return
  }
  try {
    await next()
  } catch (err: any) {
    if (err.status) {
      ctx.status = err.status
      ctx.message = err.statusMessage
    } else {
      ctx.status = 500
      ctx.message = 'Proxy internal error'
      console.error(err)
    }

    ctx.set('content-type', 'text/plain;charset=utf-8')
    ctx.body = 'Proxy Error: ' + err.message
  }
})

// Test scripts run after all next done, so it should be first middleware
app.use(testScriptMiddleware)

app.use(async (ctx: Context, next: Next) => {
  // define custom ctx properties
  // matched rule ids
  ctx.matchedRules = []
  // matech rule details
  ctx.matchedRuleDetails = []

  // 要发往远端的请求参数
  ctx.remoteRequestOptions = {
    method: ctx.method,
    url: new URL(ctx.href),
    headers: ctx.headers
  }
  // 要发到远端的 request body 流
  ctx.remoteRequestBody = ctx.req
  // 要返回的header
  ctx.responseHeaders = {}
  // 要返回的结果体
  ctx.responseBody = null

  console.log('[Start Request] ===> ', ctx.href)
  await next()

  ctx.set(ctx.responseHeaders)
  ctx.body = ctx.responseBody
})

app.use(RulesMiddleware)
app.use(LogsMiddleware)
app.use(async (ctx: Context, next: Next) => {
  await httpClient(ctx)
  await next()
})

app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    console.error('koa error', err)
  }
})

export const handleRequest = app.callback()
