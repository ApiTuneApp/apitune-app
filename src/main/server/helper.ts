import { PassThrough, finished } from 'node:stream'
import { Socket } from 'node:net'
import child_process from 'node:child_process'

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
