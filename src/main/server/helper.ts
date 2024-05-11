import child_process from 'node:child_process'
import { Socket } from 'node:net'
import { finished, PassThrough, Stream } from 'node:stream'
import pako from 'pako'

import { BodyInfo, Log } from '../../shared/contract'
import config from './config'

const vm = require('vm')

/*
 * Detect TLS from first bytes of data
 * Inspired from https://gist.github.com/tg-x/835636
 * used heuristic:
 * - an incoming connection using SSLv3/TLSv1 records should start with 0x16
 * - an incoming connection using SSLv2 records should start with the record size
 *   and as the first record should not be very big we can expect 0x80 or 0x00 (the MSB is a flag)
 * - everything else is considered to be unencrypted
 */
export function isHttps(head: Buffer) {
  const head0 = head[0]
  return head0 === 0x16 || head0 === 0x80 || head0 === 0x00
}

export function toStream(chunk: string | Buffer) {
  const stream = new PassThrough()
  stream.write(chunk)
  stream.end()
  return stream
}

export function getWildcardDomain(domain: string) {
  const domainArr = domain.split('.')
  const length = domainArr.length
  const canWildcard =
    length > 3 ||
    (length === 3 &&
      // qq.com.cn 不可以变为 *.com.cn
      !(domainArr[length - 1].length === 2 && domainArr[length - 2].length <= 3))
  return canWildcard ? domainArr.slice(1).join('.') : domain
}

const socketList: { t: number; socket: Socket; cleaned?: boolean }[] = []

export function pipeSocket(from: Socket, to: Socket) {
  socketList.push({
    t: Date.now(),
    socket: from
  })
  from.setTimeout(20 * 1e3)
  from.setKeepAlive(false)
  from.on('data', (chunk) => {
    to.write(chunk)
  })

  const closeConnection = () => {
    from.end(() => {
      from.destroy()
    })
    to.end(() => {
      to.destroy()
    })

    // 2s 后强制 destroy 掉 socket
    setTimeout(() => {
      if (!from.destroyed) {
        console.log({
          t: new Date(),
          type: 'force-destroy-socket',
          localAddress: from.localAddress,
          localPort: from.localPort,
          remoteAddress: from.remoteAddress,
          remotePort: from.remotePort
        })
        from.destroy()
      }
      if (!to.destroyed) {
        console.log({
          t: new Date(),
          type: 'force-destroy-socket',
          localAddress: to.localAddress,
          localPort: to.localPort,
          remoteAddress: to.remoteAddress,
          remotePort: to.remotePort
        })
        to.destroy()
      }
    }, 2e3)
  }

  from.on('close', closeConnection)
  from.on('error', closeConnection)
  from.on('end', closeConnection)
  from.on('timeout', closeConnection)

  // 流结束后触发 end，避免 end close 等事件不触发
  const cleanup = finished(from, () => {
    closeConnection()
    cleanup()
  })
}

export function promisify(func: (...args: any[]) => any, inst?: any) {
  return (...args: any[]): Promise<any> => {
    return new Promise((resolve, reject) => {
      func.call(inst, ...args, (err: NodeJS.ErrnoException, res: any) => {
        err ? reject(err) : resolve(res)
      })
    })
  }
}

export function merge(baseObj: any, extendObj: any) {
  for (const key in extendObj) {
    baseObj[key] = extendObj[key]
  }

  return baseObj
}

export function execScriptSync(cmd: string) {
  let stdout,
    status = 0
  try {
    stdout = child_process.execSync(cmd)
  } catch (err: any) {
    stdout = err.stdout
    status = err.status
  }

  return {
    stdout: stdout.toString(),
    status
  }
}

interface GetBase64Result {
  length: number
  base64: Buffer
}

const emptyBuffer = Buffer.from('')

// 获取 stream buffer string 的 base64
export function getBase64(arg: any) {
  return new Promise<GetBase64Result>((resolve, reject) => {
    if (arg instanceof Stream) {
      const arr: Buffer[] = []
      let length = 0
      arg.on('data', (chunk) => {
        length += chunk.length
        if (config.MaxBodyLogSize) {
          if (length < config.MaxBodyLogSize) {
            arr.push(chunk)
          } else {
            arr.length = 0
          }
        } else {
          arr.push(chunk)
        }
      })
      arg.on('end', () => {
        const buf = Buffer.concat(arr)
        resolve({
          base64: buf,
          length: length
        })
      })
    } else if (arg instanceof Buffer) {
      resolve({
        base64: arg.length > config.MaxBodyLogSize ? emptyBuffer : arg,
        length: arg.length
      })
    } else {
      const buf = Buffer.from(arg, 'utf-8')
      resolve({
        length: buf.length,
        base64: buf.length > config.MaxBodyLogSize ? emptyBuffer : buf
      })
    }
  })
}

export function isTextBody(headers: Record<string, string> | undefined) {
  if (!headers) {
    return false
  }
  const type = (headers['content-type'] || '').split(';', 1)[0]
  if (!type) {
    return false
  }
  if (type.startsWith('text/')) {
    return true
  }
  if (
    [
      'application/javascript',
      'application/json',
      'application/x-javascript',
      'application/x-www-form-urlencoded'
    ].includes(type)
  ) {
    return true
  }
  return false
}

export function getBodyInfo(log: Log) {
  const { responseHeaders, responseBody, responseBodyLength } = log
  const type = responseHeaders ? (responseHeaders['content-type'] || '').split(';', 1)[0] : ''
  const result = {
    type
  } as BodyInfo

  if (responseBody) {
    let bodyText
    if (isTextBody(responseHeaders)) {
      try {
        const buf = Buffer.from(responseBody as unknown as string, 'base64')
        const contentEncoding = responseHeaders['content-encoding']
        if (!contentEncoding) {
          bodyText = buf.toString()
        } else if (contentEncoding === 'gzip') {
          bodyText = pako.inflate(buf, { to: 'string' })
        } else {
          throw new Error('wrong content-encoding: ' + contentEncoding)
        }
      } catch (e) {
        bodyText = '[ERROR] decode fail'
      }
      result.isTextBody = true
    } else {
      bodyText = `(binary body ${responseBodyLength} byte....)`
      result.isTextBody = false
    }
    if (type === 'application/json') {
      try {
        result.data = JSON.parse(bodyText)
        result.isJson = true
      } catch (e) {
        // json格式错误 直接展示原始string
      }
    }
    result.bodyText = bodyText
  }
  return result
}

export async function sandbox(sandbox: any, script: string) {
  try {
    sandbox = sandbox || {}
    const vmScript = new vm.Script(script)
    const context = new vm.createContext(sandbox)
    vmScript.runInContext(context, {
      timeout: 10000,
      displayErrors: true
    })
    return sandbox
  } catch (error) {
    console.log('sandbox error', error)
  }
}

export function getJson(data: string | null): any {
  if (!data) {
    return null
  }
  let result = data
  try {
    result = JSON.parse(data)
  } catch (error) {
    // console.log('getJson error', error)
  }
  return result
}
