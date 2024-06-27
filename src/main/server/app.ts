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

  // The request parameters to be sent to the remote end
  ctx.remoteRequestOptions = {
    method: ctx.method,
    url: new URL(ctx.href),
    headers: ctx.headers
  }
  // Request body stream to be sent to the far end
  ctx.remoteRequestBody = ctx.req
  ctx.responseHeaders = {}
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
