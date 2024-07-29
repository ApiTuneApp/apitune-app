const vm = require('node:vm')
const Mocha = require('mocha')
const log = require('electron-log')
const { expect } = require('chai')
const { workerData, parentPort } = require('worker_threads')

const mochaInstance = new Mocha()
let testCaseList = []
const testResult = []
const titleRuleMap = {}
let startTime = null

const at = {
  test: function (title, testFunc) {
    testCaseList.push({
      title,
      testFunc
    })
  }
}

const scriptParseContext = vm.createContext({
  expect,
  setTimeout,
  at,
  ...workerData.contexts
})

function testRunner(matchedRuleDetails) {
  let shouldRun = false

  for (const rule of matchedRuleDetails) {
    if (rule.testScript) {
      try {
        testCaseList = []
        vm.runInNewContext(rule.testScript, scriptParseContext)
        if (testCaseList && testCaseList.length) {
          const testResultItem = {
            ruleId: rule.id,
            cases: [],
            results: {
              passed: [],
              failed: []
            }
          }
          for (const testItem of testCaseList) {
            if (testItem && testItem.title && testItem.testFunc) {
              shouldRun = true
              // To make the test title unique
              const testTitle = `Rule: ${rule.id} - ${testItem.title}`
              mochaInstance.suite.addTest(new Mocha.Test(testTitle, testItem.testFunc))
              titleRuleMap[testTitle] = rule.id
            }
          }
          testResult.push(testResultItem)
        }
      } catch (error) {
        log.error('[TestWorker] Run scripts error', error)
      }
    }
  }

  if (shouldRun) {
    const results = {
      passed: [],
      failed: []
    }

    try {
      mochaInstance.allowUncaught(false)

      mochaInstance.uncaught = function (err) {
        log.error('[TestWorker] Test run error', err)
      }
      startTime = new Date().getTime()
      // Run the Mocha instance
      const runner = mochaInstance.run()
      runner.on('pass', (test) => {
        results.passed.push(test.title)
        const targetRuleId = titleRuleMap[test.title]
        const targetResult = testResult.find((result) => result.ruleId === targetRuleId)
        if (targetResult) {
          const title = test.title.split(' - ')[1]
          targetResult.cases.push({
            title: title
          })
          targetResult.results.passed.push({
            title: title
          })
        }
      })

      runner.on('fail', (test, err) => {
        results.failed.push({
          title: test.title,
          error: err.message
        })
        const targetRuleId = titleRuleMap[test.title]
        const targetResult = testResult.find((result) => result.ruleId === targetRuleId)
        if (targetResult) {
          const title = test.title.split(' - ')[1]
          targetResult.cases.push({
            title: title,
            error: err.message
          })
          targetResult.results.passed.push({
            title: title,
            error: err.message
          })
        }
      })

      runner.on('end', () => {
        parentPort.postMessage({
          logId: workerData.logId,
          tests: testResult,
          startTime,
          endTime: new Date().getTime()
        })

        log.debug('[TestWorker]Passed:', results.passed.length, 'tests')
        results.passed.forEach((testTitle) => log.debug(`[TestWorker]Success: ${testTitle}`))

        log.debug('[TestWorker]Failed:', results.failed.length, 'tests')
        results.failed.forEach(({ title, error }) =>
          log.debug(`[TestWorker]Failed: ${title}: ${error}`)
        )
      })
    } catch (error) {
      log.error('[TestWorker] Test run error', error)
    }
  }
}

if (workerData.matchedRuleDetails) {
  testRunner(workerData.matchedRuleDetails)
}
