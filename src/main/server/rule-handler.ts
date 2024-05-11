import { Context } from 'koa'
import replaceStream from 'replacestream'
import { PassThrough, Readable, Stream, Transform } from 'stream'
import { createBrotliDecompress, createGunzip } from 'zlib'

import { EditBodyOption, EditBodyType } from './contracts'
import { toStream } from './helper'
import { HeaderItem, RuleChangeItem, RuleData } from '../../shared/contract'

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

export function rewrite(ctx: Context, changeItem: RuleChangeItem) {
  saveOriginInfo(ctx, {
    href: ctx.href
  })
  const newUrl = new URL(changeItem.value as string)
  ctx.remoteRequestOptions.headers.host = newUrl.host
  const url = ctx.remoteRequestOptions.url
  if (newUrl.protocol) {
    url.protocol = newUrl.protocol.replace(':', '')
  }
  url.host = newUrl.host
  url.pathname = newUrl.pathname
}

export function requestHeaders(ctx: Context, changeItem: RuleChangeItem) {
  saveOriginInfo(ctx, {
    headers: ctx.remoteRequestOptions.headers
  })
  const origHeaders = ctx.remoteRequestOptions.headers

  for (const { name, value, type } of changeItem.value as HeaderItem[]) {
    if (type === 'add') {
      origHeaders[name] = value
    } else if (type === 'override') {
      origHeaders[name] = value
    } else if (type === 'remove') {
      delete origHeaders[name]
    }
  }
}

export function requestBody(ctx: Context) {
  beforeModifyReqBody(ctx)
}

export function responseStatus(ctx: Context, status: number) {
  ctx.status = +status
}

function beforeModifyReqBody(ctx: Context) {
  delete ctx.remoteRequestOptions.headers['content-length']
}

export function responseBody(ctx: Context, option: EditBodyOption) {
  beforeModifyResBody(ctx)
  ctx.responseBody = editStream(ctx.responseBody, option)
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
export function requestSpeedLimit(ctx: Context, to: number) {
  if (!to) {
    return
  }
  ctx.remoteRequestBody = ctx.remoteRequestBody.pipe(
    new Transform({
      transform(chunk, encoding, callback) {
        setTimeout(callback.bind(null, null, chunk), chunk.length / to)
      }
    })
  )
}

/**
 * 响应限速
 * @param ctx
 * @param to x kB/s
 */
export function responseSpeedLimit(ctx: Context, to: number) {
  if (!to) {
    return
  }
  ctx.responseBody = ctx.responseBody.pipe(
    new Transform({
      transform(chunk, encoding, callback) {
        setTimeout(callback.bind(null, null, chunk), chunk.length / to)
      }
    })
  )
}

/**
 * 请求延迟
 * @param ctx
 * @param to 单位ms
 */
export function requestDelay(ctx: Context, to: number) {
  ctx.remoteRequestBody = streamDelay(ctx.remoteRequestBody, to)
}

/**
 * 响应延迟
 * @param ctx
 * @param to 单位ms
 */
export function responseDelay(ctx: Context, to: number) {
  ctx.responseBody = streamDelay(ctx.responseBody, to)
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
