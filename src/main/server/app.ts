import log from 'electron-log/main'
import Koa, { Context, Next } from 'koa'
import fs from 'node:fs'

import { IAppContext, IAppState } from '../contracts'
import crtMgr from './cert-manager'
import config from './config'
// import httpClient from './http-client-axios'
import httpClient from './http-client'
import { LogRequestMiddleware, LogResponseMiddleware } from './middleware/log'
import RulesMiddleware from './middleware/rules'
import testScriptMiddleware from './middleware/testScript'

export const app = new Koa<IAppState, IAppContext>()

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
    }
    log.error('[AppMiddleware] Proxy internal error', err)

    ctx.set('content-type', 'text/plain;charset=utf-8')
    ctx.body = 'Proxy Error: ' + err.message
  }
})

app.use(async (ctx, next) => {
  if (ctx.host === 'cert.apitune.io' && ctx.method === 'GET') {
    const caPath = crtMgr.genRootCaFilePath()
    ctx.set('Content-Disposition', 'attachment; filename="apitune_ca.crt"')
    ctx.set('Content-Type', 'application/x-x509-ca-cert')
    ctx.body = fs.createReadStream(caPath)
  } else {
    await next()
  }
})

// Test scripts run after all next done, so it should be first middleware
app.use(testScriptMiddleware)

app.use(async (ctx, next: Next) => {
  // define custom ctx properties
  // matched rule ids
  ctx.state.matchedRules = []
  // matched rule details
  ctx.state.matchedRuleDetails = []

  // The request parameters to be sent to the remote end
  ctx.state.requestOptions = {
    method: ctx.method,
    url: new URL(ctx.href),
    headers: ctx.headers
  }
  // Request body stream to be sent to the far end
  ctx.state.requestBody = ctx.req
  ctx.state.responseHeaders = {}
  ctx.state.responseBody = null

  log.info('[AppMiddleware] Start Request', ctx.href)
  await next()

  ctx.set(ctx.state.responseHeaders)
  ctx.body = ctx.state.responseBody
})

app.use(LogResponseMiddleware)
app.use(RulesMiddleware)
app.use(LogRequestMiddleware)
app.use(async (ctx: Context, next: Next) => {
  await httpClient(ctx)
  await next()
})

app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    log.error('[AppMiddleware] Server middleware error', err)
  }
})

export const handleRequest = app.callback()
