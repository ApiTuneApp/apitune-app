import log from 'electron-log/main'
import { connect, NetConnectOpts, Socket } from 'net'

import { pipeSocket } from './helper'

export function makeTcpTunnel(
  socket: Socket,
  head: Buffer,
  options: NetConnectOpts,
  otherOption?: any
) {
  // tcp 层代理到 中间服务器
  const conn = connect(options, () => {
    conn.write(head)
    pipeSocket(conn, socket)
    pipeSocket(socket, conn)
  })

  socket.on('error', (err: Error) => {
    log.error('[makeTcpTunnel] error', err, otherOption?.url)
  })
}

export function makeTcpTunnel2(
  socket: Socket,
  head: Buffer,
  options: NetConnectOpts,
  otherOption?: {
    url?: string
    noLog?: boolean
    onData?: (fromClient: boolean, chunk: Buffer) => void
    onEnd?: () => void
  }
) {
  const conn = connect(options, () => {
    conn.write(head)

    socket.on('data', (chunk) => {
      conn.write(chunk)
      otherOption?.onData?.(true, chunk)
    })

    conn.on('data', (chunk) => {
      socket.write(chunk)
      otherOption?.onData?.(false, chunk)
    })

    conn.on('end', () => {
      otherOption?.onEnd?.()
    })
  })

  socket.on('error', (err: Error) => {
    log.error('[makeTcpTunnel] error', err, otherOption?.url)
  })
}
