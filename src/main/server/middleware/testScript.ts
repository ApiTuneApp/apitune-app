import * as electronLog from 'electron-log/main'
import { Context, Next } from 'koa'

import { Log, PrintItem, RuleData, TestItem } from '../../../shared/contract'
import { printLog, sendTestResult } from '../../communicator'
import { LogTestResult, SubscriptionStorage } from '../../storage'
import { getBase64 } from '../helper'

import mochaWorker from '../../workers/mocha-worker.js?nodeWorker'
import { MAX_FREE_RULES } from '../../../shared/constants'

export default async function testScriptMiddleware(ctx: Context, next: Next) {
  await next()
  const matchedRuleDetails: Array<RuleData> = ctx.state.matchedRuleDetails
  const shouldRunTest =
    matchedRuleDetails &&
    matchedRuleDetails.length > 0 &&
    matchedRuleDetails.some((rule) => rule.testScript)
  if (shouldRunTest) {
    const requestBody = Buffer.from(ctx.state.log.requestBody, 'base64').toString()
    getBase64(ctx.state.responseBody).then((responseBody) => {
      // const responseBody = Buffer.from(ctx.state.log.responseBody, 'base64').toString()
      const log = ctx.state.log as Log

      const worker = mochaWorker({
        workerData: {
          logId: ctx.state.log?.id,
          matchedRuleDetails,
          subscriptionActive: SubscriptionStorage.checkActive(),
          maxFreeRules: MAX_FREE_RULES,
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
              responseBodyLength: responseBody.length,
              responseBody: log.responseBodyInfo?.isJson
                ? log.responseBodyInfo.data
                : log.responseBodyInfo?.bodyText
            }
          }
        }
      })

      worker.on('message', (data: TestItem | PrintItem) => {
        electronLog.info('[TestScript] Worker result:', data)
        if ((data as TestItem).tests) {
          sendTestResult(data as TestItem)
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
}
