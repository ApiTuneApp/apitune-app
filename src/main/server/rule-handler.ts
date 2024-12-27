import Axios from 'axios'
import log from 'electron-log/main'
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
import { IAppContext } from '../contracts'
import { EditBodyOption, EditBodyType } from './contracts'
import { getBase64, getJson, sandbox, toBuffer, toStream } from './helper'

// keep origin infor
function saveOriginInfo(ctx: IAppContext, item: object) {
  if (!ctx.state.originInfo) {
    ctx.state.originInfo = {}
  }
  ctx.state.originInfo = {
    ...ctx.state.originInfo,
    ...item
  }
}

export function rewrite(ctx: IAppContext, modify: RedirectModify) {
  saveOriginInfo(ctx, {
    href: ctx.href
  })
  const newUrl = new URL(modify.value as string)
  ctx.state.requestOptions.headers.host = newUrl.host
  const url = ctx.state.requestOptions.url
  if (newUrl.protocol) {
    url.protocol = newUrl.protocol.replace(':', '')
  }
  url.host = newUrl.host
  if (newUrl.pathname) {
    url.pathname = newUrl.pathname
  }
}

export function requestHeaders(ctx: IAppContext, modify: HeaderModify) {
  saveOriginInfo(ctx, {
    headers: ctx.state.requestOptions.headers
  })
  const origHeaders = ctx.state.requestOptions.headers

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

export function requestBody(ctx: IAppContext, modify: BodyModify) {
  saveOriginInfo(ctx, {
    requestBody: ctx.state.requestBody
  })
  beforeModifyReqBody(ctx)
  // TODO: support other EditBodyType
  ctx.state.requestBody = editStream(ctx.state.requestBody, {
    type: EditBodyType.overwrite,
    content: modify.value
  })
}

export function _requestBodyWithOpt(ctx: IAppContext, option: EditBodyOption) {
  beforeModifyReqBody(ctx)
  ctx.state.requestBody = editStream(ctx.state.requestBody, option)
}

export async function requestFunction(ctx: IAppContext, modify: FunctionMoidfy) {
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
      requestHeaders: ctx.state.requestOptions.headers
    },
    modify.value
  )
  if (result) {
    if (result.headers) {
      ctx.state.requestOptions.headers = result.headers
    }
    requestBody(ctx, {
      type: RuleType.RequestBody,
      value: JSON.stringify(result.requestBody)
    })
  }
}

export function responseHeaders(ctx: IAppContext, modify: HeaderModify) {
  const origHeaders = ctx.state.responseHeaders

  for (const { name, value, type } of modify.value) {
    const key = name.toLowerCase()
    if (key === 'set-cookie') {
      let cookies = origHeaders[key] as string[]
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

export function responseStatus(ctx: IAppContext, statusModiy: ResponseStatusModify) {
  ctx.status = Number(statusModiy.value)
}

function beforeModifyReqBody(ctx: IAppContext) {
  if (ctx.state.requestOptions.headers) {
    delete ctx.state.requestOptions.headers['content-length']
  }
}

export function responseBody(ctx: IAppContext, bodyModify: BodyModify) {
  beforeModifyResBody(ctx)
  ctx.state.responseBody = editStream(ctx.state.responseBody, {
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
 * request speed limit
 * @param ctx
 * @param to x kB/s
 */
export function requestSpeedLimit(ctx: IAppContext, modify: SpeedLimitModify) {
  if (!modify.value) {
    return
  }
  ctx.state.requestBody = ctx.state.requestBody.pipe(
    new Transform({
      transform(chunk, encoding, callback) {
        setTimeout(callback.bind(null, null, chunk), chunk.length / modify.value)
      }
    })
  )
}

export function responseSpeedLimit(ctx: IAppContext, modify: SpeedLimitModify) {
  if (!modify) {
    return
  }
  ctx.state.responseBody = ctx.state.responseBody.pipe(
    new Transform({
      transform(chunk, encoding, callback) {
        setTimeout(callback.bind(null, null, chunk), chunk.length / modify.value)
      }
    })
  )
}

/**
 * Request delay
 * @param ctx
 * @param to 单位ms
 */
export function requestDelay(ctx: IAppContext, delayModify: DelayModify) {
  ctx.state.requestBody = streamDelay(ctx.state.requestBody, delayModify.value)
}

/**
 * Response delay
 * @param ctx
 * @param to ms
 */
export function responseDelay(ctx: IAppContext, delayModify: DelayModify) {
  ctx.state.responseBody = streamDelay(ctx.state.responseBody, delayModify.value)
}

const vmAxios = Axios.create({
  timeout: 10000
})

export async function responseFunction(ctx: IAppContext, modify: FunctionMoidfy) {
  const funStr = modify.value
  if (!funStr) {
    return
  }
  beforeModifyResBody(ctx)

  const oldStream = ctx.state.responseBody
  const newStream = new PassThrough()

  const oldStatus = ctx.status

  try {
    const resBuf = await toBuffer(oldStream)
    let response = resBuf.toString()

    ctx.status = oldStatus

    if ((ctx.state.responseHeaders['content-type'] as string)?.startsWith('application/json')) {
      response = getJson(response)
    }
    // else if (ctx.request.headers['accept']?.startsWith('application/json')) {
    //   response = getJson(response)
    // }

    const requestBody = ctx.state.log?.requestBody?.toString()
    const params = ctx.method === 'GET' ? ctx.request.query : getJson(requestBody as string)

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
        responseHeaders: ctx.state.responseHeaders,
        responseStatus: ctx.status
      },
      funStr
    )

    if (result) {
      const body = await result.responseBody
      ctx.status = Number(result.responseStatus)
      ctx.state.responseHeaders = result.responseHeaders
      newStream.end(typeof body === 'string' ? body : JSON.stringify(body))
      ctx.state.responseBody = newStream
    } else {
      // there is some error in the function
      ctx.state.responseBody = oldStream
    }
  } catch (e: any) {
    ctx.status = 500
    ctx.state.responseHeaders['content-type'] = 'text/plain; charset=utf-8'
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
 * All operations that modify the body need to call this method first, which does the following:
 * 1. Delete content-length
 * 2. Decompress responseBody
 *
 * @param ctx
 */
function beforeModifyResBody(ctx: IAppContext) {
  // 1. Modifying the response body will cause the length to change
  // 2. It is not convenient to calculate the final length, so simply use chunked output
  // nodejs http.Server will output by chunked if content-length is not set
  delete ctx.state.responseHeaders['content-length']
  // Decompress
  // Need to decompress before modifying the content
  const contentEncoding = ctx.state.responseHeaders['content-encoding']
  if (contentEncoding) {
    delete ctx.state.responseHeaders['content-encoding']
    if (contentEncoding === 'gzip') {
      ctx.state.responseBody = ctx.state.responseBody.pipe(createGunzip())
    } else if (contentEncoding === 'br') {
      ctx.state.responseBody = ctx.state.responseBody.pipe(createBrotliDecompress())
    } else {
      // The request has already limited to gzip and br, if other compression algorithms are encountered, they cannot be decompressed, so the internal content cannot be modified
      log.error('[BeforeModifyResBody] Content-encoding not support', contentEncoding)
    }
  }
}
