import { app } from 'electron'
import { Context, Next } from 'koa'
import path from 'node:path'
import { Worker } from 'node:worker_threads'

import { RuleData, TestItem } from '../../../shared/contract'
import { LogTestResult } from '../../storage'

// TODO: check production path
const mochaWoker = path.join(app.getAppPath(), 'src/main/workers/mocha-worker.js')
console.log('mochaWoker path', mochaWoker)

export default async function testScriptMiddleware(ctx: Context, next: Next) {
  next()

  const matchedRuleDetails: Array<RuleData> = ctx.matchedRuleDetails
  const worker = new Worker(new URL(mochaWoker, import.meta.url), {
    workerData: {
      logId: ctx.log?.id,
      matchedRuleDetails
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
}
