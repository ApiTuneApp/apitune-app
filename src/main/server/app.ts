import Koa, { Context, Next } from 'koa'

import httpClient from './http-client'
import doRules from './rules-middleware'
import config from './config'

// import RulesMiddleware from './middleware/rules'
// import LogMiddleware from './middleware/log'
// import PreMiddleware from './middleware/pre'
// import RearMiddleware from './middleware/rear'

export const app = new Koa()

app.use(async function errorHandler(ctx: Context, next: Next) {
  if (ctx.header[config.proxyHeader]) {
    ctx.body = '`kproxy` 需要设置为代理服务器使用，具体请参见说明文档， 当前请求死循环'
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

// == 代理服务 ====================================================
// 前置中间件
// app.use(PreMiddleware)
// // 日志中间件
// app.use(LogMiddleware)
// // 规则中间件
// app.use(RulesMiddleware)
// // 后置中间件
// app.use(RearMiddleware)

app.use(async (ctx: Context, next: Next) => {
  // define custom ctx properties
  // 命中的规则
  ctx.matchedRules = []
  ctx.matchedRulesIds = []

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
  await httpClient(ctx)

  await next()

  ctx.set(ctx.responseHeaders)
  ctx.body = ctx.responseBody
})

app.use(doRules)

export const handleRequest = app.callback()
