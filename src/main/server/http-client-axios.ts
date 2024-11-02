import log from 'electron-log/main'
import axios, { AxiosInstance } from 'axios'
import { IAppContext } from '../contracts'
import config from './config'
import { toStream } from './helper'

// Create axios instance with default config
const axiosInstance: AxiosInstance = axios.create({
  timeout: config.serverRequestTimeout,
  validateStatus: () => true, // Allow all status codes
  maxRedirects: 0,
  httpAgent: false,
  httpsAgent: false
})

export default async function (ctx: IAppContext): Promise<void> {
  const remoteOptions = ctx.state.requestOptions
  const url = remoteOptions.url.href
  const headers = { ...remoteOptions.headers }

  // Remove proxy headers
  Object.keys(headers).forEach((key) => {
    if (key.startsWith('proxy-')) {
      delete headers[key]
    }
  })

  // Add proxy flag
  headers[config.proxyHeader] = '1'

  try {
    const response = await axiosInstance({
      method: ctx.method as any,
      url: url,
      headers: headers,
      data: ctx.state.requestBody,
      responseType: 'stream'
    })

    // Set response context
    ctx.state.remoteIp = response.request.socket.remoteAddress
    ctx.state.remotePort = response.request.socket.remotePort
    ctx.status = response.status
    ctx.message = response.statusText
    ctx.state.responseHeaders = response.headers as any
    ctx.state.responseBody = response.data

    log.info('[HttpClient] Server response', ctx.status, ctx.message, url)
  } catch (error: any) {
    // Handle errors
    const status = error.code === 'ECONNABORTED' ? 504 : 502
    const statusMessage =
      error.code === 'ECONNABORTED'
        ? `${config.name} upstream timeout`
        : `${config.name} upstream error`

    ctx.state.responseHeaders = {
      'content-type': 'text/plain;charset=utf-8'
    }
    ctx.status = status
    ctx.message = statusMessage
    ctx.state.responseBody = toStream(
      `${config.name} request target server failed: ${error.message}`
    )

    log.error('[HttpClient] Server request error', status, error.message, url)
  }
}
