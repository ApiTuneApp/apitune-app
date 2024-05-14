import Axios from 'axios'
import { Context } from 'koa'
import * as lodash from 'lodash'
import replaceStream from 'replacestream'
import { PassThrough, Readable, Stream, Transform } from 'stream'
import { createBrotliDecompress, createGunzip } from 'zlib'

import {
  BodyModify,
  DelayModify,
  FunctionMoidfy,
  HeaderModify,
  RedirectModify,
  ResponseStatusModify,
  RuleType,
  SpeedLimitModify
} from '../../shared/contract'
import { EditBodyOption, EditBodyType } from './contracts'
import { getBase64, getJson, sandbox, toBuffer, toStream } from './helper'

// keep origin infor
function saveOriginInfo(ctx: Context, item: object) {
  if (!ctx.originInfo) {
    ctx.originInfo = {}
  }
  ctx.originInfo = {
    ...ctx.originInfo,
    ...item
  }
}

export function rewrite(ctx: Context, modify: RedirectModify) {
  saveOriginInfo(ctx, {
    href: ctx.href
  })
  const newUrl = new URL(modify.value as string)
  ctx.remoteRequestOptions.headers.host = newUrl.host
  const url = ctx.remoteRequestOptions.url
  if (newUrl.protocol) {
    url.protocol = newUrl.protocol.replace(':', '')
  }
  url.host = newUrl.host
  url.pathname = newUrl.pathname
}

export function requestHeaders(ctx: Context, modify: HeaderModify) {
  saveOriginInfo(ctx, {
    headers: ctx.remoteRequestOptions.headers
  })
  const origHeaders = ctx.remoteRequestOptions.headers

  for (const { name, value, type } of modify.value) {
    const key = name.toLowerCase()
    if (type === 'add') {
      origHeaders[key] = value
    } else if (type === 'override') {
      origHeaders[key] = value
    } else if (type === 'remove') {
      delete origHeaders[key]
    }
  }
}

export function requestBody(ctx: Context, modify: BodyModify) {
  saveOriginInfo(ctx, {
    requestBody: ctx.remoteRequestBody
  })
  beforeModifyReqBody(ctx)
  // TODO: support other EditBodyType
  ctx.remoteRequestBody = editStream(ctx.remoteRequestBody, {
    type: EditBodyType.overwrite,
    content: modify.value
  })
}

export function _requestBodyWithOpt(ctx: Context, option: EditBodyOption) {
  beforeModifyReqBody(ctx)
  ctx.remoteRequestBody = editStream(ctx.remoteRequestBody, option)
}

export async function requestFunction(ctx: Context, modify: FunctionMoidfy) {
  const reqBase = await getBase64(ctx.req)
  const bodyStr = reqBase ? reqBase.base64.toString() : null
  const reqBody = getJson(bodyStr)

  let params = {}
  if (ctx.method === 'GET') {
    params = ctx.request.query
  } else {
    params = reqBody
  }

  const result = await sandbox(
    {
      __ctx: ctx,
      lodash: lodash,
      request: {
        url: ctx.request.URL,
        ip: ctx.request.ip,
        headers: ctx.request.headers,
        query: ctx.request.query
      },
      params,
      requestBody: reqBody,
      requestHeaders: ctx.remoteRequestOptions.headers
    },
    modify.value
  )
  if (result) {
    if (result.headers) {
      ctx.remoteRequestOptions.headers = result.headers
    }
    requestBody(ctx, {
      type: RuleType.RequestBody,
      value: JSON.stringify(result.requestBody)
    })
  }
}

export function responseHeaders(ctx: Context, modify: HeaderModify) {
  const origHeaders = ctx.responseHeaders

  for (const { name, value, type } of modify.value) {
    const key = name.toLowerCase()
    if (key === 'set-cookie') {
      let cookies = origHeaders[key]
      if (!cookies) {
        cookies = origHeaders[key] = []
      }
      cookies.push(value)
    } else {
      if (type === 'add') {
        origHeaders[key] = value
      } else if (type === 'override') {
        origHeaders[key] = value
      } else if (type === 'remove') {
        delete origHeaders[key]
      }
    }
  }
}

export function responseStatus(ctx: Context, statusModiy: ResponseStatusModify) {
  ctx.status = Number(statusModiy.value)
}

function beforeModifyReqBody(ctx: Context) {
  if (ctx.remoteRequestOptions.headers) {
    delete ctx.remoteRequestOptions.headers['content-length']
  }
}

export function responseBody(ctx: Context, bodyModify: BodyModify) {
  beforeModifyResBody(ctx)
  ctx.responseBody = editStream(ctx.responseBody, {
    type: EditBodyType.overwrite,
    content: bodyModify.value
  })
}

function editStream(source: Readable, option: EditBodyOption) {
  let res: Readable = source
  if (option.type === EditBodyType.overwrite) {
    source.on('data', () => {})
    res = toStream(option.content)
  } else if (option.type === EditBodyType.append) {
    const pass = new PassThrough()
    source.on('data', (chunk) => {
      pass.write(chunk)
    })
    source.on('end', () => {
      pass.write(option.content)
      pass.end()
    })
    res = pass
  } else if (option.type === EditBodyType.prepend) {
    const pass = new PassThrough()
    pass.write(option.content)
    source.pipe(pass)
    res = pass
  } else if (option.type === EditBodyType.replace) {
    res = source.pipe(
      replaceStream(option.pattern, option.content, {
        ignoreCase: false
      })
    )
  } else if (option.type === EditBodyType.replaceByRegex) {
    const regex = new RegExp(option.pattern, option.patternFlags)
    res = source.pipe(replaceStream(regex, option.content))
  }
  return res
}

/**
 * 请求限速
 * @param ctx
 * @param to x kB/s
 */
export function requestSpeedLimit(ctx: Context, modify: SpeedLimitModify) {
  if (!modify.value) {
    return
  }
  ctx.remoteRequestBody = ctx.remoteRequestBody.pipe(
    new Transform({
      transform(chunk, encoding, callback) {
        setTimeout(callback.bind(null, null, chunk), chunk.length / modify.value)
      }
    })
  )
}

/**
 * 响应限速
 * @param ctx
 * @param to x kB/s
 */
export function responseSpeedLimit(ctx: Context, modify: SpeedLimitModify) {
  if (!modify) {
    return
  }
  ctx.responseBody = ctx.responseBody.pipe(
    new Transform({
      transform(chunk, encoding, callback) {
        setTimeout(callback.bind(null, null, chunk), chunk.length / modify.value)
      }
    })
  )
}

/**
 * 请求延迟
 * @param ctx
 * @param to 单位ms
 */
export function requestDelay(ctx: Context, delayModify: DelayModify) {
  ctx.remoteRequestBody = streamDelay(ctx.remoteRequestBody, delayModify.value)
}

/**
 * 响应延迟
 * @param ctx
 * @param to 单位ms
 */
export function responseDelay(ctx: Context, delayModify: DelayModify) {
  ctx.responseBody = streamDelay(ctx.responseBody, delayModify.value)
}

const vmAxios = Axios.create({
  timeout: 10000
})

export async function responseFunction(ctx: Context, modify: FunctionMoidfy) {
  const funStr = modify.value
  if (!funStr) {
    return
  }
  beforeModifyResBody(ctx)

  const oldStream = ctx.responseBody
  const newStream = new PassThrough()

  ctx.responseBody = newStream

  try {
    const resBuf = await toBuffer(oldStream)
    let response = resBuf.toString()

    if (ctx.responseHeaders['content-type']?.startsWith('application/json')) {
      response = getJson(response)
    }

    // 从log 中间件获取request信息
    const requestBody = ctx.log?.requestBody?.toString()
    const params = ctx.method === 'GET' ? ctx.request.query : getJson(requestBody)

    const result = await sandbox(
      {
        __ctx: ctx,
        lodash: lodash,
        axios: vmAxios,
        request: {
          url: ctx.request.URL,
          ip: ctx.request.ip,
          headers: ctx.request.headers,
          query: ctx.request.query,
          body: requestBody
        },
        params: params,
        responseBody: response,
        responseHeaders: ctx.responseHeaders,
        responseStatus: ctx.status
      },
      funStr
    )

    if (result) {
      const body = await result.responseBody
      ctx.status = Number(result.responseStatus)
      ctx.responseHeaders = result.responseHeaders
      newStream.end(typeof body === 'string' ? body : JSON.stringify(body))
    }
  } catch (e: any) {
    ctx.status = 500
    ctx.responseHeaders['content-type'] = 'text/plain; charset=utf-8'
    newStream.end('ApiTune response function error ' + e.message)
  }
}

function streamDelay(old: Stream, to: number) {
  if (!to) {
    return old
  }
  const stream = new PassThrough()
  old.on('data', (chunk) => {
    setTimeout(() => {
      stream.write(chunk)
    }, to)
  })
  old.on('end', (chunk) => {
    setTimeout(() => {
      stream.end(chunk)
    }, to)
  })
  return stream
}

/**
 * 所有修改body的操作 都需要先调用本方法，做了以下事情：
 * 1. 删除 content-length
 * 2. 为 responseBody 解压缩
 *
 * @param ctx
 */
function beforeModifyResBody(ctx: Context) {
  // 1. 修改结果体会导致长度变化
  // 2. 且不方便计算最终长度，所以简单使用chunked输出
  // nodejs http.Server 如果没有设置 content-length 就会按chunked输出
  delete ctx.responseHeaders['content-length']
  // 解压
  // 修改内容之前需要先解开压缩
  const contentEncoding = ctx.responseHeaders['content-encoding']
  if (contentEncoding) {
    delete ctx.responseHeaders['content-encoding']
    if (contentEncoding === 'gzip') {
      ctx.responseBody = ctx.responseBody.pipe(createGunzip())
    } else if (contentEncoding === 'br') {
      ctx.responseBody = ctx.responseBody.pipe(createBrotliDecompress())
    } else {
      // 在请求时已经限制了只能用 gzip 和 br, 遇到其他，就时错误算法, 无法解压，也就不能修改内部
      console.error({
        message: 'content-encoding error',
        extra: {
          contentEncoding
        }
      })
    }
  }
}
