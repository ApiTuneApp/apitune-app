import { expect } from 'chai'
import { app } from 'electron'
import { Context, Next } from 'koa'
import Mocha from 'mocha'
import path from 'node:path'
import vm from 'node:vm'
import { Worker } from 'node:worker_threads'

import { RuleData } from '../../../shared/contract'

// TODO: check production path
const mochaWoker = path.join(app.getAppPath(), 'src/main/workers/mocha-worker.js')
console.log('mochaWoker path', mochaWoker)

// Create a Mocha instance
const mochaInstance = new Mocha()
const testMap = [] as Array<{
  title: string
  testFunc: () => void
}>

const at = {
  test: function (title, testFunc) {
    testMap.push({
      title,
      testFunc
    })
  }
}

const scriptParseContext = vm.createContext({
  expect,
  setTimeout,
  at
})

export default async function testScriptMiddleware(ctx: Context, next: Next) {
  next()

  const matchedRuleDetails: Array<RuleData> = ctx.matchedRuleDetails

  let shouldRun = false

  for (const rule of matchedRuleDetails) {
    if (rule.testScript) {
      try {
        vm.runInNewContext(rule.testScript, scriptParseContext)
        if (testMap && testMap.length) {
          for (const testItem of testMap) {
            if (testItem && testItem.title && testItem.testFunc) {
              shouldRun = true
              mochaInstance.suite.addTest(new Mocha.Test(testItem.title, testItem.testFunc))
            }
          }
        }
      } catch (error) {
        console.error('An error occurred:', error)
      }
    }
  }

  const worker = new Worker(new URL(mochaWoker, import.meta.url), {
    workerData: {
      matchedRuleDetails
    }
  })

  worker.on('message', (data) => {
    console.log('Message received from worker:', data)
  })

  worker.on('error', (error) => {
    console.error('Worker error:', error)
    worker.terminate()
  })

  worker.on('exit', (code) => {
    if (code !== 0) {
      console.error(`Worker stopped with exit code ${code}`)
    }
    worker.terminate()
  })
}
