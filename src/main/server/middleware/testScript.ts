import { app } from 'electron'
import * as electronLog from 'electron-log/main'
import { Context, Next } from 'koa'
import path from 'node:path'
import { Worker } from 'node:worker_threads'

import { Log, PrintItem, RuleData, TestItem } from '../../../shared/contract'
import { printLog } from '../../communicator'
import { LogTestResult } from '../../storage'
import { getBase64 } from '../helper'

// TODO: check production path
const mochaWoker = path.join(app.getAppPath(), 'src/main/workers/mocha-worker.js')
electronLog.info('[TestScript] mochaWoker path', mochaWoker)

export default async function testScriptMiddleware(ctx: Context, next: Next) {
  await next()

  const requestBody = Buffer.from(ctx.state.log.requestBody, 'base64').toString()
  getBase64(ctx.state.responseBody).then((responseBodyInfo) => {
    const responseBody = Buffer.from(ctx.state.log.responseBody, 'base64').toString()
    const log = ctx.state.log as Log

    const matchedRuleDetails: Array<RuleData> = ctx.state.matchedRuleDetails
    const worker = new Worker(new URL(mochaWoker, import.meta.url), {
      workerData: {
        logId: ctx.state.log?.id,
        matchedRuleDetails,
        contexts: {
          ...log,
          request: {
            protocol: log.protocol,
            urL: log.url,
            host: log.host,
            method: log.method,
            ip: log.clientIp,
            clientPort: log.clientPort,
            headers: log.requestHeaders,
            startTime: log.startTime,
            requestBodyLength: ctx.state.log.requestBodyLength,
            requestBody
          },
          response: {
            status: log.status,
            message: log.message,
            headers: log.responseHeaders,
            remoteIp: log.remoteIp,
            remotePort: log.remotePort,
            responeseType: log.responeseType,
            finishTime: log.finishTime,
            responseBodyLength: responseBodyInfo.length,
            responseBody
          }
        }
      }
    })

    worker.on('message', (data: TestItem | PrintItem) => {
      electronLog.info('[TestScript] Worker result:', data)
      if ((data as TestItem).tests) {
        LogTestResult.updateTestResult(data.logId, data as TestItem)
      } else {
        printLog(data as PrintItem)
      }
    })

    worker.on('error', (error) => {
      electronLog.error('[TestScript] Worker error:', error)
      // worker.terminate()
    })

    worker.on('exit', (code) => {
      if (code !== 0) {
        electronLog.error(`[TestScript] Worker stopped with exit code ${code}`)
      }
      worker.terminate()
    })
  })
}
