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

    // connect 请求返回握手 之前为了获取 head 已经返回过了，这里不再返回
    // socket.write('HTTP/1.1 200 OK\r\n\r\n');
  })

  socket.on('error', (err: Error) => {
    log.error('[makeTcpTunnel]error', err, otherOption?.url)
  })
}
