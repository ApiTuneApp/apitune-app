import { app } from 'electron'
import { Context, Next } from 'koa'
import path from 'node:path'
import { Worker } from 'node:worker_threads'

import { Log, RuleData, TestItem } from '../../../shared/contract'
import { LogTestResult } from '../../storage'
import { getBase64 } from '../helper'

// TODO: check production path
const mochaWoker = path.join(app.getAppPath(), 'src/main/workers/mocha-worker.js')
console.log('mochaWoker path', mochaWoker)

export default async function testScriptMiddleware(ctx: Context, next: Next) {
  await next()

  const requestBody = Buffer.from(ctx.log.requestBody, 'base64').toString()
  getBase64(ctx.responseBody).then((responseBodyInfo) => {
    const responseBody = Buffer.from(ctx.log.responseBody, 'base64').toString()
    const log = ctx.log as Log

    const matchedRuleDetails: Array<RuleData> = ctx.matchedRuleDetails
    const worker = new Worker(new URL(mochaWoker, import.meta.url), {
      workerData: {
        logId: ctx.log?.id,
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
            requestBodyLength: ctx.log.requestBodyLength,
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

    worker.on('message', (data: TestItem) => {
      console.log('Message received from worker:', data)
      LogTestResult.updateTestResult(data.logId, data)
    })

    worker.on('error', (error) => {
      console.error('Worker error:', error)
      // worker.terminate()
    })

    worker.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Worker stopped with exit code ${code}`)
      }
      worker.terminate()
    })
  })
}
